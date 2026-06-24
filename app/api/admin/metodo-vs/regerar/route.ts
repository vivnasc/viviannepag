import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { limparTravessoes } from '@/lib/texto';
import { type VeuNome, type ContaId } from '@/lib/metodo/contas';
import { gerarPecaVS, promptImagemVS } from '@/lib/metodo-vs/gerar';
import { type FormatoId } from '@/lib/metodo-vs/formatos';
import { METODOVS_CONTAS_LISTA } from '@/lib/metodo-vs/marca';

export const runtime = 'nodejs';
export const maxDuration = 300;

// MÉTODO VS · REGERAR O TEXTO de UMA peça (autonomia: "se sair mal, faço outra vez").
// Re-corre a revelação para o mesmo véu/formato/conta da peça e substitui os momentos,
// destaque, conceito, legenda e prompt de imagem — depois gera também uma imagem nova.
// MANTÉM o slug, a data e a hora (não desagenda nem duplica). Salta publicadas.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });
  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('carousel_collections').select('dias, theme').eq('slug', slug).maybeSingle();
  if (error || !row) return NextResponse.json({ erro: 'nao-encontrado' }, { status: 404 });

  const theme = (row.theme ?? {}) as { marca?: string; igPublicado?: boolean; publicado?: boolean; metodovs?: { veu?: VeuNome; formato?: FormatoId } };
  if (theme.igPublicado || theme.publicado) return NextResponse.json({ erro: 'publicada', detalhe: 'não se regera uma peça já publicada' }, { status: 409 });
  const veu = theme.metodovs?.veu; const formato = theme.metodovs?.formato;
  if (!veu || !formato) return NextResponse.json({ erro: 'sem-meta', detalhe: 'esta peça não diz o véu/formato' }, { status: 409 });
  const cfg = METODOVS_CONTAS_LISTA.find((c) => c.marca === theme.marca) ?? METODOVS_CONTAS_LISTA[0];
  const conta = cfg.id as ContaId;

  // anti-repetição: evitar os arranques das OUTRAS peças desta conta.
  const evitar: string[] = [];
  try {
    const { data } = await supabase.from('carousel_collections').select('slug, dias').like('slug', `${cfg.prefixo}-%`);
    for (const r of (data ?? []) as { slug: string; dias?: Array<{ slides?: Array<{ texto?: string }> }> }[]) {
      if (r.slug === slug) continue;
      const t = r.dias?.[0]?.slides?.[0]?.texto; if (t) evitar.push(t);
    }
  } catch { /* sem memória */ }

  let peca: Awaited<ReturnType<typeof gerarPecaVS>>;
  try { peca = await gerarPecaVS(veu, formato, apiKey, evitar, conta); }
  catch (e) { return NextResponse.json({ erro: 'gerar', detalhe: e instanceof Error ? e.message : String(e) }, { status: 502 }); }

  // imagem nova a partir do novo prompt (best-effort; se falhar, fica sem trocar).
  let imageUrl: string | null = null;
  const token = process.env.REPLICATE_API_TOKEN;
  if (token && peca.fundoPrompt) {
    try {
      const raw = await gerarImagemFlux(promptImagemVS(peca.fundoPrompt), token, { raw: true });
      try { imageUrl = await guardarImagem(raw, `metodovs/${slug}/fundo-${Date.now()}.jpg`); } catch { imageUrl = raw; }
    } catch { imageUrl = null; }
  }

  const dias = (Array.isArray(row.dias) ? row.dias : []) as Array<Record<string, unknown>>;
  const slides = peca.momentos.map((texto, idx) => ({
    tipo: 'kinetico', texto,
    destaque: idx === 0 ? peca.destaque : [],
    notaVisual: peca.fundoPrompt, imageUrl,
    capa: idx === 0, conceito: idx === 0 ? peca.conceito : undefined,
  }));
  const legenda = limparTravessoes(`${peca.legenda}\n\nMétodo VS · ${cfg.slide.assinatura}\n\n${peca.hashtags.map((t) => `#${t}`).join(' ')}`);
  if (!dias[0]) dias[0] = { dia: 1 };
  dias[0].slides = slides; dias[0].legenda = legenda; dias[0].hashtags = peca.hashtags;
  dias[0].videoUrl = null; // texto/imagem mudaram: tem de renderizar de novo

  const { error: e2 } = await supabase.from('carousel_collections').update({ dias }).eq('slug', slug);
  if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, momentos: peca.momentos.length, imagem: !!imageUrl });
}
