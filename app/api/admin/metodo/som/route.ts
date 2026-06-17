import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarSom } from '@/lib/series/som';

export const runtime = 'nodejs';
export const maxDuration = 120;

// POST { slug } — gera o SOM ambiente dramático (ElevenLabs sound-generation) para
// o post da tarde e guarda em dias[0].faixa.url. NÃO é a voz (isso é /voz); é a
// atmosfera por baixo. Devolve o URL para ouvires no player.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('carousel_collections').select('dias, theme').eq('slug', slug).maybeSingle();
  if (error || !row) return NextResponse.json({ erro: 'nao-encontrado' }, { status: 404 });

  const dias = (Array.isArray(row.dias) ? row.dias : []) as Array<{ faixa?: { numero?: number; titulo?: string; url?: string } | null }>;
  const prompt = 'Cinematic dramatic ambient soundscape, deep and emotional, slow building tension, atmospheric pads and distant resonance, no melody, no voices, seamless loop.';

  let url: string;
  try { url = await gerarSom(prompt, slug); }
  catch (e) { return NextResponse.json({ erro: 'som', detalhe: e instanceof Error ? e.message : String(e) }, { status: 502 }); }

  if (dias[0]) dias[0].faixa = { numero: 0, titulo: 'Som da tarde (ElevenLabs)', url };
  await supabase.from('carousel_collections').update({ dias }).eq('slug', slug);
  return NextResponse.json({ ok: true, som: url });
}
