import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/colecoes/videos/delete
 *
 * Body:
 *   { jobId: string, file?: string }
 *
 * Sem `file` → apaga TUDO do job (mp4s + pngs + mp3s + manifest +
 * result.json). Com `file` → apaga apenas esse mp4 e remove a entrada
 * de videos[] em result.json.
 */
export async function POST(req: NextRequest) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ erro: "Supabase admin indisponível" }, { status: 500 });
  }

  let body: { jobId?: string; file?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }
  const jobId = (body.jobId || "").trim();
  if (!jobId) return NextResponse.json({ erro: "jobId obrigatório" }, { status: 400 });

  // Validação básica do jobId — não queremos remover paths arbitrários
  if (!/^[a-z0-9_-]+$/i.test(jobId)) {
    return NextResponse.json({ erro: "jobId inválido" }, { status: 400 });
  }

  const bucket = admin.storage.from("course-assets");

  if (body.file) {
    const file = body.file;
    if (!/^[a-z0-9_.\-]+$/i.test(file)) {
      return NextResponse.json({ erro: "file inválido" }, { status: 400 });
    }
    // Apaga só o mp4
    const path = `carrossel-veus/${jobId}/videos/${file}`;
    const { error: rmErr } = await bucket.remove([path]);
    if (rmErr) return NextResponse.json({ erro: rmErr.message }, { status: 500 });

    // Actualiza result.json — remove entrada do videos[]
    const resultPath = `render-jobs/${jobId}-result.json`;
    try {
      const { data: blob } = await bucket.download(resultPath);
      if (blob) {
        const text = await blob.text();
        const result = JSON.parse(text);
        if (Array.isArray(result.videos)) {
          result.videos = result.videos.filter((v: { file: string }) => v.file !== file);
        }
        await bucket.upload(resultPath, JSON.stringify(result, null, 2), {
          contentType: "application/json",
          upsert: true,
        });
      }
    } catch {
      // result.json pode não existir; ok
    }
    return NextResponse.json({ ok: true });
  }

  // Apaga job inteiro: caminha em todas as pastas conhecidas
  const allPaths: string[] = [];

  async function collect(prefix: string) {
    const { data, error } = await bucket.list(prefix, { limit: 1000 });
    if (error || !data) return;
    for (const item of data) {
      // Em Supabase Storage, "folders" virtuais têm id=null e metadata=null
      if (item.id === null) {
        await collect(`${prefix}/${item.name}`);
      } else {
        allPaths.push(`${prefix}/${item.name}`);
      }
    }
  }

  await collect(`carrossel-veus/${jobId}`);
  // manifest + result
  allPaths.push(`render-jobs/${jobId}.json`);
  allPaths.push(`render-jobs/${jobId}-result.json`);

  if (allPaths.length > 0) {
    // Supabase remove aceita máximo de ~100 por chamada, partilhamos em batches
    const batchSize = 50;
    for (let i = 0; i < allPaths.length; i += batchSize) {
      const batch = allPaths.slice(i, i + batchSize);
      const { error } = await bucket.remove(batch);
      if (error) {
        return NextResponse.json(
          { erro: `Apagar ${batch[0]}…: ${error.message}`, deletedSoFar: i },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ ok: true, deleted: allPaths.length });
}
