import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarCaptionInstagram } from '@/lib/estudio-export';
import type { ConteudoDia } from '@/lib/estudio-conteudo';

export const runtime = 'nodejs';

// POST { slug, segunda: 'YYYY-MM-DD', hora? } — "abre" uma semana de carrosséis
// da Loja (coleção semana-N, com vários dias) em POSTS-DE-UM-DIA, cada um na sua
// data (seg→dom a partir de `segunda`). Cada um vira um post normal (marca=loja,
// reel MP4) que o resto da ferramenta (aprovar/publicar/robô) já trata igual.

function maisDias(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

type Dia = { dia?: number; videoUrl?: string; imagens?: string[]; palavra?: string; hashtags?: string[] };

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { slug, segunda, hora = '13:00' } = (await req.json().catch(() => ({}))) as { slug?: string; segunda?: string; hora?: string };
  if (!slug || !segunda) return NextResponse.json({ erro: 'falta slug ou segunda' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('carousel_collections').select('slug, title, dias, theme').eq('slug', slug).single();
  if (error || !data) return NextResponse.json({ erro: 'db', detalhe: error?.message ?? 'não encontrado' }, { status: 404 });

  const dias = (data.dias as Dia[] | undefined) ?? [];
  const universo = (data.theme as { universo?: string } | undefined)?.universo ?? '';
  const comVideo = dias.filter((d) => d.videoUrl);
  if (comVideo.length === 0) {
    return NextResponse.json({ erro: 'sem-video', detalhe: 'Esta semana ainda não tem os MP4 renderizados. Renderiza-a primeiro em /admin/carrossel e volta aqui.' }, { status: 409 });
  }

  let criados = 0;
  for (const d of comVideo) {
    const diaNum = d.dia ?? (dias.indexOf(d) + 1);
    const dataDia = maisDias(segunda, diaNum - 1);
    const novoSlug = `loja-${slug}-d${diaNum}`;
    const legenda = (() => { try { return gerarCaptionInstagram(d as unknown as ConteudoDia); } catch { return ''; } })();
    const row = {
      slug: novoSlug,
      title: d.palavra ? `${d.palavra}` : `${data.title} · dia ${diaNum}`,
      brief: `Loja 7 Véus · ${universo}`,
      dias: [{ dia: 1, videoUrl: d.videoUrl, imagens: d.imagens ?? [], legenda, hashtags: [] }],
      theme: { marca: 'loja', formato: 'reel', universo, origem: slug, agendadoEm: dataDia, hora, aprovado: false, capaRev: 2 },
    };
    const { error: e2 } = await supabase.from('carousel_collections').upsert(row, { onConflict: 'slug' });
    if (!e2) criados++;
  }

  return NextResponse.json({ ok: true, criados, total: comVideo.length });
}
