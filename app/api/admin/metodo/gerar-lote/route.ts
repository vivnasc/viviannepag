import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes } from '@/lib/texto';
import { CONTAS, ContaId } from '@/lib/metodo/contas';
import { nomeVeu } from '@/lib/metodo/posts';
import { fraseReconhecimento, revelacaoDaDor } from '@/lib/metodo/ia';
import { planoSemana } from '@/lib/metodo/semana';
import { realceAuto } from '@/lib/metodo/reels';
import { SABER } from '@/lib/metodo/saber';

export const runtime = 'nodejs';
export const maxDuration = 300;

// LOTE no SERVIDOR, ALINHADO AO PLANO DA SEMANA (como a veu.a.veu): segue o
// plano dia a dia (cada post sabe a sua DATA e o seu tipo) e grava com
// agendadoEm = a data planeada (é o PLANO, fica rascunho; nada publica sem o ✓).
// SÓ GERA TEXTO (não gasta créditos de imagem): a imagem gera-se depois, só das
// frases que ficarem (botão 'gerar imagens em falta'), para não pagar imagens de
// frases que vais descartar. Corre no servidor: pode sair/fechar a página.

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
      // a dor (face 1) de qualquer post desta conta entra na memória anti-repetição
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

  // Cada dia = 1 post de 2 FACES (como a mãe): face 1 = a DOR, face 2 = a
  // REVELAÇÃO (o mecanismo daquela dor, nasce dela). Véu ALTERNADO entre os 2 véus
  // da porta. SÓ texto (imageUrl null); as imagens das 2 faces geram-se depois.
  const rows: Record<string, unknown>[] = [];
  for (const { d, i } of tarefas) {
    const veu = d.post.veu ?? conta.veus[i % conta.veus.length];
    let dor: string;
    try {
      // VOZ DA PORTA: a dor orbita a FRASE-MÃE (a confissão recorrente que une os véus).
      const foco = conta.fraseMae ? { titulo: conta.fraseMae, exemplos: conta.sensacoes ?? [] } : undefined;
      dor = limparTravessoes(await fraseReconhecimento(veu, apiKey, evitar, foco)); evitar.push(dor);
    } catch { continue; }
    let rev: string;
    try { rev = limparTravessoes(await revelacaoDaDor(veu, dor, apiKey)); }
    catch { rev = limparTravessoes(SABER[veu]?.crencas?.[0]?.verdade ?? ''); }
    const conceitoVeu = nomeVeu(veu);
    const slides = [
      { tipo: 'metodo', face: 1, texto: dor, destaque: [], notaVisual: '', imageUrl: null, capa: true, conceito: '', contaId },
      { tipo: 'metodo', face: 2, texto: rev, destaque: realceAuto(rev), notaVisual: '', imageUrl: null, capa: false, conceito: 'Revelação', veuReveal: conceitoVeu, contaId },
    ];
    const numeroFaixa = ((Math.floor(Date.now() / 1000) + i) % 100) + 1;
    const faixa = { numero: numeroFaixa, titulo: `Faixa ${String(numeroFaixa).padStart(2, '0')}`, url: faixaUrl(numeroFaixa) };
    const legenda = limparTravessoes(`${dor}\n\n${rev}\n\nMétodo VS · ${conceitoVeu}`);
    const dias_ = [{ dia: 1, mundo: 'autora', palavra: dor.slice(0, 48), slides, faixa, legenda, hashtags: [] as string[] }];
    rows.push({
      slug: `metodo-2f-${contaId}-${d.data}`,
      title: dor.slice(0, 48), brief: dor, dias: dias_,
      theme: {
        formato: 'reel', subtipo: 'duasfaces', video: true, mundo: 'autora', marca: conta.marca,
        agendadoEm: d.data, hora: d.hora,
        metodo: { conta: contaId, tipo: 'duasfaces', veu },
      },
    });
  }

  if (!rows.length) return NextResponse.json({ erro: 'nada-gerado' }, { status: 500 });
  const { error } = await supabase.from('carousel_collections').upsert(rows, { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gerados: rows.length });
}
