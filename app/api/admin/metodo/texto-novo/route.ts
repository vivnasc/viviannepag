import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { limparTravessoes } from '@/lib/texto';
import { fraseReconhecimento } from '@/lib/metodo/ia';
import { CONTAS, ContaId, VeuNome } from '@/lib/metodo/contas';
import { reelsDaConta } from '@/lib/metodo/reels';
import { Post, nomeVeu, revelacaoPosts, manifestoPosts } from '@/lib/metodo/posts';
import { legendaDoPost, hashtagsDoPost } from '@/lib/metodo/legenda';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST { slug }: TEXTO NOVO mantendo a IMAGEM. Reescreve a frase na voz CERTA da
// conta (na mãe = Dualidade, o território próprio dela), sem gastar imagem.
// Para destravar "imagem boa, texto mau": troca texto/destaque/conceito/legenda,
// mantém imageUrl e invalida o MP4 (precisa de re-render por o texto mudar).
type Slide = { texto?: string; destaque?: string[]; conceito?: string; imageUrl?: string | null; videoUrl?: string | null };
type Dia = { slides?: Slide[]; legenda?: string; hashtags?: string[]; videoUrl?: string | null };
type Theme = { metodo?: { conta?: string; tipo?: string; veu?: string | null } };

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const body = (await req.json().catch(() => ({}))) as { slug?: string };
  const slug = (body.slug ?? '').trim();
  if (!slug || !slug.startsWith('metodo-')) return NextResponse.json({ erro: 'slug-invalido' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('carousel_collections').select('slug, dias, theme').eq('slug', slug).single();
  if (error || !data) return NextResponse.json({ erro: 'nao-encontrado' }, { status: 404 });

  const theme = (data.theme ?? {}) as Theme;
  const contaId = (theme.metodo?.conta ?? '') as ContaId;
  const conta = CONTAS[contaId];
  if (!conta) return NextResponse.json({ erro: 'conta-desconhecida' }, { status: 400 });
  const dias = (data.dias ?? []) as Dia[];
  const slide = dias[0]?.slides?.[0];
  if (!slide) return NextResponse.json({ erro: 'sem-slide' }, { status: 400 });

  const tipo = theme.metodo?.tipo ?? 'reconhecimento';
  // a voz própria da conta: a mãe fala pela DUALIDADE (território só dela).
  const veu: VeuNome = conta.id === 'mae' ? 'Dualidade' : ((theme.metodo?.veu as VeuNome) ?? conta.veus[0]);

  let post: Post;
  if (tipo === 'revelacao') {
    const pool = revelacaoPosts(contaId).filter((p) => p.texto !== slide.texto);
    post = pool[Math.floor(Math.random() * pool.length)] ?? revelacaoPosts(contaId)[0];
  } else if (tipo === 'manifesto') {
    const pool = manifestoPosts(contaId).filter((p) => p.texto !== slide.texto);
    post = pool[Math.floor(Math.random() * pool.length)] ?? manifestoPosts(contaId)[0];
  } else {
    if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });
    const doVeu = reelsDaConta(contaId).filter((r) => r.veu === veu);
    const fonte = doVeu.find((r) => r.revelacaoForte) ?? doVeu[0];
    // MEMÓRIA anti-repetição: as frases já usadas nesta conta (e a atual), para a
    // IA não voltar ao mesmo tema (era por isto que "texto novo" repetia).
    const evitar: string[] = slide.texto ? [slide.texto] : [];
    const { data: irmaos } = await supabase.from('carousel_collections').select('dias, theme').like('slug', 'metodo-%');
    for (const r of (irmaos ?? []) as { dias?: Dia[]; theme?: Theme }[]) {
      if (r.theme?.metodo?.conta !== contaId) continue;
      const tx = r.dias?.[0]?.slides?.[0]?.texto;
      if (tx) evitar.push(tx);
    }
    let texto: string;
    try { texto = await fraseReconhecimento(veu, apiKey, evitar); }
    catch (e) { return NextResponse.json({ erro: 'claude', detalhe: String(e) }, { status: 502 }); }
    post = { id: `tn-${Date.now()}`, conta: contaId, tipo: 'reconhecimento', veu, texto, destaque: [], payoff: fonte?.sala, fundoCena: '', fonte: 'gerado com IA (do véu)', conceito: nomeVeu(veu) };
  }

  const texto = limparTravessoes(post.texto);
  const destaque = limparTravessoes(post.destaque);
  const legenda = limparTravessoes(legendaDoPost(post));
  const hashtags = hashtagsDoPost(post);

  slide.texto = texto;
  slide.destaque = destaque;
  slide.conceito = post.conceito;
  if (slide.videoUrl !== undefined) slide.videoUrl = null; // texto mudou -> re-render
  dias[0].legenda = legenda;
  dias[0].hashtags = hashtags;
  dias[0].videoUrl = null;

  const novoTheme = { ...(data.theme as Record<string, unknown>), metodo: { ...(theme.metodo ?? {}), tipo, veu: post.veu ?? null } };
  const { error: e2 } = await supabase.from('carousel_collections').update({ dias, theme: novoTheme, title: texto.slice(0, 48), brief: texto }).eq('slug', slug);
  if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, texto, conceito: post.conceito });
}
