import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type Video = { file: string; url: string; sizeBytes?: number };
type RenderResult = {
  jobId: string;
  status?: string;
  videos?: Video[];
  completedAt?: string;
  campanha?: string;
};

/**
 * GET /api/admin/carrossel-veus/list-renders
 *
 * Lista todos os render-jobs completos (course-assets/render-jobs/*-result.json),
 * ordenados do mais recente para o mais antigo. Cada item devolve os
 * MP4s prontos (1080×1920) para uso no exportador Metricool.
 *
 * Returns: { jobs: RenderResult[] }
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: files, error } = await supabase.storage
    .from("course-assets")
    .list("render-jobs", {
      limit: 200,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  const resultFiles = (files || [])
    .filter((f) => f.name?.endsWith("-result.json"))
    .slice(0, 30); // últimos 30 jobs

  const jobs: RenderResult[] = [];
  for (const f of resultFiles) {
    const url = `${supabaseUrl}/storage/v1/object/public/course-assets/render-jobs/${f.name}?t=${Date.now()}`;
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = (await res.json()) as RenderResult;
      // Só jobs que produziram vídeos
      if (Array.isArray(data.videos) && data.videos.length > 0) {
        // Filtra apenas jobs que parecem ser de carrossel (URLs em /carrossel-veus/)
        const isCarrossel = data.videos.some((v) =>
          v.url?.includes("/carrossel-veus/")
        );
        if (isCarrossel) {
          jobs.push({
            jobId: data.jobId || f.name.replace(/-result\.json$/, ""),
            status: data.status,
            videos: data.videos,
            completedAt: data.completedAt ?? f.created_at ?? undefined,
            campanha: data.campanha,
          });
        }
      }
    } catch {
      /* ignora */
    }
  }

  return NextResponse.json({ jobs });
}
