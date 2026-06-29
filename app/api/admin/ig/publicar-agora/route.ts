import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { publicarInstagram } from '@/lib/instagram/publish';
import { getIgCredenciais } from '@/lib/instagram/config';
import { dispararRender, CAPA_REV } from '@/lib/render/dispatch';
import { contaDe, nomeConta } from '@/lib/instagram/contas';

export const runtime = 'nodejs';
export const maxDuration = 300;

// POST { slug } — publica JÁ um post no Instagram, na conta a que pertence
// (veu.a.veu ou loja). A pedido e com resposta imediata. Marca igPublicado.

const CARROSSEL: string[] = []; // já não há carrossel de imagens (sinais/ninguem/pensador passaram a reels MP4)
const VIDEO = ['kinetico', 'domingo', 'duasfaces', 'nbeats', 'carta', 'visual', 'banda', 'heroi', 'infografico', 'sinais', 'ninguem', 'pensador'];

type Slide = { imageUrl?: string | null };
type Dia = { slides?: Slide[]; legenda?: string; hashtags?: string[]; videoUrl?: string; imagens?: string[] };
type Theme = { formato?: string; subtipo?: string; marca?: string; universo?: string; externo?: boolean; igPublicado?: boolean; igStatus?: string; igTentativas?: number; publicado?: boolean; capaRev?: number; renderPedidoEm?: number; soulab?: { clipUrl?: string | null } | null };

const tipoChave = (t: Theme) => (t?.formato === 'reel' ? (t?.subtipo ?? 'reel') : (t?.formato ?? ''));
const legendaDe = (d?: Dia) => !d ? '' : [d.legenda?.trim(), (d.hashtags ?? []).join(' ')].filter(Boolean).join('\n\n');

// CRESCER · peça de VÁRIAS telas é CARROSSEL de imagens — EXCETO com CLIP contínuo
// (theme.soulab.clipUrl): aí é o REEL QUE CRESCE (texto ritmado por cima do vídeo,
// legível). Sem clip, reel de várias linhas sai rápido e ilegível, por isso carrossel.
const ehCrescerCarrossel = (t: Theme, d?: Dia) => t.marca === 'crescer' && (d?.slides?.length ?? 0) > 1 && !t.soulab?.clipUrl;

// a loja é sempre REEL (MP4 com música); a veu varia conforme o formato.
function mediaPronta(conta: string, chave: string, t: Theme, d?: Dia): boolean {
  if (ehCrescerCarrossel(t, d)) return (d?.imagens?.length ?? 0) >= 2; // carrossel de imagens pronto
  if (t.externo) return !!d?.videoUrl || (d?.imagens?.length ?? 0) >= 1; // CSV: media já pronta
  if (conta === 'loja') return !!d?.videoUrl;
  if (VIDEO.includes(chave)) return !!d?.videoUrl;
  if (CARROSSEL.includes(chave)) return (d?.imagens?.length ?? 0) >= 2 && t.capaRev === CAPA_REV;
  if (chave === 'infografico') return !!d?.videoUrl || (d?.imagens?.length ?? 0) >= 1;
  return false;
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .select('slug, title, dias, theme')
    .eq('slug', slug)
    .single();
  if (error || !data) return NextResponse.json({ erro: 'db', detalhe: error?.message ?? 'não encontrado' }, { status: 404 });

  const t = (data.theme ?? {}) as Theme;
  const d = (data.dias as Dia[] | undefined)?.[0];
  const caption = legendaDe(d);
  const chave = tipoChave(t);
  const conta = contaDe(t, slug);

  const { token, igUserId } = await getIgCredenciais(conta);
  if (!token || !igUserId) return NextResponse.json({ erro: 'sem-credenciais', detalhe: `A conta "${nomeConta(conta)}" ainda não tem token. Liga-a em 🔑 Instagram.` }, { status: 409 });

  // media ainda não pronta (ou capa por corrigir)? PREPARA sozinho. Só dispara
  // um render novo se não tiver pedido um nos últimos 20 min (senão a app fica
  // a sondar e não duplica renders). O frontend sonda este endpoint até publicar.
  if (!mediaPronta(conta, chave, t, d)) {
    const pedido = t.renderPedidoEm ?? 0;
    const haPouco = Date.now() - pedido < 20 * 60 * 1000;
    let ok = true;
    if (!haPouco) {
      ok = await dispararRender(slug, ehCrescerCarrossel(t, d) ? 'carrossel' : undefined);
      await supabase.from('carousel_collections').update({ theme: { ...t, renderPedidoEm: Date.now(), igStatus: ok ? 'a preparar imagens no servidor (~10 min)' : 'falha ao pedir render' } }).eq('slug', slug);
    }
    return NextResponse.json({
      preparando: true,
      detalhe: ok
        ? 'a preparar as imagens no servidor (com a capa nova)…'
        : 'Não consegui pedir a preparação das imagens (falta GITHUB_DISPATCH_TOKEN?).',
    }, { status: 202 });
  }

  let r: { ok: boolean; id?: string; erro?: string };
  if (ehCrescerCarrossel(t, d)) {
    r = await publicarInstagram({ token, igUserId, caption, tipo: 'carrossel', imageUrls: d?.imagens ?? [] });
  } else if (t.externo) {
    if (d?.videoUrl) r = await publicarInstagram({ token, igUserId, caption, tipo: 'reel', videoUrl: d.videoUrl });
    else if ((d?.imagens?.length ?? 0) >= 2) r = await publicarInstagram({ token, igUserId, caption, tipo: 'carrossel', imageUrls: d!.imagens! });
    else r = await publicarInstagram({ token, igUserId, caption, tipo: 'imagem', imageUrls: d?.imagens ?? [] });
  } else if (conta === 'loja') {
    r = await publicarInstagram({ token, igUserId, caption, tipo: 'reel', videoUrl: d!.videoUrl!, coverUrl: d?.imagens?.[0] });
  } else if (VIDEO.includes(chave) && d?.videoUrl) {
    // CAPA do reel: o poster do último frame (com a frase) está em d.imagens[0].
    const coverUrl = d.imagens?.[0];
    const thumbOffsetMs = (chave === 'kinetico' || chave === 'domingo') ? 6000 : undefined;
    r = await publicarInstagram({ token, igUserId, caption, tipo: 'reel', videoUrl: d.videoUrl, coverUrl, thumbOffsetMs });
  } else if (CARROSSEL.includes(chave)) {
    r = await publicarInstagram({ token, igUserId, caption, tipo: 'carrossel', imageUrls: d?.imagens ?? [] });
  } else if (chave === 'infografico') {
    if (d?.videoUrl) r = await publicarInstagram({ token, igUserId, caption, tipo: 'reel', videoUrl: d.videoUrl });
    else r = await publicarInstagram({ token, igUserId, caption, tipo: 'imagem', imageUrls: d?.imagens ?? [] });
  } else {
    return NextResponse.json({ erro: 'formato', detalhe: `formato "${chave}" sem media para publicar` }, { status: 409 });
  }

  const novoTheme: Theme = r.ok
    ? { ...t, igPublicado: true, publicado: true, igStatus: `publicado (teste) ${new Date().toISOString()}` }
    : { ...t, igTentativas: (t.igTentativas ?? 0) + 1, igStatus: `erro: ${r.erro}` };
  await supabase.from('carousel_collections').update({ theme: novoTheme }).eq('slug', slug);

  if (!r.ok) return NextResponse.json({ erro: 'publicar', detalhe: r.erro }, { status: 502 });
  return NextResponse.json({ ok: true, id: r.id });
}
