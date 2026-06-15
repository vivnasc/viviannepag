import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes } from '@/lib/texto';
import { CONTAS, FUNDO_FAMILIA, ContaId } from '@/lib/metodo/contas';
import { reelsDaConta } from '@/lib/metodo/reels';
import { Post, nomeVeu } from '@/lib/metodo/posts';
import { legendaDoPost, hashtagsDoPost } from '@/lib/metodo/legenda';
import { fraseReconhecimento } from '@/lib/metodo/ia';
import { planoSemana } from '@/lib/metodo/semana';
import { VEU_SEMENTE } from '@/lib/metodo/veus';

export const runtime = 'nodejs';
export const maxDuration = 300;

// LOTE no SERVIDOR, ALINHADO AO PLANO DA SEMANA (como a veu.a.veu): segue o
// plano dia a dia (cada post sabe a sua DATA e o seu tipo) e grava com
// agendadoEm = a data planeada (é o PLANO, fica rascunho; nada publica sem o ✓).
// SÓ GERA TEXTO (não gasta créditos de imagem): a imagem gera-se depois, só das
// frases que ficarem (botão 'gerar imagens em falta'), para não pagar imagens de
// frases que vais descartar. Corre no servidor: pode sair/fechar a página.

type Pendente = { post: Post; slug: string; ia: boolean; i: number; promptFundo: string; data: string; hora: string };

function buildRow(p: Pendente, imageUrl: string | null) {
  const conta = CONTAS[p.post.conta];
  const texto = limparTravessoes(p.post.texto);
  const destaque = limparTravessoes(p.post.destaque);
  const legenda = limparTravessoes(legendaDoPost(p.post));
  const hashtags = hashtagsDoPost(p.post);
  const numeroFaixa = ((Math.floor(Date.now() / 1000) + p.i) % 100) + 1;
  const faixa = { numero: numeroFaixa, titulo: `Faixa ${String(numeroFaixa).padStart(2, '0')}`, url: faixaUrl(numeroFaixa) };
  const slides = [{ tipo: 'metodo', texto, destaque, notaVisual: p.promptFundo, imageUrl, capa: true, conceito: p.post.conceito, contaId: p.post.conta }];
  const dias = [{ dia: 1, mundo: 'autora', palavra: texto.slice(0, 48), slides, faixa, legenda, hashtags }];
  return {
    slug: p.slug, title: texto.slice(0, 48), brief: texto, dias,
    theme: {
      formato: 'reel', subtipo: 'kinetico', video: true, mundo: 'autora', marca: conta.marca,
      agendadoEm: p.data, hora: p.hora, // o PLANO (rascunho); só publica com aprovação
      metodo: { conta: p.post.conta, tipo: p.post.tipo, veu: p.post.veu ?? null, postId: p.slug, ia: p.ia },
    },
  };
}

// POST { conta, semanas?, offset? }: gera o plano (datas + imagens) no servidor.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { conta?: string; semanas?: number; offset?: number };
  const contaId = (body.conta ?? '') as ContaId;
  const conta = CONTAS[contaId];
  if (!conta) return NextResponse.json({ erro: 'conta-desconhecida' }, { status: 400 });
  const semanas = Math.min(4, Math.max(1, body.semanas ?? 1));
  const offset = Math.max(0, body.offset ?? 0);

  // junta todos os dias das semanas pedidas (cada um com a sua data e tipo).
  const dias = Array.from({ length: semanas }).flatMap((_, w) => planoSemana(contaId, offset + w));

  const pendentes: Pendente[] = [];
  let idx = 0;
  // RECONHECIMENTO (IA) em paralelo por blocos; revelação/manifesto direto.
  for (let c = 0; c < dias.length; c += 6) {
    const bloco = dias.slice(c, c + 6);
    const feitos = await Promise.all(bloco.map(async (d) => {
      const i = idx++;
      if (d.tipo === 'reconhecimento') {
        const veu = d.post.veu!;
        const doVeu = reelsDaConta(contaId).filter((r) => r.veu === veu);
        const fonte = doVeu.find((r) => r.revelacaoForte) ?? doVeu[0];
        const cenas = VEU_SEMENTE[veu].cenas;
        const cena = cenas[i % cenas.length]; // cena VARIADA (não repetir imagens)
        try {
          const texto = await fraseReconhecimento(veu, apiKey);
          const post: Post = { id: `r${i}`, conta: contaId, tipo: 'reconhecimento', veu, texto, destaque: [], payoff: fonte?.sala, fundoCena: cena, fonte: 'gerado com IA (do véu)', conceito: nomeVeu(veu) };
          return { post, slug: `metodo-ia-${contaId}-${d.data}-${i}`, ia: true, i, promptFundo: limparTravessoes(`${post.fundoCena}. ${FUNDO_FAMILIA}`), data: d.data, hora: d.hora } as Pendente;
        } catch { return null; }
      }
      // curado (revelação/manifesto): slug com a data, para o mesmo poder repetir noutra semana.
      return { post: d.post, slug: `metodo-${d.post.id}-${d.data}`, ia: false, i, promptFundo: limparTravessoes(`${d.post.fundoCena}. ${FUNDO_FAMILIA}`), data: d.data, hora: d.hora } as Pendente;
    }));
    for (const p of feitos) if (p) pendentes.push(p);
  }

  if (!pendentes.length) return NextResponse.json({ erro: 'nada-gerado' }, { status: 500 });

  // SÓ texto (imageUrl null). O prompt da imagem fica guardado (notaVisual) para
  // a gerares depois, só das que ficarem.
  const rows = pendentes.map((p) => buildRow(p, null));

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('carousel_collections').upsert(rows, { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gerados: rows.length });
}
