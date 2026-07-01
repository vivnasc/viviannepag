import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarVoz } from '@/lib/metodo/voz';

export const runtime = 'nodejs';
export const maxDuration = 120;

// VOZ DA MAE ANTES DO RENDER (regra da Vivianne: nada de surpresas no render). Gera a
// voz clonada (ElevenLabs) da frase da peca, guarda o URL em theme.soulab.vozUrl e
// devolve-o para ela OUVIR ja no admin. O render so usa este audio, nao gera nada.
// POST { slug } gera · POST { slug, remover:true } tira.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string; remover?: boolean };
  if (!body.slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('carousel_collections').select('brief, dias, theme').eq('slug', body.slug).maybeSingle();
  if (error || !data) return NextResponse.json({ erro: 'nao-encontrada' }, { status: 404 });

  type Theme = { soulab?: Record<string, unknown> } & Record<string, unknown>;
  const theme = (data.theme ?? {}) as Theme;
  const soulab = { ...(theme.soulab ?? {}) } as Record<string, unknown>;

  if (body.remover) {
    soulab.vozUrl = null; soulab.vozDur = null;
    await supabase.from('carousel_collections').update({ theme: { ...theme, soulab } }).eq('slug', body.slug);
    return NextResponse.json({ ok: true, vozUrl: null });
  }

  const slides = (data.dias as Array<{ slides?: Array<{ texto?: string }> }> | null)?.[0]?.slides ?? [];
  const textos = slides.map((s) => (s.texto || '').trim()).filter(Boolean);
  const linhas = textos.length > 1 ? textos : [((data.brief as string) || textos[0] || '').trim()];
  const texto = linhas.filter(Boolean).join('. ');
  if (!texto) return NextResponse.json({ erro: 'sem-texto' }, { status: 400 });

  try {
    const voz = await gerarVoz(texto, body.slug); // env = a voz clonada dela, v3 puro
    soulab.vozUrl = voz.url; soulab.vozDur = voz.dur;
    await supabase.from('carousel_collections').update({ theme: { ...theme, soulab } }).eq('slug', body.slug);
    return NextResponse.json({ ok: true, vozUrl: voz.url, dur: voz.dur });
  } catch (e) {
    return NextResponse.json({ erro: 'voz', detalhe: String(e instanceof Error ? e.message : e) }, { status: 502 });
  }
}
