import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { themeById, type CarouselTheme } from "@/lib/carousel-themes";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/carrossel-veus/render-submit
 *
 * Recebe os 42 áudios já gerados (URLs Supabase) + escolha de música,
 * escreve manifest em course-assets/render-jobs/<jobId>.json e dispara
 * o workflow render-carrossel-veus.yml. O workflow só faz Puppeteer
 * (PNGs) + ffmpeg (MP4) — não chama ElevenLabs.
 *
 * Body: {
 *   jobId,
 *   audios: Array<{ dia: number, slide: number, url: string }>, // 42
 *   musicUrl?: string,
 *   musicVolume?: number
 * }
 *
 * Returns: { jobId, manifestUrl, workflowRunUrl }
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    jobId?: string;
    audios?: Array<{ dia: number; slide: number; url: string }>;
    musicUrl?: string;
    musicVolume?: number;
    withoutVoice?: boolean;
    slideDuration?: number;
    dias?: number[] | null; // se presente: só estes dias (ex: [3]); senão: todos
    content?: { campanha: string; dias: unknown[] }; // override do content.json
    theme?: Record<string, unknown>; // paleta escolhida (CarouselTheme) — injectada como CSS vars no Puppeteer
  };

  const jobId = (body.jobId || "").trim();
  if (!jobId) {
    return NextResponse.json({ erro: "jobId obrigatório" }, { status: 400 });
  }

  const withoutVoice = !!body.withoutVoice;
  const audios = Array.isArray(body.audios) ? body.audios : [];

  // dias: lista de dias (1-7) a renderizar. Se omitido, todos os 7.
  const diasFiltrados = Array.isArray(body.dias) && body.dias.length > 0
    ? body.dias.filter((n) => Number.isFinite(n) && n >= 1 && n <= 7)
    : null;

  // Quando há voz, esperamos um áudio por slide dos dias pedidos (6 por dia).
  // Se dias=null (todos), tem de haver 42. Se dias=[3], tem de haver 6 desse dia.
  if (!withoutVoice) {
    const expectedDias = diasFiltrados ?? [1, 2, 3, 4, 5, 6, 7];
    const expectedCount = expectedDias.length * 6;
    const presentForExpected = audios.filter((a) => expectedDias.includes(a.dia)).length;
    if (presentForExpected !== expectedCount) {
      return NextResponse.json(
        {
          erro: `audios[] esperava ${expectedCount} entradas (6 × ${expectedDias.length} dia(s)); recebi ${presentForExpected}. Ou marca "sem voz".`,
        },
        { status: 400 }
      );
    }
  }

  const musicUrl = (body.musicUrl || "").trim();
  const musicVolume = clamp(Number(body.musicVolume ?? 0.4), 0, 1);
  const slideDuration = clamp(Number(body.slideDuration ?? 8), 3, 20);

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { erro: "SUPABASE_SERVICE_ROLE_KEY nao configurada." },
      { status: 500 }
    );
  }

  // Resolve a paleta com 2 estratégias (defensivas, para tolerar cache de
  // bundle cliente desactualizado):
  //   1) Cliente envia o objecto theme completo no body — usa esse.
  //   2) Caso não venha, infere o slug do jobId (`${slug}-${timestamp}`),
  //      lê a colecção do DB e expande o theme.id em CarouselTheme.
  const themeKeys = ["id", "ink", "ivory", "parchmentDark", "deep", "deepWarm", "terracotta", "gold", "mist"] as const;
  let themePayload: CarouselTheme | null = null;
  if (body.theme && typeof body.theme === "object" && themeKeys.every((k) => typeof body.theme![k] === "string")) {
    themePayload = body.theme as unknown as CarouselTheme;
  } else {
    const slugMatch = jobId.match(/^(.+)-\d+$/);
    const inferredSlug = slugMatch ? slugMatch[1] : null;
    if (inferredSlug) {
      const { data: col } = await admin
        .from("carousel_collections")
        .select("theme")
        .eq("slug", inferredSlug)
        .maybeSingle();
      const themeId =
        col && col.theme && typeof col.theme === "object" && typeof (col.theme as { id?: unknown }).id === "string"
          ? ((col.theme as { id: string }).id)
          : null;
      if (themeId) themePayload = themeById(themeId);
    }
  }

  // Manifest: lido pelo workflow para saber quais áudios descarregar
  const manifest = {
    jobId,
    audios,
    musicUrl: musicUrl || null,
    musicVolume,
    withoutVoice,
    slideDuration,
    dias: diasFiltrados, // null = todos
    content: body.content && Array.isArray(body.content.dias) ? body.content : null,
    theme: themePayload,
    createdAt: new Date().toISOString(),
  };
  const manifestPath = `render-jobs/${jobId}.json`;
  const { error: mErr } = await admin.storage
    .from("course-assets")
    .upload(manifestPath, JSON.stringify(manifest, null, 2), {
      contentType: "application/json",
      upsert: true,
    });
  if (mErr) {
    return NextResponse.json(
      { erro: `Upload manifest falhou: ${mErr.message}` },
      { status: 500 }
    );
  }

  // Estado inicial — UI faz polling
  const initial = {
    jobId,
    status: "queued",
    progress: 0,
    musicUrl: musicUrl || null,
    musicVolume,
    createdAt: new Date().toISOString(),
  };
  const { error: rErr } = await admin.storage
    .from("course-assets")
    .upload(`render-jobs/${jobId}-result.json`, JSON.stringify(initial, null, 2), {
      contentType: "application/json",
      upsert: true,
    });
  if (rErr) {
    return NextResponse.json(
      { erro: `Upload result inicial falhou: ${rErr.message}` },
      { status: 500 }
    );
  }

  // Dispatch workflow (passa só jobId — o resto vem do manifest)
  const owner = process.env.GITHUB_REPO_OWNER || "vivnasc";
  const repo = process.env.GITHUB_REPO_NAME || "escola-veus";
  const workflowFile = "render-carrossel-veus.yml";
  const ref = process.env.GITHUB_DISPATCH_REF || "main";
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    return NextResponse.json(
      { erro: "GITHUB_DISPATCH_TOKEN nao configurada." },
      { status: 500 }
    );
  }

  const dispatchUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/dispatches`;
  const ghRes = await fetch(dispatchUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ref,
      inputs: {
        jobId,
        dias: diasFiltrados ? diasFiltrados.join(" ") : "",
      },
    }),
  });
  if (!ghRes.ok) {
    const errText = await ghRes.text();
    return NextResponse.json(
      { erro: `GitHub dispatch falhou (${ghRes.status}): ${errText.slice(0, 400)}` },
      { status: 502 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return NextResponse.json({
    jobId,
    manifestUrl: `${supabaseUrl}/storage/v1/object/public/course-assets/${manifestPath}`,
    workflowRunUrl: `https://github.com/${owner}/${repo}/actions/workflows/${workflowFile}`,
  });
}

function clamp(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}
