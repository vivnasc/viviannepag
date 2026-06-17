import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarVoz } from '@/lib/metodo/voz';

export const runtime = 'nodejs';
export const maxDuration = 120;

// POST { slug } — gera a VOZ (a tua, ElevenLabs) a LER o texto do post, para
// TESTARES a fidelidade do sotaque antes de usar. Guarda em dias[0].vozUrl e
// devolve o URL para ouvires. Junta os beats (tarde) ou as 2 faces (manhã).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('carousel_collections').select('dias').eq('slug', slug).maybeSingle();
  if (error || !row) return NextResponse.json({ erro: 'nao-encontrado' }, { status: 404 });

  const dias = (Array.isArray(row.dias) ? row.dias : []) as Array<{ slides?: Array<{ texto?: string }>; vozUrl?: string | null }>;
  const textos = (dias[0]?.slides ?? []).map((s) => (s.texto ?? '').trim()).filter(Boolean);
  if (!textos.length) return NextResponse.json({ erro: 'sem-texto' }, { status: 400 });
  // junta com pausa entre cada bloco (ponto + linha) para a leitura respirar.
  const guiao = textos.join('.\n\n');

  let vozUrl: string;
  try { vozUrl = await gerarVoz(guiao, slug); }
  catch (e) { return NextResponse.json({ erro: 'voz', detalhe: e instanceof Error ? e.message : String(e) }, { status: 502 }); }

  if (dias[0]) dias[0].vozUrl = vozUrl;
  await supabase.from('carousel_collections').update({ dias }).eq('slug', slug);
  return NextResponse.json({ ok: true, vozUrl });
}
