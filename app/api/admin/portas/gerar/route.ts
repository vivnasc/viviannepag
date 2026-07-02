import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes } from '@/lib/texto';
import { getPorta, getTipoPorta, type PortaId } from '@/lib/portas/marca';
import { gerarPecaPorta } from '@/lib/portas/gerar-ia';

export const runtime = 'nodejs';
export const maxDuration = 300;

// PORTAS · gera N pecas (reels) de um ANGULO de uma porta e grava-as em
// carousel_collections com theme.marca = id da porta (medo/sinais/transicao).
// Assim aparecem no Publicar sem tocar nos outros motores. Motor separado da Soulab.

async function fundoImagem(prompt: string, slug: string): Promise<string | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token || !prompt) return null;
  try {
    const url = await gerarImagemFlux(prompt, token, { raw: true });
    try { return await guardarImagem(url, `portas/${slug}/fundo-${Date.now()}.jpg`); } catch { return url; }
  } catch { return null; }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { porta?: string; tipo?: string; quantos?: number; tema?: string; formato?: 'frase' | 'momentos' };
  const porta = getPorta(body.porta ?? '');
  if (!porta) return NextResponse.json({ erro: 'porta-invalida' }, { status: 400 });
  const portaId = porta.id as PortaId;
  const tipoId = body.tipo ?? porta.tipos[0].id;
  if (!getTipoPorta(portaId, tipoId)) return NextResponse.json({ erro: 'tipo-invalido' }, { status: 400 });
  const quantos = Math.min(4, Math.max(1, body.quantos ?? 1));
  const tema = body.tema?.trim() || undefined;
  const formato = body.formato === 'momentos' ? 'momentos' : 'frase';

  const supabase = getSupabaseAdmin();

  // memoria anti-repeticao: frases/conceitos E cenas de imagem ja usadas nesta porta.
  const evitar: string[] = [];
  const porTipo: Record<string, string[]> = {};
  const evitarImg: string[] = [];
  try {
    const { data } = await supabase.from('carousel_collections').select('dias, theme').like('slug', `${portaId}-%`);
    for (const r of (data ?? []) as { dias?: Array<{ slides?: Array<{ texto?: string; conceito?: string; notaVisual?: string }> }>; theme?: { porta?: { tipo?: string } } }[]) {
      const s = r.dias?.[0]?.slides?.[0];
      const tp = r.theme?.porta?.tipo;
      if (s?.texto) { evitar.push(s.texto); if (tp) (porTipo[tp] = porTipo[tp] || []).push(s.texto); }
      if (s?.conceito) evitar.push(s.conceito);
      if (s?.notaVisual) evitarImg.push(s.notaVisual);
    }
  } catch { /* sem memoria */ }
  const evitarDoTipo = () => [...new Set([...(porTipo[tipoId] || []), ...evitar.slice(-20)])];

  const rows: Record<string, unknown>[] = [];
  let ultimoErro = '';
  for (let i = 0; i < quantos; i++) {
    try {
      const peca = await gerarPecaPorta(portaId, tipoId, apiKey, evitarDoTipo(), tema, formato, evitarImg);
      evitar.push(peca.frase); (porTipo[tipoId] = porTipo[tipoId] || []).push(peca.frase);
      if (peca.conceito) evitar.push(peca.conceito);
      if (peca.fundoPrompt) evitarImg.push(peca.fundoPrompt);

      const slug = `${portaId}-${tipoId}-${Date.now()}-${i}`;
      const imageUrl = await fundoImagem(peca.fundoPrompt, slug);
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
      const legenda = limparTravessoes(`${peca.legenda}\n\n@${porta.handle}`);
      const dias = [{ dia: 1, mundo: portaId, palavra: peca.frase.slice(0, 48), slides, faixa, legenda, hashtags: peca.hashtags }];
      rows.push({
        slug,
        title: peca.titulo.slice(0, 60),
        brief: peca.frase,
        dias,
        theme: { formato: 'reel', subtipo: 'kinetico', video: true, mundo: portaId, marca: portaId, porta: { tipo: tipoId, formato } },
      });
    } catch (e) { ultimoErro = e instanceof Error ? e.message : String(e); }
  }

  if (!rows.length) return NextResponse.json({ erro: 'sem-pecas', detalhe: ultimoErro || undefined }, { status: 502 });
  const { error } = await supabase.from('carousel_collections').upsert(rows, { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gerados: rows.length, detalhe: ultimoErro || undefined });
}
