import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes } from '@/lib/texto';
import { SOULAB, SOULAB_MUNDO, getTipoSoulab, type TipoSoulabId } from '@/lib/soulab/marca';
import { gerarPecaSoulab } from '@/lib/soulab/gerar-ia';

export const runtime = 'nodejs';
export const maxDuration = 300;

// SOULAB · gera N peças (reels contemplativos) de um ÂNGULO e grava-as em
// carousel_collections com theme.marca='soulab' (vehículo 'kinetico': imagem
// simbólica + fragmento que se revela). Assim aparecem no Publicar e no Analítico
// sem tocar nos outros motores. A imagem (Flux) gera-se já aqui — a peça nasce
// pronta a renderizar.

// gera a imagem de fundo (Flux) a partir do prompt e devolve o URL (ou null).
async function fundoImagem(prompt: string, slug: string): Promise<string | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token || !prompt) return null;
  try {
    const url = await gerarImagemFlux(prompt, token, { raw: true });
    try { return await guardarImagem(url, `soulab/${slug}/fundo-${Date.now()}.jpg`); } catch { return url; }
  } catch { return null; }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { tipo?: string; quantos?: number; tema?: string; formato?: 'frase' | 'momentos'; continuarDe?: string; modo?: 'abre' | 'encaminha' };
  const modo = body.modo === 'encaminha' ? 'encaminha' : 'abre';
  let tipoId = (body.tipo ?? 'frase') as TipoSoulabId;

  // CONTINUAR O FIO: parte 2 de um reel que resultou. Lê a peça-mãe (frase, conceito,
  // tipo) e herda o tipo dela, para o seguimento sair no mesmo registo.
  let continuarDe: { frase: string; conceito?: string } | null = null;
  if (body.continuarDe) {
    const supabaseC = getSupabaseAdmin();
    const { data } = await supabaseC.from('carousel_collections').select('dias, theme').eq('slug', body.continuarDe).maybeSingle();
    const s = (data?.dias as Array<{ slides?: Array<{ texto?: string; conceito?: string }> }> | undefined)?.[0]?.slides?.[0];
    if (s?.texto) continuarDe = { frase: s.texto, conceito: s.conceito };
    const tp = (data?.theme as { soulab?: { tipo?: string } } | undefined)?.soulab?.tipo;
    if (tp && getTipoSoulab(tp)) tipoId = tp as TipoSoulabId;
  }

  if (!getTipoSoulab(tipoId)) return NextResponse.json({ erro: 'tipo-invalido' }, { status: 400 });
  const quantos = Math.min(4, Math.max(1, body.quantos ?? 1));
  const tema = body.tema?.trim() || undefined;
  const formato = body.formato === 'momentos' ? 'momentos' : 'frase';

  const supabase = getSupabaseAdmin();

  // memória anti-repetição: frases/conceitos E cenas de imagem já usadas na Soulab.
  // Por TIPO (o mesmo tipo repetia-se) + as imagens (portas/objetos partidos a mais).
  const evitar: string[] = [];
  const porTipo: Record<string, string[]> = {};
  const evitarImg: string[] = [];
  try {
    const { data } = await supabase.from('carousel_collections').select('dias, theme').like('slug', 'soulab-%');
    for (const r of (data ?? []) as { dias?: Array<{ slides?: Array<{ texto?: string; conceito?: string; notaVisual?: string }> }>; theme?: { soulab?: { tipo?: string } } }[]) {
      const s = r.dias?.[0]?.slides?.[0];
      const tp = r.theme?.soulab?.tipo;
      if (s?.texto) { evitar.push(s.texto); if (tp) (porTipo[tp] = porTipo[tp] || []).push(s.texto); }
      if (s?.conceito) evitar.push(s.conceito);
      if (s?.notaVisual) evitarImg.push(s.notaVisual);
    }
  } catch { /* sem memória */ }
  // ao gerar um tipo, vê TODAS as frases já feitas desse tipo + as gerais recentes.
  const evitarDoTipo = () => [...new Set([...(porTipo[tipoId] || []), ...evitar.slice(-20)])];

  const rows: Record<string, unknown>[] = [];
  let ultimoErro = '';
  for (let i = 0; i < quantos; i++) {
    try {
      const peca = await gerarPecaSoulab(tipoId, apiKey, evitarDoTipo(), tema, formato, evitarImg, continuarDe, modo);
      evitar.push(peca.frase); (porTipo[tipoId] = porTipo[tipoId] || []).push(peca.frase);
      if (peca.conceito) evitar.push(peca.conceito);
      if (peca.fundoPrompt) evitarImg.push(peca.fundoPrompt); // não repetir a cena nas seguintes

      const slug = `soulab-${tipoId}-${Date.now()}-${i}`;
      const imageUrl = await fundoImagem(peca.fundoPrompt, slug);
      // FORMATO: "vários momentos" => N slides (1 por linha), MESMA cena/imagem; o
      // render sequencia-os sobre o fundo partilhado. "frase" => 1 slide (o de sempre).
      const linhas = peca.momentos && peca.momentos.length > 1 ? peca.momentos : [peca.frase];
      const slides = linhas.map((texto, idx) => ({
        tipo: 'kinetico',
        texto,
        destaque: peca.destaque,
        notaVisual: peca.fundoPrompt,
        imageUrl,
        capa: idx === 0,
        conceito: idx === 0 ? peca.conceito : undefined,
      }));
      const numeroFaixa = (Math.floor(Date.now() / 1000) % 100) + 1;
      const faixa = { numero: numeroFaixa, titulo: `Faixa ${String(numeroFaixa).padStart(2, '0')}`, url: faixaUrl(numeroFaixa) };
      const legenda = limparTravessoes(`${peca.legenda}\n\nSoulab · @${SOULAB.handle}`);
      const dias = [{ dia: 1, mundo: SOULAB_MUNDO, palavra: peca.frase.slice(0, 48), slides, faixa, legenda, hashtags: peca.hashtags }];
      rows.push({
        slug,
        title: peca.titulo.slice(0, 60),
        brief: peca.frase,
        dias,
        theme: { formato: 'reel', subtipo: 'kinetico', video: true, mundo: SOULAB_MUNDO, marca: 'soulab', soulab: { tipo: tipoId, formato } },
      });
    } catch (e) { ultimoErro = e instanceof Error ? e.message : String(e); }
  }

  if (!rows.length) return NextResponse.json({ erro: 'sem-pecas', detalhe: ultimoErro || undefined }, { status: 502 });
  const { error } = await supabase.from('carousel_collections').upsert(rows, { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gerados: rows.length, detalhe: ultimoErro || undefined });
}
