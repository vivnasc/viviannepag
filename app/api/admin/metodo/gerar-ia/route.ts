import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes } from '@/lib/texto';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { CONTAS, FUNDO_FAMILIA, ContaId, VeuNome } from '@/lib/metodo/contas';
import { reelsDaConta } from '@/lib/metodo/reels';
import { Post, nomeVeu } from '@/lib/metodo/posts';
import { legendaDoPost, hashtagsDoPost } from '@/lib/metodo/legenda';
import { fraseReconhecimento } from '@/lib/metodo/ia';

export const runtime = 'nodejs';
export const maxDuration = 300;

// Geração AUTÓNOMA com Claude IA. Para os posts de RECONHECIMENTO (60%): o Claude
// escreve uma frase-sintoma NOVA do véu (a dor na 1.ª pessoa, 3 segundos), e a
// REVELAÇÃO que entra como recompensa na legenda vem CURADA do manual (reels.ts),
// para não inventar aforismos. Cria o post e grava como os outros (tipo metodo).

async function fundoImagem(prompt: string, slug: string): Promise<string | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token || !prompt) return null;
  try {
    const url = await gerarImagemFlux(prompt, token, { raw: true });
    try { return await guardarImagem(url, `metodo/${slug}/fundo-${Date.now()}.jpg`); } catch { return url; }
  } catch { return null; }
}

// POST { conta, veu? }: gera um post de reconhecimento novo (IA) para a conta.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { conta?: string; veu?: string };
  const contaId = (body.conta ?? '') as ContaId;
  const conta = CONTAS[contaId];
  if (!conta) return NextResponse.json({ erro: 'conta-desconhecida' }, { status: 400 });
  const veu = (body.veu as VeuNome) && conta.veus.includes(body.veu as VeuNome)
    ? (body.veu as VeuNome)
    : conta.veus[Math.floor(Math.random() * conta.veus.length)];

  // revelação + fundo CURADOS do manual (deste véu)
  const doVeu = reelsDaConta(contaId).filter((r) => r.veu === veu);
  const fonte = doVeu.find((r) => r.revelacaoForte) ?? doVeu[Math.floor(Math.random() * Math.max(1, doVeu.length))];
  const payoff = fonte?.sala;
  const fundoCena = fonte?.fundoCena ?? conta.fundoBase;

  let texto: string;
  try { texto = await fraseReconhecimento(veu, apiKey); }
  catch (e) { return NextResponse.json({ erro: 'claude', detalhe: String(e) }, { status: 502 }); }

  const slug = `metodo-ia-${contaId}-${Date.now()}`;
  const post: Post = {
    id: slug, conta: contaId, tipo: 'reconhecimento', veu,
    texto, destaque: [], payoff, fundoCena, fonte: 'gerado com IA (do véu)', conceito: nomeVeu(veu),
  };
  const legenda = limparTravessoes(legendaDoPost(post));
  const hashtags = hashtagsDoPost(post);
  const promptFundo = limparTravessoes(`${fundoCena}. ${FUNDO_FAMILIA}`);
  const imageUrl = await fundoImagem(promptFundo, slug);

  const numeroFaixa = (Math.floor(Date.now() / 1000) % 100) + 1;
  const faixa = { numero: numeroFaixa, titulo: `Faixa ${String(numeroFaixa).padStart(2, '0')}`, url: faixaUrl(numeroFaixa) };
  const slides = [{ tipo: 'metodo', texto, destaque: [], notaVisual: promptFundo, imageUrl, capa: true, conceito: post.conceito, contaId }];
  const dias = [{ dia: 1, mundo: 'autora', palavra: texto.slice(0, 48), slides, faixa, legenda, hashtags }];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .upsert({
      slug, title: texto.slice(0, 48), brief: texto, dias,
      theme: { formato: 'reel', subtipo: 'kinetico', video: true, mundo: 'autora', marca: conta.marca, metodo: { conta: contaId, tipo: 'reconhecimento', veu, postId: slug, ia: true } },
    }, { onConflict: 'slug' })
    .select().single();
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, coleccao: data, slug, texto });
}
