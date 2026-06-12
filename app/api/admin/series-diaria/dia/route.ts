import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarFraseSerie } from '@/lib/series/gerarFrase';
import { limparTravessoes } from '@/lib/texto';
import type { Serie } from '@/lib/series/voz';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST { slug, action } — mexer num SÓ dia da série, sem tocar no lote:
//   'regenerar' → o Claude escreve OUTRA frase (curta) + legenda + prompt MJ
//   'editar'    → grava a frase (e legenda) editadas à mão { frase, legenda? }
// Em ambos, o videoUrl é LIMPO (o MP4 antigo ficou desatualizado): o dia volta
// a "falta render" e re-renderiza-se no ③ (ou no botão do próprio dia).
type S0 = { frase?: string; motionUrl?: string | null; videoUrl?: string | null };
type Dia = { palavra?: string; slides?: S0[]; legenda?: string; videoUrl?: string | null };

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string; action?: string; frase?: string; legenda?: string };
  const slug = (body.slug || '').trim();
  if (!slug) return NextResponse.json({ erro: 'falta slug' }, { status: 400 });

  const sb = getSupabaseAdmin();
  const { data: row, error: e1 } = await sb.from('carousel_collections').select('dias, theme').eq('slug', slug).single();
  if (e1 || !row) return NextResponse.json({ erro: 'dia-nao-encontrado' }, { status: 404 });
  const theme = { ...((row.theme as Record<string, unknown>) ?? {}) } as { serie?: Serie; dia?: string; mjPrompt?: string; formato?: string };
  if (theme.formato !== 'serie-diaria') return NextResponse.json({ erro: 'nao-e-serie' }, { status: 400 });
  const dias = (Array.isArray(row.dias) ? row.dias : []) as Dia[];
  const d0 = dias[0];
  if (!d0) return NextResponse.json({ erro: 'sem-dias' }, { status: 500 });

  let frase = '', legenda = '', mjPrompt: string | undefined;

  if (body.action === 'regenerar') {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });
    // evitar TODAS as frases já usadas na série (incluindo a atual deste dia)
    const { data: existentes } = await sb.from('carousel_collections').select('dias, theme').eq('theme->>formato', 'serie-diaria');
    const evitar = new Set<string>();
    for (const c of existentes ?? []) {
      const t = (c.theme as { serie?: string } | null) ?? {};
      if (t.serie && t.serie !== theme.serie) continue;
      for (const d of (Array.isArray(c.dias) ? c.dias : []) as Dia[]) {
        if (typeof d?.palavra === 'string' && d.palavra.trim()) evitar.add(d.palavra.trim());
      }
    }
    try {
      const novo = await gerarFraseSerie({ serie: theme.serie === 'vcsabia' ? 'vcsabia' : 'hojeemmim', dia: theme.dia, evitar: Array.from(evitar), apiKey });
      frase = novo.frase; legenda = novo.legenda; mjPrompt = novo.mjPrompt;
    } catch (e) { return NextResponse.json({ erro: 'claude', detalhe: e instanceof Error ? e.message : String(e) }, { status: 502 }); }
  } else if (body.action === 'editar') {
    frase = limparTravessoes((body.frase ?? '').trim());
    legenda = limparTravessoes((body.legenda ?? '').trim()) || frase;
    if (!frase) return NextResponse.json({ erro: 'falta frase' }, { status: 400 });
  } else {
    return NextResponse.json({ erro: 'action inválida' }, { status: 400 });
  }

  // aplica + invalida o MP4 antigo (texto mudou → render desatualizado)
  d0.palavra = frase;
  d0.legenda = legenda;
  d0.videoUrl = null;
  if (d0.slides?.[0]) { d0.slides[0].frase = frase; d0.slides[0].videoUrl = null; }
  const novoTheme = { ...theme, ...(mjPrompt ? { mjPrompt } : {}) };
  const { error } = await sb.from('carousel_collections').update({ title: frase.slice(0, 80), dias, theme: novoTheme }).eq('slug', slug);
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, frase, legenda, mjPrompt: mjPrompt ?? theme.mjPrompt ?? '' });
}
