import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { somPromptDeCena, gerarSom } from '@/lib/series/som';

export const runtime = 'nodejs';
export const maxDuration = 120;

// SOULAB · SOM DA CENA — gera um som ambiente A PARTIR DA IMAGEM gerada (a cena),
// reaproveitando o motor das séries (ElevenLabs sound-generation). Guarda o URL em
// theme.soulab.somUrl; o render usa-o como áudio do reel. `remover` volta à música.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string; remover?: boolean };
  if (!body.slug) return NextResponse.json({ erro: 'falta slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('carousel_collections').select('dias, theme').eq('slug', body.slug).single();
  if (error || !row) return NextResponse.json({ erro: 'db', detalhe: error?.message }, { status: 500 });

  const theme = { ...((row.theme as Record<string, unknown>) ?? {}) };
  const soulab = { ...((theme.soulab as Record<string, unknown>) ?? {}) };

  // remover: volta à música (Ancient Ground) — limpa o som da cena.
  if (body.remover) {
    soulab.somUrl = null; soulab.somPrompt = null; theme.soulab = soulab;
    const { error: e } = await supabase.from('carousel_collections').update({ theme }).eq('slug', body.slug);
    if (e) return NextResponse.json({ erro: 'db', detalhe: e.message }, { status: 500 });
    return NextResponse.json({ ok: true, somUrl: null });
  }

  // a CENA = o prompt da imagem (inglês), sem o sufixo do MJ; senão o conceito/texto.
  const dias = (row.dias as Array<{ slides?: Array<{ notaVisual?: string; conceito?: string; texto?: string }> }>) ?? [];
  const slide = dias?.[0]?.slides?.[0];
  const cena = ((slide?.notaVisual ?? '').replace(/--\w+[\s\S]*$/, '').trim() || slide?.conceito || slide?.texto || '').slice(0, 200);
  if (!cena) return NextResponse.json({ erro: 'sem-cena', detalhe: 'A peça ainda não tem imagem/cena. Gera a imagem primeiro.' }, { status: 400 });

  const prompt = somPromptDeCena(cena);
  let somUrl: string;
  try {
    somUrl = await gerarSom(prompt, body.slug);
  } catch (e) {
    return NextResponse.json({ erro: 'eleven-falhou', detalhe: String(e instanceof Error ? e.message : e) }, { status: 502 });
  }

  soulab.somUrl = somUrl; soulab.somPrompt = prompt; theme.soulab = soulab;
  const { error: e2 } = await supabase.from('carousel_collections').update({ theme }).eq('slug', body.slug);
  if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, somUrl });
}
