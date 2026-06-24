import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarVoz, type EmocaoVoz } from '@/lib/metodo/voz';

export const runtime = 'nodejs';
export const maxDuration = 120;

// POST { slug } — gera a NARRAÇÃO (voz da Vivianne, ElevenLabs) que LÊ o texto do
// post (os slides em sequência) e guarda em dias[0].vozUrl. Devolve o URL para
// ouvires no player. NÃO é o som ambiente (isso é /som); é a voz por cima.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { slug, remover, emocao, expressiva, modelo, voiceId } = (await req.json().catch(() => ({}))) as { slug?: string; remover?: boolean; emocao?: EmocaoVoz; expressiva?: boolean; modelo?: 'v3' | 'v2'; voiceId?: string };
  if (!slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('carousel_collections').select('dias').eq('slug', slug).maybeSingle();
  if (error || !row) return NextResponse.json({ erro: 'nao-encontrado' }, { status: 404 });

  const dias = (Array.isArray(row.dias) ? row.dias : []) as Array<{ slides?: Array<{ texto?: string }>; vozUrl?: string | null; vozPalavras?: unknown; vozDur?: number }>;

  // REMOVER a voz (a Vivianne: saiu com sotaque errado, quero tirá-la): limpa a voz e
  // os tempos do karaokê — o reel volta a ser sem voz (só motion + som).
  if (remover) {
    if (dias[0]) { dias[0].vozUrl = null; dias[0].vozPalavras = []; dias[0].vozDur = 0; }
    await supabase.from('carousel_collections').update({ dias }).eq('slug', slug);
    return NextResponse.json({ ok: true, removida: true });
  }

  const slides = dias[0]?.slides ?? [];
  // a narração lê os slides por ordem (uma pausa entre eles para respirar).
  const texto = slides.map((s) => (s.texto ?? '').trim()).filter(Boolean).join('\n\n');
  if (!texto) return NextResponse.json({ erro: 'sem-texto', detalhe: 'este post não tem texto para narrar' }, { status: 409 });

  let r: { url: string; palavras: unknown[]; dur: number };
  try { r = await gerarVoz(texto, slug, { emocao, expressiva, modelo, voiceId }); }
  catch (e) { return NextResponse.json({ erro: 'voz', detalhe: e instanceof Error ? e.message : String(e) }, { status: 502 }); }

  // guarda a voz + o tempo de cada PALAVRA (para o karaokê) + a duração.
  if (dias[0]) { dias[0].vozUrl = r.url; dias[0].vozPalavras = r.palavras; dias[0].vozDur = r.dur; }
  await supabase.from('carousel_collections').update({ dias }).eq('slug', slug);
  return NextResponse.json({ ok: true, voz: r.url, palavras: r.palavras.length, dur: r.dur });
}
