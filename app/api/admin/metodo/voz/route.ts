import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarVoz } from '@/lib/metodo/voz';

export const runtime = 'nodejs';
export const maxDuration = 120;

// POST { slug } — gera a NARRAÇÃO (voz da Vivianne, ElevenLabs) que LÊ o texto do
// post (os slides em sequência) e guarda em dias[0].vozUrl. Devolve o URL para
// ouvires no player. NÃO é o som ambiente (isso é /som); é a voz por cima.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('carousel_collections').select('dias').eq('slug', slug).maybeSingle();
  if (error || !row) return NextResponse.json({ erro: 'nao-encontrado' }, { status: 404 });

  const dias = (Array.isArray(row.dias) ? row.dias : []) as Array<{ slides?: Array<{ texto?: string }>; vozUrl?: string | null }>;
  const slides = dias[0]?.slides ?? [];
  // a narração lê os slides por ordem (uma pausa entre eles para respirar).
  const texto = slides.map((s) => (s.texto ?? '').trim()).filter(Boolean).join('\n\n');
  if (!texto) return NextResponse.json({ erro: 'sem-texto', detalhe: 'este post não tem texto para narrar' }, { status: 409 });

  let url: string;
  try { url = await gerarVoz(texto, slug); }
  catch (e) { return NextResponse.json({ erro: 'voz', detalhe: e instanceof Error ? e.message : String(e) }, { status: 502 }); }

  if (dias[0]) dias[0].vozUrl = url;
  await supabase.from('carousel_collections').update({ dias }).eq('slug', slug);
  return NextResponse.json({ ok: true, voz: url });
}
