import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const maxDuration = 20;
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BUCKET = 'viviannepag-assets';

// Endpoint rapido: le APENAS os result.json de cada job em renders/.
// Cada result.json ja tem o array "uploaded" com {dia, idx, tipo, filename, url}.
// Evita listar pastas/ficheiros do storage (que e o que torna /biblioteca lento).

type RenderItem = {
  jobId: string;
  dia: number;
  slideIdx: number;
  tipo: string;
  url: string;
  urlJpg?: string;
};

type JobSummary = {
  jobId: string;
  status: string;
  progress?: number;
  total?: number;
  zipUrl?: string;
  iniciadoEm?: string;
  terminadoEm?: string;
  uploaded?: number;
  skipped?: number;
  failed?: number;
};

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const supabase = getSupabaseAdmin();

  const { data: jobsList } = await supabase.storage.from(BUCKET).list('renders', { limit: 200 });
  const jobIds = (jobsList ?? [])
    .map(j => j.name)
    .filter((n): n is string => !!n && (n.startsWith('render-') || n.startsWith('job-') || n.startsWith('reels-')));

  // Download em paralelo de todos os result.json
  const results = await Promise.allSettled(
    jobIds.map(async jobId => {
      const { data, error } = await supabase.storage.from(BUCKET).download(`renders/${jobId}/result.json`);
      if (error || !data) return null;
      try {
        const r = JSON.parse(await data.text());
        return { jobId, r };
      } catch {
        return null;
      }
    }),
  );

  const renders: RenderItem[] = [];
  const jobs: JobSummary[] = [];

  for (const res of results) {
    if (res.status !== 'fulfilled' || !res.value) continue;
    const { jobId, r } = res.value;
    jobs.push({
      jobId,
      status: r.status ?? 'desconhecido',
      progress: r.progress,
      total: r.total,
      zipUrl: r.zipUrl,
      iniciadoEm: r.iniciadoEm,
      terminadoEm: r.terminadoEm,
      uploaded: Array.isArray(r.uploaded) ? r.uploaded.length : 0,
      skipped: Array.isArray(r.skipped) ? r.skipped.length : 0,
      failed: Array.isArray(r.failed) ? r.failed.length : 0,
    });
    const todos = [...(r.uploaded ?? []), ...(r.skipped ?? [])];
    for (const f of todos) {
      if (typeof f?.dia !== 'number' || typeof f?.idx !== 'number' || !f?.url) continue;
      renders.push({
        jobId,
        dia: f.dia,
        slideIdx: f.idx,
        tipo: String(f.tipo ?? ''),
        url: String(f.url),
        urlJpg: f.urlJpg ? String(f.urlJpg) : undefined,
      });
    }
  }

  jobs.sort((a, b) => (b.iniciadoEm ?? '').localeCompare(a.iniciadoEm ?? ''));

  return NextResponse.json({ renders, jobs }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
