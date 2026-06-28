import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { limparTravessoes } from '@/lib/texto';
import { promptImagemVS } from '@/lib/metodo-vs/gerar';
import { METODOVS_MUNDO, metodoVSConta } from '@/lib/metodo-vs/marca';
import { mergePadroes } from '@/lib/metodo-vs/padroes';
import { gerarHistoriaAntiga } from '@/lib/metodo-vs/gerar-historia';
import { getHistoria, HISTORIAS_BIBLICAS } from '@/lib/metodo-vs/historias-biblicas';

export const runtime = 'nodejs';
export const maxDuration = 300;

// MÉTODO VS · A HISTÓRIA ANTIGA (mãe). POST { id } — gera UMA peça a partir da
// leitura bíblica da Vivianne e grava-a (aparece no estúdio da mãe). GET lista as
// histórias disponíveis (para a página as mostrar).
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  return NextResponse.json({ historias: HISTORIAS_BIBLICAS });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem ANTHROPIC_API_KEY' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { id?: string };
  const h = body.id ? getHistoria(body.id) : undefined;
  if (!h) return NextResponse.json({ erro: 'historia desconhecida' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const cfg = metodoVSConta('mae');
  const padroes = mergePadroes('mae');
  const handle = cfg.slide.assinatura.replace(/^@/, '');

  // anti-repetição: as histórias já feitas deste véu (não repetir o arranque).
  const evitar: string[] = [];
  try {
    const { data } = await supabase.from('carousel_collections').select('dias').like('slug', `${cfg.prefixo}-historia-%`);
    for (const r of (data ?? []) as { dias?: Array<{ slides?: Array<{ texto?: string }> }> }[]) {
      const t = r.dias?.[0]?.slides?.[0]?.texto; if (t) evitar.push(t);
    }
  } catch { /* sem memória */ }

  let peca;
  try { peca = await gerarHistoriaAntiga(h, apiKey, evitar); }
  catch (e) { return NextResponse.json({ erro: 'gerar-falhou', detalhe: String(e instanceof Error ? e.message : e) }, { status: 502 }); }

  const slug = `${cfg.prefixo}-historia-${h.id}-${Date.now()}`;

  // imagem (a cena bíblica em registo da conta), igual à geração normal da mãe.
  let imageUrl: string | null = null;
  try {
    const token = process.env.REPLICATE_API_TOKEN;
    if (token && peca.fundoPrompt) {
      const url = await gerarImagemFlux(promptImagemVS(peca.fundoPrompt, 'mae'), token, { raw: true });
      try { imageUrl = await guardarImagem(url, `metodovs/${slug}/fundo-${Date.now()}.jpg`); } catch { imageUrl = url; }
    }
  } catch { /* sai sem imagem; ela gera depois com "outra imagem" */ }

  // monta os slides (mesma anatomia da mãe: padrões no slide 0).
  const slides: Record<string, unknown>[] = peca.momentos.map((texto, idx) => ({
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
  const row = {
    slug, title: `${h.historia} · ${peca.momentos[0].slice(0, 40)}`, brief: peca.momentos[0], dias,
    theme: { formato: 'reel', subtipo: 'kinetico', video: true, mundo: METODOVS_MUNDO, marca: cfg.marca, metodovs: { veu: h.veu, formato: 'historia', historia: h.id } },
  };

  const { error } = await supabase.from('carousel_collections').upsert([row], { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, slug, historia: h.historia, momentos: peca.momentos });
}
