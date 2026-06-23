import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { limparTravessoes } from '@/lib/texto';
import { type VeuNome } from '@/lib/metodo/contas';
import { gerarPecaVS, VEUS_VS } from '@/lib/metodo-vs/gerar';
import { METODOVS_MARCA, METODOVS_MUNDO } from '@/lib/metodo-vs/marca';

export const runtime = 'nodejs';
export const maxDuration = 300;

// MÉTODO VS · gera N peças (a VOZ DA REVELAÇÃO) e grava-as em carousel_collections
// com marca='metodovs' (render kinético — imagem conceptual + linhas que respiram,
// a mesma moldura do Soulab, assinada @vivianne.dos.santos). Do zero; lê só o SABER.

async function fundoImagem(prompt: string, slug: string): Promise<string | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token || !prompt) return null;
  try {
    const url = await gerarImagemFlux(prompt, token, { raw: true });
    try { return await guardarImagem(url, `metodovs/${slug}/fundo-${Date.now()}.jpg`); } catch { return url; }
  } catch { return null; }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { veu?: VeuNome; quantos?: number };
  const quantos = Math.min(4, Math.max(1, body.quantos ?? 1));
  const supabase = getSupabaseAdmin();

  // anti-repetição: arranques/conceitos já usados nas peças do Método VS.
  const evitar: string[] = [];
  try {
    const { data } = await supabase.from('carousel_collections').select('dias').like('slug', 'metodovs-%');
    for (const r of (data ?? []) as { dias?: Array<{ slides?: Array<{ texto?: string; conceito?: string }> }> }[]) {
      const s = r.dias?.[0]?.slides?.[0];
      if (s?.texto) evitar.push(s.texto);
      if (s?.conceito) evitar.push(s.conceito);
    }
  } catch { /* sem memória */ }

  const rows: Record<string, unknown>[] = [];
  let ultimoErro = '';
  for (let i = 0; i < quantos; i++) {
    // o véu: o pedido, ou roda os 7 véus para variar.
    const veu = body.veu ?? VEUS_VS[(Math.floor(Date.now() / 1000) + i) % VEUS_VS.length];
    try {
      const peca = await gerarPecaVS(veu, apiKey, evitar);
      evitar.push(peca.momentos[0]); if (peca.conceito) evitar.push(peca.conceito);

      const slug = `metodovs-${veu}-${Date.now()}-${i}`;
      const imageUrl = await fundoImagem(peca.fundoPrompt, slug);
      // vários momentos => N slides (1 por linha), MESMA imagem; o render sequencia-os.
      const slides = peca.momentos.map((texto, idx) => ({
        tipo: 'kinetico',
        texto,
        destaque: idx === 0 ? peca.destaque : [],
        notaVisual: peca.fundoPrompt,
        imageUrl,
        capa: idx === 0,
        conceito: idx === 0 ? peca.conceito : undefined,
      }));
      const legenda = limparTravessoes(`${peca.legenda}\n\nMétodo VS · @vivianne.dos.santos\n\n${peca.hashtags.map((t) => `#${t}`).join(' ')}`);
      const dias = [{ dia: 1, mundo: METODOVS_MUNDO, palavra: peca.momentos[0].slice(0, 48), slides, legenda, hashtags: peca.hashtags }];
      rows.push({
        slug,
        title: peca.momentos[0].slice(0, 60),
        brief: peca.momentos[0],
        dias,
        theme: { formato: 'reel', subtipo: 'kinetico', video: true, mundo: METODOVS_MUNDO, marca: METODOVS_MARCA, metodovs: { veu } },
      });
    } catch (e) { ultimoErro = e instanceof Error ? e.message : String(e); }
  }

  if (!rows.length) return NextResponse.json({ erro: 'sem-pecas', detalhe: ultimoErro || undefined }, { status: 502 });
  const { error } = await supabase.from('carousel_collections').upsert(rows, { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gerados: rows.length, detalhe: ultimoErro || undefined });
}
