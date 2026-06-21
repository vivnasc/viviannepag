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

  const body = (await req.json().catch(() => ({}))) as { tipo?: string; quantos?: number; tema?: string };
  const tipoId = (body.tipo ?? 'frase') as TipoSoulabId;
  if (!getTipoSoulab(tipoId)) return NextResponse.json({ erro: 'tipo-invalido' }, { status: 400 });
  const quantos = Math.min(4, Math.max(1, body.quantos ?? 1));
  const tema = body.tema?.trim() || undefined;

  const supabase = getSupabaseAdmin();

  // memória anti-repetição: frases/conceitos já usados na Soulab.
  const evitar: string[] = [];
  try {
    const { data } = await supabase.from('carousel_collections').select('dias').like('slug', 'soulab-%');
    for (const r of (data ?? []) as { dias?: Array<{ slides?: Array<{ texto?: string; conceito?: string }> }> }[]) {
      const s = r.dias?.[0]?.slides?.[0];
      if (s?.texto) evitar.push(s.texto);
      if (s?.conceito) evitar.push(s.conceito);
    }
  } catch { /* sem memória */ }

  const rows: Record<string, unknown>[] = [];
  let ultimoErro = '';
  for (let i = 0; i < quantos; i++) {
    try {
      const peca = await gerarPecaSoulab(tipoId, apiKey, evitar, tema);
      evitar.push(peca.frase); if (peca.conceito) evitar.push(peca.conceito);

      const slug = `soulab-${tipoId}-${Date.now()}-${i}`;
      const imageUrl = await fundoImagem(peca.fundoPrompt, slug);
      const slides = [{
        tipo: 'kinetico',
        texto: peca.frase,
        destaque: peca.destaque,
        notaVisual: peca.fundoPrompt,
        imageUrl,
        capa: true,
        conceito: peca.conceito,
      }];
      const numeroFaixa = (Math.floor(Date.now() / 1000) % 100) + 1;
      const faixa = { numero: numeroFaixa, titulo: `Faixa ${String(numeroFaixa).padStart(2, '0')}`, url: faixaUrl(numeroFaixa) };
      const legenda = limparTravessoes(`${peca.legenda}\n\nSoulab · @${SOULAB.handle}`);
      const dias = [{ dia: 1, mundo: SOULAB_MUNDO, palavra: peca.frase.slice(0, 48), slides, faixa, legenda, hashtags: peca.hashtags }];
      rows.push({
        slug,
        title: peca.titulo.slice(0, 60),
        brief: peca.frase,
        dias,
        theme: { formato: 'reel', subtipo: 'kinetico', video: true, mundo: SOULAB_MUNDO, marca: 'soulab', soulab: { tipo: tipoId } },
      });
    } catch (e) { ultimoErro = e instanceof Error ? e.message : String(e); }
  }

  if (!rows.length) return NextResponse.json({ erro: 'sem-pecas', detalhe: ultimoErro || undefined }, { status: 502 });
  const { error } = await supabase.from('carousel_collections').upsert(rows, { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gerados: rows.length, detalhe: ultimoErro || undefined });
}
