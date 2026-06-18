import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes } from '@/lib/texto';
import { CONTAS, ContaId } from '@/lib/metodo/contas';
import { nomeVeu, realceAuto } from '@/lib/metodo/texto-metodo';
import { gerarReelAnatomia } from '@/lib/metodo/reel-ia';
import { planoSemanaPecas } from '@/lib/metodo/peca';

export const runtime = 'nodejs';
export const maxDuration = 300;

// MOTOR NOVO · gera PEÇAS à arquitetura (família × véu × conta → ANATOMIA do reel)
// e grava no MESMO modelo que o Publicar lê (carousel_collections, 2 faces), para
// o pipeline de publicar/render/Metricool continuar a funcionar sem se lhe tocar.
//
// A anatomia (hook · reconhecimento · raiz · volta · envio) mapeia em 2 faces:
//   Face 1 = hook + reconhecimento (a dor que para o scroll)
//   Face 2 = raiz + volta (o mecanismo e o alívio/direção da conta)
//   envio  = vai para a legenda (o "manda a quem precisa").
//
// POST { conta, semanas?, offset?, dia?, completar? } — mesmo contrato do antigo.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { conta?: string; semanas?: number; offset?: number; dia?: string; completar?: boolean };
  const contaId = (body.conta ?? '') as ContaId;
  const conta = CONTAS[contaId];
  if (!conta) return NextResponse.json({ erro: 'conta-desconhecida' }, { status: 400 });
  const semanas = Math.min(4, Math.max(1, body.semanas ?? 1));
  const offset = Math.max(-12, Math.min(12, body.offset ?? 0));

  const supabase = getSupabaseAdmin();

  // MEMÓRIA anti-repetição + datas já geradas (completar) + publicadas (intocáveis).
  const evitar: string[] = [];
  const datasExistentes = new Set<string>();
  const publicadasDatas = new Set<string>();
  try {
    const { data: existentes } = await supabase.from('carousel_collections').select('dias, theme').like('slug', 'metodo-%');
    for (const r of (existentes ?? []) as { dias?: Array<{ slides?: Array<{ texto?: string }> }>; theme?: { agendadoEm?: string; igPublicado?: boolean; publicado?: boolean; metodo?: { conta?: string } } }[]) {
      if (r.theme?.metodo?.conta !== contaId) continue;
      if (r.theme?.agendadoEm) {
        datasExistentes.add(r.theme.agendadoEm);
        if (r.theme?.igPublicado || r.theme?.publicado) publicadasDatas.add(r.theme.agendadoEm);
      }
      const tx = r.dias?.[0]?.slides?.[0]?.texto;
      if (tx) evitar.push(tx);
    }
  } catch { /* sem memória prévia, segue */ }

  // dias a gerar (cada um já sabe a sua peça: véu do dia × personagem × conta).
  type Tarefa = ReturnType<typeof planoSemanaPecas>[number];
  let tarefas: Tarefa[];
  if (body.dia || body.completar) {
    const semana = planoSemanaPecas(contaId, offset);
    if (body.dia) tarefas = semana.filter((t) => t.data === body.dia);
    else tarefas = semana.filter((t) => !datasExistentes.has(t.data)); // completar: só os que faltam
  } else {
    tarefas = Array.from({ length: semanas }).flatMap((_, w) => planoSemanaPecas(contaId, offset + w));
  }
  // SEGURANÇA: nunca regenerar/sobrescrever um dia já PUBLICADO.
  tarefas = tarefas.filter((t) => !publicadasDatas.has(t.data));
  if (!tarefas.length) return NextResponse.json({ ok: true, gerados: 0, jaExistiam: true });

  const rows: Record<string, unknown>[] = [];
  let i = 0;
  for (const t of tarefas) {
    let reel;
    try { reel = await gerarReelAnatomia(contaId, t.veu, t.personagem, apiKey, evitar); }
    catch { continue; }
    const face1 = limparTravessoes([reel.hook, reel.reconhecimento].filter(Boolean).join(' '));
    const face2 = limparTravessoes([reel.raiz, reel.volta].filter(Boolean).join(' '));
    if (!face1) continue;
    evitar.push(face1);
    const conceitoVeu = nomeVeu(t.veu);
    const slides = [
      { tipo: 'metodo', face: 1, texto: face1, destaque: [], notaVisual: '', imageUrl: null, capa: true, conceito: '', contaId },
      { tipo: 'metodo', face: 2, texto: face2, destaque: realceAuto(reel.volta || face2), notaVisual: '', imageUrl: null, capa: false, conceito: t.personagem.nome, veuReveal: conceitoVeu, contaId },
    ];
    const numeroFaixa = ((Math.floor(Date.now() / 1000) + i) % 100) + 1;
    const faixa = { numero: numeroFaixa, titulo: `Faixa ${String(numeroFaixa).padStart(2, '0')}`, url: faixaUrl(numeroFaixa) };
    const legenda = limparTravessoes(`${face1}\n\n${face2}${reel.envio ? `\n\n${reel.envio}` : ''}\n\nMétodo VS · ${conceitoVeu}`);
    const dias_ = [{ dia: 1, mundo: 'autora', palavra: face1.slice(0, 48), slides, faixa, legenda, hashtags: [] as string[] }];
    rows.push({
      slug: `metodo-anatomia-${contaId}-${t.data}`,
      title: face1.slice(0, 48), brief: face1, dias: dias_,
      theme: {
        formato: 'reel', subtipo: 'duasfaces', video: true, mundo: 'autora', marca: conta.marca,
        agendadoEm: t.data, hora: t.hora,
        metodo: { conta: contaId, tipo: 'duasfaces', veu: t.veu, familia: t.familia?.id, personagem: t.personagem.id, face: t.face.chave },
      },
    });
    i += 1;
  }

  if (!rows.length) return NextResponse.json({ erro: 'nada-gerado' }, { status: 500 });
  const { error } = await supabase.from('carousel_collections').upsert(rows, { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gerados: rows.length });
}
