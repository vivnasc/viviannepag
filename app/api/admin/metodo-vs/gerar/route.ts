import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { limparTravessoes } from '@/lib/texto';
import { type VeuNome, type ContaId } from '@/lib/metodo/contas';
import { gerarPecaVS, promptImagemVS, VEUS_VS } from '@/lib/metodo-vs/gerar';
import { FORMATOS_LISTA, CALENDARIO, type FormatoId } from '@/lib/metodo-vs/formatos';
import { METODOVS_MUNDO, metodoVSConta } from '@/lib/metodo-vs/marca';
import { SLUG_PADROES, mergePadroes, type PadroesVS, type PadroesPorConta } from '@/lib/metodo-vs/padroes';

export const runtime = 'nodejs';
export const maxDuration = 300;

// MÉTODO VS · gera peças (a VOZ DA REVELAÇÃO) em vários FORMATOS, e grava-as com
// marca='metodovs' (render kinético, assinado @vivianne.dos.santos). Dois modos:
//  - 1 peça: { formato?, veu? } (à sorte se faltar) — vários formatos num toque.
//  - a semana: { semana:true, offset } — segue o CALENDÁRIO (vários posts/dia, datas
//    e horas), salta os que já existem, nunca gera passado.

async function fundoImagem(prompt: string, slug: string): Promise<string | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token || !prompt) return null;
  try {
    // o prompt guardado é só a CENA; o estilo + banimentos entram aqui (promptImagemVS).
    const url = await gerarImagemFlux(promptImagemVS(prompt), token, { raw: true });
    try { return await guardarImagem(url, `metodovs/${slug}/fundo-${Date.now()}.jpg`); } catch { return url; }
  } catch { return null; }
}

function montarRow(marca: string, handle: string, slug: string, veu: VeuNome, formato: FormatoId, peca: Awaited<ReturnType<typeof gerarPecaVS>>, imageUrl: string | null, padroes: PadroesVS, agendadoEm?: string, hora?: string) {
  // a peça NOVA herda os PADRÕES GLOBAIS da conta (transição, ritmo, tipografia, motion)
  // — gravados no slide[0], de onde o preview e o render leem. (o estúdio como sistema.)
  const slides = peca.momentos.map((texto, idx) => ({
    tipo: 'kinetico', texto,
    destaque: idx === 0 ? peca.destaque : [],
    notaVisual: peca.fundoPrompt, imageUrl,
    capa: idx === 0, conceito: idx === 0 ? peca.conceito : undefined,
    ...(idx === 0 ? {
      transicao: padroes.transicao, segPorMomento: padroes.segPorMomento, motionAuto: padroes.motionAuto,
      tipografia: { fonte: padroes.fonte, tamanho: padroes.tamanho, cor: padroes.cor, corDestaque: padroes.corDestaque },
    } : {}),
  }));
  const legenda = limparTravessoes(`${peca.legenda}\n\nMétodo VS · @${handle}\n\n${peca.hashtags.map((t) => `#${t}`).join(' ')}`);
  const dias = [{ dia: 1, mundo: METODOVS_MUNDO, palavra: peca.momentos[0].slice(0, 48), slides, legenda, hashtags: peca.hashtags }];
  return {
    slug, title: peca.momentos[0].slice(0, 60), brief: peca.momentos[0], dias,
    theme: { formato: 'reel', subtipo: 'kinetico', video: true, mundo: METODOVS_MUNDO, marca, agendadoEm, hora, metodovs: { veu, formato } },
  };
}

function segDaSemana(offset: number): Date {
  const x = new Date(); const wd = x.getDay();
  x.setDate(x.getDate() + (wd === 0 ? -6 : 1 - wd) + offset * 7); x.setHours(0, 0, 0, 0);
  return x;
}
const dataLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { conta?: ContaId; veu?: VeuNome; formato?: FormatoId; quantos?: number; semana?: boolean; offset?: number };
  const cfg = metodoVSConta(body.conta);
  const conta = cfg.id;
  const PRE = cfg.prefixo; // 'metodovs' (mãe) | 'versoltar' | 'virsoltar' | 'viversoltar'
  const supabase = getSupabaseAdmin();

  // os PADRÕES GLOBAIS da conta (de onde as peças novas herdam transição/ritmo/tipografia).
  let padroes: PadroesVS;
  try {
    const { data } = await supabase.from('carousel_collections').select('theme').eq('slug', SLUG_PADROES).maybeSingle();
    padroes = mergePadroes(conta, ((data?.theme as { padroes?: PadroesPorConta })?.padroes ?? {})[conta]);
  } catch { padroes = mergePadroes(conta); }

  // anti-repetição + slugs existentes (só desta conta).
  const evitar: string[] = [];
  const existentes = new Set<string>();
  try {
    const { data } = await supabase.from('carousel_collections').select('slug, dias, theme').like('slug', `${PRE}-%`);
    for (const r of (data ?? []) as { slug: string; dias?: Array<{ slides?: Array<{ texto?: string }> }>; theme?: { igPublicado?: boolean; publicado?: boolean } }[]) {
      existentes.add(r.slug);
      const t = r.dias?.[0]?.slides?.[0]?.texto; if (t) evitar.push(t);
    }
  } catch { /* sem memória */ }

  const rows: Record<string, unknown>[] = [];
  let ultimoErro = '';

  if (body.semana) {
    // A SEMANA pelo calendário: vários posts/dia, datas + horas, nunca o passado.
    const offset = Math.max(-8, Math.min(12, body.offset ?? 0));
    const seg = segDaSemana(offset);
    const hoje = dataLocal(new Date());
    for (const slot of CALENDARIO) {
      const d = new Date(seg); d.setDate(seg.getDate() + (slot.wd === 0 ? 6 : slot.wd - 1));
      const data = dataLocal(d);
      if (data < hoje) continue; // nunca gera passado
      const veu = VEUS_VS[(Math.floor(d.getTime() / 864e5) % VEUS_VS.length + VEUS_VS.length) % VEUS_VS.length];
      const slug = `${PRE}-${data}-${slot.hora.replace(':', '')}-${slot.formato}`;
      if (existentes.has(slug)) continue;
      try {
        const peca = await gerarPecaVS(veu, slot.formato, apiKey, evitar, conta);
        const imageUrl = await fundoImagem(peca.fundoPrompt, slug);
        rows.push(montarRow(cfg.marca, cfg.slide.assinatura.replace(/^@/, ''), slug, veu, slot.formato, peca, imageUrl, padroes, data, slot.hora));
        evitar.push(peca.momentos[0]); existentes.add(slug);
      } catch (e) { ultimoErro = e instanceof Error ? e.message : String(e); }
    }
  } else {
    // 1 peça: o formato/véu pedido, ou à sorte (para variar).
    const quantos = Math.min(4, Math.max(1, body.quantos ?? 1));
    for (let i = 0; i < quantos; i++) {
      const formato = body.formato ?? FORMATOS_LISTA[Math.floor(Math.random() * FORMATOS_LISTA.length)].id;
      const veu = body.veu ?? VEUS_VS[(Math.floor(Date.now() / 1000) + i) % VEUS_VS.length];
      try {
        const peca = await gerarPecaVS(veu, formato, apiKey, evitar, conta);
        const slug = `${PRE}-${veu}-${formato}-${Date.now()}-${i}`;
        const imageUrl = await fundoImagem(peca.fundoPrompt, slug);
        rows.push(montarRow(cfg.marca, cfg.slide.assinatura.replace(/^@/, ''), slug, veu, formato, peca, imageUrl, padroes));
        evitar.push(peca.momentos[0]);
      } catch (e) { ultimoErro = e instanceof Error ? e.message : String(e); }
    }
  }

  if (!rows.length) return NextResponse.json({ ok: true, gerados: 0, jaExistiam: !ultimoErro, detalhe: ultimoErro || undefined });
  const { error } = await supabase.from('carousel_collections').upsert(rows, { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gerados: rows.length, detalhe: ultimoErro || undefined });
}
