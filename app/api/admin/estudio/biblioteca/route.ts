import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const maxDuration = 30;

const BUCKET = 'viviannepag-assets';

type ImagemFonte = {
  path: string;
  url: string;
  mundo: string;
  dia: number;
  slideIdx: number;
  layout: string;
  ts: number;
};

type RenderFinal = {
  path: string;
  url: string;
  jobId: string;
  dia: number;
  slideIdx: number;
  tipo: string;
};

type Job = {
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

  // 1. Imagens fonte (estudio/{mundo}/dia-N/slide-IDX-LAYOUT-TS.jpg)
  const imagensFonte: ImagemFonte[] = [];
  try {
    const { data: mundos } = await supabase.storage.from(BUCKET).list('estudio', { limit: 100 });
    for (const m of mundos ?? []) {
      if (!m.name) continue;
      const { data: dias } = await supabase.storage.from(BUCKET).list(`estudio/${m.name}`, { limit: 100 });
      for (const d of dias ?? []) {
        if (!d.name?.startsWith('dia-')) continue;
        const diaNum = Number(d.name.replace('dia-', ''));
        const { data: files } = await supabase.storage.from(BUCKET).list(`estudio/${m.name}/${d.name}`, { limit: 100 });
        for (const f of files ?? []) {
          const m2 = f.name?.match(/^slide-(\d+)-(.+)-(\d{10,13})\.jpg$/);
          if (!m2) continue;
          const path = `estudio/${m.name}/${d.name}/${f.name}`;
          const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
          imagensFonte.push({
            path,
            url,
            mundo: m.name,
            dia: diaNum,
            slideIdx: Number(m2[1]),
            layout: m2[2],
            ts: Number(m2[3]),
          });
        }
      }
    }
  } catch (e) {
    console.error('biblioteca fonte:', e);
  }

  // 2. Renders finais (renders/JOB_ID/dia-NN/slide-NN-TIPO.png)
  const rendersFinais: RenderFinal[] = [];
  const jobs: Job[] = [];
  try {
    const { data: jobsList } = await supabase.storage.from(BUCKET).list('renders', { limit: 100 });
    for (const j of jobsList ?? []) {
      if (!j.name?.startsWith('render-') && !j.name?.startsWith('job-') && !j.name?.startsWith('reels-')) continue;

      // Le result.json se existe
      try {
        const { data: resultData } = await supabase.storage.from(BUCKET).download(`renders/${j.name}/result.json`);
        if (resultData) {
          const r = JSON.parse(await resultData.text());
          jobs.push({
            jobId: j.name,
            status: r.status,
            progress: r.progress,
            total: r.total,
            zipUrl: r.zipUrl,
            iniciadoEm: r.iniciadoEm,
            terminadoEm: r.terminadoEm,
            uploaded: Array.isArray(r.uploaded) ? r.uploaded.length : 0,
            skipped: Array.isArray(r.skipped) ? r.skipped.length : 0,
            failed: Array.isArray(r.failed) ? r.failed.length : 0,
          });
        }
      } catch {}

      // Lista os PNG render no job
      const { data: diasFold } = await supabase.storage.from(BUCKET).list(`renders/${j.name}`, { limit: 100 });
      for (const d of diasFold ?? []) {
        if (!d.name?.startsWith('dia-')) continue;
        const diaNum = Number(d.name.replace('dia-', ''));
        const { data: files } = await supabase.storage.from(BUCKET).list(`renders/${j.name}/${d.name}`, { limit: 100 });
        for (const f of files ?? []) {
          const m2 = f.name?.match(/^slide-(\d+)-(.+)\.(png|jpg|jpeg)$/);
          if (!m2) continue;
          const path = `renders/${j.name}/${d.name}/${f.name}`;
          const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
          rendersFinais.push({
            path,
            url,
            jobId: j.name,
            dia: diaNum,
            slideIdx: Number(m2[1]) - 1,
            tipo: m2[2],
          });
        }
      }
    }
  } catch (e) {
    console.error('biblioteca renders:', e);
  }

  imagensFonte.sort((a, b) => a.dia - b.dia || a.slideIdx - b.slideIdx);
  rendersFinais.sort((a, b) => a.dia - b.dia || a.slideIdx - b.slideIdx);
  jobs.sort((a, b) => (b.iniciadoEm ?? '').localeCompare(a.iniciadoEm ?? ''));

  return NextResponse.json({ imagensFonte, rendersFinais, jobs });
}
