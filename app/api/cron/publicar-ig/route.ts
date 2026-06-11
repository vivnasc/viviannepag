import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { publicarInstagram } from '@/lib/instagram/publish';
import { getIgCredenciais } from '@/lib/instagram/config';
import { dispararRender, CAPA_REV } from '@/lib/render/dispatch';
import { contaDe, type ContaId } from '@/lib/instagram/contas';

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
const CARROSSEL: string[] = []; // já não há carrossel de imagens (sinais/ninguem/pensador passaram a reels MP4)
const VIDEO = ['kinetico', 'domingo', 'banda', 'heroi', 'infografico', 'sinais', 'ninguem', 'pensador'];

type Slide = { imageUrl?: string | null };
type Dia = { slides?: Slide[]; legenda?: string; hashtags?: string[]; videoUrl?: string; imagens?: string[] };
type Theme = { formato?: string; subtipo?: string; marca?: string; universo?: string; externo?: boolean; agendadoEm?: string | null; publicado?: boolean; igPublicado?: boolean; igStatus?: string; igTentativas?: number; capaRev?: number; renderPedidoEm?: number; aprovado?: boolean; hora?: string | null };
type Row = { slug: string; title: string; dias: Dia[]; theme: Theme };

// a media de um post está pronta a publicar? (loja = sempre MP4; carrossel exige capa corrigida)
function mediaPronta(conta: string, chave: string, t: Theme, d?: Dia): boolean {
  if (t.externo) return !!d?.videoUrl || (d?.imagens?.length ?? 0) >= 1; // CSV: media já pronta
  if (conta === 'loja') return !!d?.videoUrl;
  if (VIDEO.includes(chave)) return !!d?.videoUrl;
  if (CARROSSEL.includes(chave)) return (d?.imagens?.length ?? 0) >= 2 && t.capaRev === CAPA_REV;
  if (chave === 'infografico') return !!d?.videoUrl || (d?.imagens?.length ?? 0) >= 1;
  return false;
}

const tipoChave = (t: Theme) => (t?.formato === 'reel' ? (t?.subtipo ?? 'reel') : (t?.formato ?? ''));

// FUSO em que as horas dos posts são interpretadas (o fuso da Vivianne).
// As horas escolhidas (13:00, 16:00…) são DESTE fuso. Trocar aqui se mudares.
const FUSO = 'Africa/Johannesburg';

// número comparável YYYYMMDDHHMM na hora do FUSO (sem bugs de DST)
function agoraNum(): number {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
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
  // credenciais por conta (em cache nesta execução)
  const credCache: Partial<Record<ContaId, { token?: string; igUserId?: string }>> = {};
  const credsDe = async (c: ContaId) => (credCache[c] ??= await getIgCredenciais(c));

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .select('slug, title, dias, theme')
    .not('theme->>agendadoEm', 'is', null);
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  const agora = agoraNum();
  const resultados: { slug: string; estado: string }[] = [];

  for (const row of (data ?? []) as Row[]) {
    const t = row.theme ?? {};
    if (t.igPublicado || t.publicado) continue;  // já publicado (por nós ou à mão)
    if (!t.aprovado) continue;                   // TRAVA: só publica o que foi aprovado
    if ((t.igTentativas ?? 0) >= 3) continue;    // chega de tentar
    const ag = t.agendadoEm;
    if (!ag) continue;
    const chave = tipoChave(t);
    const hora = t.hora || HORA_FMT[chave] || '13:00';
    if (agendadoNum(ag, hora) > agora) continue; // ainda não é hora

    const conta = contaDe(t, row.slug);
    const { token, igUserId } = await credsDe(conta);
    if (!token || !igUserId) { resultados.push({ slug: row.slug, estado: `conta "${conta}" sem token` }); continue; }

    const d = row.dias?.[0];
    const caption = legendaDe(d);

    // ── media ainda não pronta? PREPARA sozinho (dispara o render) e segue.
    // No ciclo seguinte (~15 min) já está pronta e publica-se. Assim, estar
    // na Agenda basta — a Vivianne não carrega em nada. ──
    if (!mediaPronta(conta, chave, t, d)) {
      const pedido = t.renderPedidoEm ?? 0;
      const haPouco = Date.now() - pedido < 20 * 60 * 1000; // já pedido nos últimos 20 min?
      if (!haPouco) {
        const ok = await dispararRender(row.slug);
        await supabase.from('carousel_collections').update({ theme: { ...t, renderPedidoEm: Date.now(), igStatus: ok ? 'a preparar imagens no servidor (~10 min)' : 'falha ao pedir render' } }).eq('slug', row.slug);
        resultados.push({ slug: row.slug, estado: ok ? 'a preparar (render disparado)' : 'falha ao disparar render' });
      } else {
        resultados.push({ slug: row.slug, estado: 'a preparar (render em curso)' });
      }
      continue;
    }

    // que media publicar?
    let r: { ok: boolean; id?: string; erro?: string };
    if (t.externo) {
      if (d?.videoUrl) r = await publicarInstagram({ token, igUserId, caption, tipo: 'reel', videoUrl: d.videoUrl });
      else if ((d?.imagens?.length ?? 0) >= 2) r = await publicarInstagram({ token, igUserId, caption, tipo: 'carrossel', imageUrls: d!.imagens! });
      else r = await publicarInstagram({ token, igUserId, caption, tipo: 'imagem', imageUrls: d?.imagens ?? [] });
    } else if (conta === 'loja') {
      r = await publicarInstagram({ token, igUserId, caption, tipo: 'reel', videoUrl: d!.videoUrl! });
    } else if (VIDEO.includes(chave) && d?.videoUrl) {
      r = await publicarInstagram({ token, igUserId, caption, tipo: 'reel', videoUrl: d.videoUrl });
    } else if (CARROSSEL.includes(chave)) {
      r = await publicarInstagram({ token, igUserId, caption, tipo: 'carrossel', imageUrls: d?.imagens ?? [] });
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
