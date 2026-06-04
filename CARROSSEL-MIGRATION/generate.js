import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * GET /api/admin/colecoes/videos/list
 *
 * Lista todos os render-jobs concluídos lendo Supabase Storage:
 * course-assets/render-jobs/*-result.json. Filtra os que estão `done` +
 * têm videos[]. Para cada job tenta também ler o manifest
 * (course-assets/render-jobs/<jobId>.json) e juntar a propriedade
 * `content.dias` para podermos gerar legendas client-side.
 * Retorna ordenado do mais recente para o mais antigo.
 */
export async function GET() {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ erro: "Supabase admin indisponível" }, { status: 500 });
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) {
    return NextResponse.json({ erro: "NEXT_PUBLIC_SUPABASE_URL em falta" }, { status: 500 });
  }

  const { data: files, error } = await admin.storage
    .from("course-assets")
    .list("render-jobs", { limit: 1000, sortBy: { column: "created_at", order: "desc" } });

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });

  const resultFiles = (files || []).filter((f) => f.name.endsWith("-result.json"));

  const jobs = await Promise.all(
    resultFiles.map(async (f) => {
      try {
        const url = `${base}/storage/v1/object/public/course-assets/render-jobs/${encodeURIComponent(f.name)}?t=${Date.now()}`;
        const r = await fetch(url, { cache: "no-store" });
        if (!r.ok) return null;
        const data = await r.json();
        if (data?.status !== "done" || !Array.isArray(data?.videos) || data.videos.length === 0) {
          return null;
        }
        // Tenta enriquecer com manifest (para podermos gerar legendas)
        const manifestName = f.name.replace(/-result\.json$/, ".json");
        try {
          const mUrl = `${base}/storage/v1/object/public/course-assets/render-jobs/${encodeURIComponent(manifestName)}?t=${Date.now()}`;
          const mRes = await fetch(mUrl, { cache: "no-store" });
          if (mRes.ok) {
            const manifest = await mRes.json();
            if (manifest?.content?.dias) {
              data.dias = manifest.content.dias;
              data.campanha = manifest.content.campanha;
            }
          }
        } catch {}
        return data;
      } catch {
        return null;
      }
    })
  );

  const done = jobs.filter((j) => !!j);

  return NextResponse.json({ items: done });
}
