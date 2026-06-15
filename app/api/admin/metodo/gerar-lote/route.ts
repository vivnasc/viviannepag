import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes } from '@/lib/texto';
import { CONTAS, FUNDO_FAMILIA, ContaId, VeuNome } from '@/lib/metodo/contas';
import { reelsDaConta } from '@/lib/metodo/reels';
import { Post, nomeVeu, revelacaoPosts, manifestoPosts } from '@/lib/metodo/posts';
import { legendaDoPost, hashtagsDoPost } from '@/lib/metodo/legenda';
import { fraseReconhecimento } from '@/lib/metodo/ia';

export const runtime = 'nodejs';
export const maxDuration = 300;

// LOTE no SERVIDOR (fire-and-forget): gera N posts de uma conta na proporção
// 60/30/10 num único pedido. Corre no servidor, por isso a Vivianne pode SAIR
// ou fechar a página que ele termina. Para ser rápido e fiável, NÃO gera imagem
// Flux (usa o fundo de cor próprio da conta, o gradiente do MetodoSlide); a
// imagem pintada fica opcional, por post (botão gerar/regenerar).

// constrói a linha de carousel_collections a partir de um Post.
function buildRow(post: Post, slug: string, ia: boolean, i: number) {
  const conta = CONTAS[post.conta];
  const texto = limparTravessoes(post.texto);
  const destaque = limparTravessoes(post.destaque);
  const legenda = limparTravessoes(legendaDoPost(post));
  const hashtags = hashtagsDoPost(post);
  const promptFundo = limparTravessoes(`${post.fundoCena}. ${FUNDO_FAMILIA}`); // guardado para imagem opcional depois
  const numeroFaixa = ((Math.floor(Date.now() / 1000) + i) % 100) + 1;
  const faixa = { numero: numeroFaixa, titulo: `Faixa ${String(numeroFaixa).padStart(2, '0')}`, url: faixaUrl(numeroFaixa) };
  const slides = [{ tipo: 'metodo', texto, destaque, notaVisual: promptFundo, imageUrl: null, capa: true, conceito: post.conceito, contaId: post.conta }];
  const dias = [{ dia: 1, mundo: 'autora', palavra: texto.slice(0, 48), slides, faixa, legenda, hashtags }];
  return {
    slug, title: texto.slice(0, 48), brief: texto, dias,
    theme: { formato: 'reel', subtipo: 'kinetico', video: true, mundo: 'autora', marca: conta.marca, metodo: { conta: post.conta, tipo: post.tipo, veu: post.veu ?? null, postId: slug, ia } },
  };
}

// POST { conta, n? }: gera o lote no servidor.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { conta?: string; n?: number };
  const contaId = (body.conta ?? '') as ContaId;
  const conta = CONTAS[contaId];
  if (!conta) return NextResponse.json({ erro: 'conta-desconhecida' }, { status: 400 });
  const n = Math.min(60, Math.max(1, body.n ?? 30));

  const nRecon = Math.round(n * 0.6);
  const nRev = Math.round(n * 0.3);
  const nMani = Math.max(0, n - nRecon - nRev);
  const revs = revelacaoPosts(contaId);
  const manis = manifestoPosts(contaId);

  const rows: ReturnType<typeof buildRow>[] = [];
  const base = Date.now();

  // RECONHECIMENTO (IA): frases novas do véu, em paralelo por blocos.
  const reconIdx = Array.from({ length: nRecon }, (_, i) => i);
  const CHUNK = 6;
  for (let c = 0; c < reconIdx.length; c += CHUNK) {
    const bloco = reconIdx.slice(c, c + CHUNK);
    const feitos = await Promise.all(bloco.map(async (i) => {
      const veu = conta.veus[i % conta.veus.length] as VeuNome;
      const doVeu = reelsDaConta(contaId).filter((r) => r.veu === veu);
      const fonte = doVeu.find((r) => r.revelacaoForte) ?? doVeu[0];
      try {
        const texto = await fraseReconhecimento(veu, apiKey);
        const post: Post = { id: `r${i}`, conta: contaId, tipo: 'reconhecimento', veu, texto, destaque: [], payoff: fonte?.sala, fundoCena: fonte?.fundoCena ?? conta.fundoBase, fonte: 'gerado com IA (do véu)', conceito: nomeVeu(veu) };
        return buildRow(post, `metodo-ia-${contaId}-${base}-${i}`, true, i);
      } catch { return null; }
    }));
    for (const r of feitos) if (r) rows.push(r);
  }

  // REVELAÇÃO + MANIFESTO (curados): slugs estáveis (regenerar sobrescreve).
  for (let i = 0; i < nRev; i++) { const p = revs[i % revs.length]; if (p) rows.push(buildRow(p, `metodo-${p.id}`, false, 100 + i)); }
  for (let i = 0; i < nMani; i++) { const p = manis[i % manis.length]; if (p) rows.push(buildRow(p, `metodo-${p.id}`, false, 200 + i)); }

  if (!rows.length) return NextResponse.json({ erro: 'nada-gerado' }, { status: 500 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('carousel_collections').upsert(rows, { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gerados: rows.length });
}
