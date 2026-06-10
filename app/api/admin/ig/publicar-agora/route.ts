import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { publicarInstagram } from '@/lib/instagram/publish';
import { getIgCredenciais } from '@/lib/instagram/config';

export const runtime = 'nodejs';
export const maxDuration = 300;

// POST { slug } — publica JÁ um post no Instagram (botão "publicar agora (teste)"
// da Agenda). Mesma lógica de media do cron, mas a pedido e com resposta imediata.
// Marca theme.igPublicado para o cron das 13h não voltar a publicar o mesmo.

const CARROSSEL = ['sinais', 'ninguem', 'pensador'];
const VIDEO = ['kinetico', 'domingo', 'banda', 'heroi', 'infografico'];

type Slide = { imageUrl?: string | null };
type Dia = { slides?: Slide[]; legenda?: string; hashtags?: string[]; videoUrl?: string; imagens?: string[] };
type Theme = { formato?: string; subtipo?: string; igPublicado?: boolean; igStatus?: string; igTentativas?: number; publicado?: boolean };

const tipoChave = (t: Theme) => (t?.formato === 'reel' ? (t?.subtipo ?? 'reel') : (t?.formato ?? ''));
const legendaDe = (d?: Dia) => !d ? '' : [d.legenda?.trim(), (d.hashtags ?? []).join(' ')].filter(Boolean).join('\n\n');

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });

  const { token, igUserId } = await getIgCredenciais();
  if (!token || !igUserId) return NextResponse.json({ erro: 'sem-credenciais', detalhe: 'falta INSTAGRAM_TOKEN / INSTAGRAM_IG_ID no Vercel' }, { status: 500 });

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

  let r: { ok: boolean; id?: string; erro?: string };
  if (VIDEO.includes(chave) && d?.videoUrl) {
    r = await publicarInstagram({ token, igUserId, caption, tipo: 'reel', videoUrl: d.videoUrl });
  } else if (CARROSSEL.includes(chave)) {
    const imgs = d?.imagens ?? [];
    if (imgs.length < 2) {
      return NextResponse.json({ erro: 'sem-imagens', detalhe: 'Este carrossel ainda não tem imagens no servidor. Carrega "↻ render no servidor" e espera ~10 min antes de publicar.' }, { status: 409 });
    }
    r = await publicarInstagram({ token, igUserId, caption, tipo: 'carrossel', imageUrls: imgs });
  } else if (chave === 'infografico') {
    if (d?.videoUrl) r = await publicarInstagram({ token, igUserId, caption, tipo: 'reel', videoUrl: d.videoUrl });
    else if (d?.imagens?.length) r = await publicarInstagram({ token, igUserId, caption, tipo: 'imagem', imageUrls: d.imagens });
    else return NextResponse.json({ erro: 'sem-media', detalhe: 'Infográfico ainda sem MP4 nem imagem no servidor.' }, { status: 409 });
  } else if (chave === 'kinetico' || chave === 'domingo' || chave === 'banda' || chave === 'heroi') {
    return NextResponse.json({ erro: 'sem-media', detalhe: 'Este vídeo ainda não está renderizado no servidor (sem MP4). Carrega 🎬 renderizar e espera ~10 min.' }, { status: 409 });
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
