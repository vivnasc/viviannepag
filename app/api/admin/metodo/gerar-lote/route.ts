import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes } from '@/lib/texto';
import { CONTAS, fundoDaConta, ContaId } from '@/lib/metodo/contas';
import { reelsDaConta } from '@/lib/metodo/reels';
import { Post, nomeVeu } from '@/lib/metodo/posts';
import { legendaDoPost, hashtagsDoPost } from '@/lib/metodo/legenda';
import { fraseReconhecimento } from '@/lib/metodo/ia';
import { planoSemana } from '@/lib/metodo/semana';

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
  // a DOR lidera (sem véu no topo); o véu revela-se no rodapé (veuReveal).
  const slides = [{ tipo: 'metodo', texto, destaque, notaVisual: p.promptFundo, imageUrl, capa: true, conceito: '', veuReveal: p.post.conceito, contaId: p.post.conta }];
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

// POST { conta, semanas?, offset?, dia?, completar? }: gera o plano no servidor.
//   - sem `dia`/`completar`: a(s) semana(s) inteira(s) (reescreve, como sempre)
//   - dia: 'YYYY-MM-DD'   -> só esse dia da semana do offset (regenera esse)
//   - completar: true     -> só os dias da semana que AINDA não existem (não
//                            estraga o já feito; é a autonomia para completar)
// O índice de posição (i) é sempre o lugar do dia na semana do offset, por isso
// o slug bate certo com "gerar esta semana" (regenera/sobrescreve, não duplica).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { conta?: string; semanas?: number; offset?: number; dia?: string; completar?: boolean };
  const contaId = (body.conta ?? '') as ContaId;
  const conta = CONTAS[contaId];
  if (!conta) return NextResponse.json({ erro: 'conta-desconhecida' }, { status: 400 });
  const semanas = Math.min(4, Math.max(1, body.semanas ?? 1));
  const offset = Math.max(-12, Math.min(12, body.offset ?? 0)); // 0 = esta semana

  const supabase = getSupabaseAdmin();

  // MEMÓRIA anti-repetição + datas JÁ geradas (para "completar"), numa só leitura:
  // - evitar: frases de reconhecimento já usadas nesta conta (não repete o tema)
  // - datasExistentes: as datas que já têm post nesta conta (não as regenera)
  const evitar: string[] = [];
  const datasExistentes = new Set<string>();
  const publicadasDatas = new Set<string>(); // dias já publicados: NUNCA se tocam
  try {
    const { data: existentes } = await supabase.from('carousel_collections').select('dias, theme').like('slug', 'metodo-%');
    for (const r of (existentes ?? []) as { dias?: Array<{ slides?: Array<{ texto?: string }> }>; theme?: { agendadoEm?: string; igPublicado?: boolean; publicado?: boolean; metodo?: { conta?: string; tipo?: string } } }[]) {
      if (r.theme?.metodo?.conta !== contaId) continue;
      if (r.theme?.agendadoEm) {
        datasExistentes.add(r.theme.agendadoEm);
        if (r.theme?.igPublicado || r.theme?.publicado) publicadasDatas.add(r.theme.agendadoEm);
      }
      if (r.theme?.metodo?.tipo !== 'reconhecimento') continue;
      const tx = r.dias?.[0]?.slides?.[0]?.texto;
      if (tx) evitar.push(tx);
    }
  } catch { /* sem memória prévia, segue */ }

  // dias a gerar, cada um com o seu índice de posição na semana (i).
  type Tarefa = { d: ReturnType<typeof planoSemana>[number]; i: number };
  let tarefas: Tarefa[];
  if (body.dia || body.completar) {
    const semana = planoSemana(contaId, offset).map((d, i) => ({ d, i }));
    if (body.dia) tarefas = semana.filter((t) => t.d.data === body.dia);
    else tarefas = semana.filter((t) => !datasExistentes.has(t.d.data)); // completar: só os que faltam
  } else {
    const dias = Array.from({ length: semanas }).flatMap((_, w) => planoSemana(contaId, offset + w));
    tarefas = dias.map((d, i) => ({ d, i }));
  }
  // SEGURANÇA: nunca regenerar/sobrescrever um dia já PUBLICADO (em qualquer modo).
  tarefas = tarefas.filter((t) => !publicadasDatas.has(t.d.data));
  if (!tarefas.length) return NextResponse.json({ ok: true, gerados: 0, jaExistiam: true });

  const pendentes: Pendente[] = [];
  // SEQUENCIAL (não paralelo): cada reconhecimento conhece os anteriores e não
  // repete. Revelação/manifesto são curados (direto).
  for (const { d, i } of tarefas) {
    if (d.tipo === 'reconhecimento') {
      const veu = d.post.veu!;
      const doVeu = reelsDaConta(contaId).filter((r) => r.veu === veu);
      const fonte = doVeu.find((r) => r.revelacaoForte) ?? doVeu[0];
      try {
        const texto = await fraseReconhecimento(veu, apiKey, evitar);
        evitar.push(texto);
        const post: Post = { id: `r${i}`, conta: contaId, tipo: 'reconhecimento', veu, texto, destaque: [], payoff: fonte?.sala, fundoCena: '', fonte: 'gerado com IA (do véu)', conceito: nomeVeu(veu) };
        pendentes.push({ post, slug: `metodo-ia-${contaId}-${d.data}-${i}`, ia: true, i, promptFundo: limparTravessoes(fundoDaConta(conta, i)), data: d.data, hora: d.hora });
      } catch { /* salta este dia */ }
    } else {
      // curado (revelação/manifesto): slug com a data, para o mesmo poder repetir noutra semana.
      pendentes.push({ post: d.post, slug: `metodo-${d.post.id}-${d.data}`, ia: false, i, promptFundo: limparTravessoes(fundoDaConta(conta, i)), data: d.data, hora: d.hora });
    }
  }

  if (!pendentes.length) return NextResponse.json({ erro: 'nada-gerado' }, { status: 500 });

  // SÓ texto (imageUrl null). O prompt da imagem fica guardado (notaVisual) para
  // a gerares depois, só das que ficarem.
  const rows = pendentes.map((p) => buildRow(p, null));
  const { error } = await supabase.from('carousel_collections').upsert(rows, { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gerados: rows.length });
}
