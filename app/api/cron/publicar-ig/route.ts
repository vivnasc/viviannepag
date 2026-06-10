import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { publicarInstagram } from '@/lib/instagram/publish';

export const runtime = 'nodejs';
export const maxDuration = 300;

// CRON: publica no Instagram os posts cuja hora agendada já chegou. Chamado a
// cada ~15 min pelo GitHub Actions (.github/workflows/publicar-ig.yml).
// Segurança: ?secret=CRON_SECRET. Config: INSTAGRAM_TOKEN, INSTAGRAM_IG_ID.

// hora óptima por FORMATO (igual à Agenda; o formato distingue os 2 de quarta)
const HORA_FMT: Record<string, string> = {
  kinetico: '13:00', sinais: '13:00', ninguem: '13:00', pensador: '20:00',
  banda: '13:00', heroi: '13:00', infografico: '11:00', domingo: '11:00', reel: '13:00', aneis: '13:00',
};
const CARROSSEL = ['sinais', 'ninguem', 'pensador'];
const VIDEO = ['kinetico', 'domingo', 'banda', 'heroi', 'infografico'];

type Slide = { imageUrl?: string | null };
type Dia = { slides?: Slide[]; legenda?: string; hashtags?: string[]; videoUrl?: string; imagens?: string[] };
type Theme = { formato?: string; subtipo?: string; agendadoEm?: string | null; publicado?: boolean; igPublicado?: boolean; igStatus?: string; igTentativas?: number };
type Row = { slug: string; title: string; dias: Dia[]; theme: Theme };

const tipoChave = (t: Theme) => (t?.formato === 'reel' ? (t?.subtipo ?? 'reel') : (t?.formato ?? ''));

// número comparável YYYYMMDDHHMM na hora de Lisboa (sem bugs de fuso/DST)
function lisboaAgoraNum(): number {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
  const p = Object.fromEntries(f.formatToParts(new Date()).map((x) => [x.type, x.value])) as Record<string, string>;
  return Number(`${p.year}${p.month}${p.day}${p.hour}${p.minute}`);
}
function agendadoNum(agendadoEm: string, hora: string): number {
  const [y, m, d] = agendadoEm.split('-');
  const [hh, mm] = (hora || '13:00').split(':');
  return Number(`${y}${m}${d}${hh.padStart(2, '0')}${mm.padStart(2, '0')}`);
}

function legendaDe(d?: Dia): string {
  if (!d) return '';
  return [d.legenda?.trim(), (d.hashtags ?? []).join(' ')].filter(Boolean).join('\n\n');
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ erro: 'auth' }, { status: 401 });
  }
  const token = process.env.INSTAGRAM_TOKEN;
  const igUserId = process.env.INSTAGRAM_IG_ID;
  if (!token || !igUserId) return NextResponse.json({ erro: 'sem-credenciais', detalhe: 'falta INSTAGRAM_TOKEN / INSTAGRAM_IG_ID' }, { status: 500 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .select('slug, title, dias, theme')
    .not('theme->>agendadoEm', 'is', null);
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  const agora = lisboaAgoraNum();
  const resultados: { slug: string; estado: string }[] = [];

  for (const row of (data ?? []) as Row[]) {
    const t = row.theme ?? {};
    if (t.igPublicado) continue;                 // já publicado
    if ((t.igTentativas ?? 0) >= 3) continue;    // chega de tentar
    const ag = t.agendadoEm;
    if (!ag) continue;
    const chave = tipoChave(t);
    const hora = HORA_FMT[chave] ?? '13:00';
    if (agendadoNum(ag, hora) > agora) continue; // ainda não é hora

    const d = row.dias?.[0];
    const caption = legendaDe(d);

    // que media publicar?
    let r: { ok: boolean; id?: string; erro?: string };
    if (VIDEO.includes(chave) && d?.videoUrl) {
      r = await publicarInstagram({ token, igUserId, caption, tipo: 'reel', videoUrl: d.videoUrl });
    } else if (CARROSSEL.includes(chave)) {
      const imgs = d?.imagens ?? [];
      if (imgs.length < 2) { r = { ok: false, erro: 'carrossel ainda sem imagens renderizadas (PNGs)' }; }
      else r = await publicarInstagram({ token, igUserId, caption, tipo: 'carrossel', imageUrls: imgs });
    } else if (chave === 'infografico') {
      if (d?.videoUrl) r = await publicarInstagram({ token, igUserId, caption, tipo: 'reel', videoUrl: d.videoUrl });
      else if (d?.imagens?.length) r = await publicarInstagram({ token, igUserId, caption, tipo: 'imagem', imageUrls: d.imagens });
      else r = { ok: false, erro: 'infográfico ainda sem MP4 nem imagem' };
    } else {
      r = { ok: false, erro: `formato "${chave}" sem media para publicar` };
    }

    const novoTheme: Theme = r.ok
      ? { ...t, igPublicado: true, publicado: true, igStatus: `publicado ${agora}` }
      : { ...t, igTentativas: (t.igTentativas ?? 0) + 1, igStatus: `erro: ${r.erro}` };
    await supabase.from('carousel_collections').update({ theme: novoTheme }).eq('slug', row.slug);
    resultados.push({ slug: row.slug, estado: r.ok ? 'publicado' : `falhou: ${r.erro}` });
  }

  return NextResponse.json({ ok: true, agora, publicados: resultados.filter((x) => x.estado === 'publicado').length, total: resultados.length, resultados });
}
