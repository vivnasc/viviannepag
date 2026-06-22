import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { somPromptDeCena, gerarSom } from '@/lib/series/som';
import { gerarMusica } from '@/lib/soulab/musica';

export const runtime = 'nodejs';
export const maxDuration = 300;

// SOULAB · ÁUDIO DO REEL — três fontes à escolha dela, todas guardadas em
// theme.soulab.somUrl (o render usa esse URL como áudio):
//   tipo 'cena'    -> som ambiente A PARTIR DA IMAGEM (ElevenLabs sound-gen)
//   tipo 'maquina' -> som de máquina de escrever (acompanha o efeito teclado)
//   tipo 'musica'  -> música ambiente instrumental (flauta/piano…) via MusicGen
// `remover` volta à música da loja (limpa o áudio próprio).

// o prompt do som de máquina de escrever (acompanha o efeito de texto "teclado").
const PROMPT_MAQUINA =
  'Vintage manual typewriter typing steadily and rhythmically, crisp mechanical key clacks, ' +
  'occasional carriage return ding and slide, close and dry, clean, no music, no voices, seamless loop.';

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string; remover?: boolean; tipo?: string; estilo?: string };
  if (!body.slug) return NextResponse.json({ erro: 'falta slug' }, { status: 400 });
  const tipo = body.tipo === 'maquina' || body.tipo === 'musica' ? body.tipo : 'cena';

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('carousel_collections').select('dias, theme').eq('slug', body.slug).single();
  if (error || !row) return NextResponse.json({ erro: 'db', detalhe: error?.message }, { status: 500 });

  const theme = { ...((row.theme as Record<string, unknown>) ?? {}) };
  const soulab = { ...((theme.soulab as Record<string, unknown>) ?? {}) };

  // remover: volta à música da loja — limpa o áudio próprio da peça.
  if (body.remover) {
    soulab.somUrl = null; soulab.somPrompt = null; soulab.somTipo = null; soulab.somEstilo = null; theme.soulab = soulab;
    const { error: e } = await supabase.from('carousel_collections').update({ theme }).eq('slug', body.slug);
    if (e) return NextResponse.json({ erro: 'db', detalhe: e.message }, { status: 500 });
    return NextResponse.json({ ok: true, somUrl: null });
  }

  let somUrl: string;
  let somPrompt = '';
  let somEstilo: string | null = null;

  if (tipo === 'musica') {
    // MÚSICA AMBIENTE (instrumental) via Replicate MusicGen.
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) return NextResponse.json({ erro: 'falta REPLICATE_API_TOKEN' }, { status: 500 });
    somEstilo = body.estilo || 'flauta';
    try {
      somUrl = await gerarMusica(somEstilo, body.slug, token);
    } catch (e) {
      return NextResponse.json({ erro: 'musicgen-falhou', detalhe: String(e instanceof Error ? e.message : e) }, { status: 502 });
    }
    somPrompt = `música ambiente · ${somEstilo}`;
  } else if (tipo === 'maquina') {
    // SOM DE MÁQUINA DE ESCREVER (acompanha o efeito teclado) via ElevenLabs.
    somPrompt = PROMPT_MAQUINA;
    try {
      somUrl = await gerarSom(somPrompt, body.slug);
    } catch (e) {
      return NextResponse.json({ erro: 'eleven-falhou', detalhe: String(e instanceof Error ? e.message : e) }, { status: 502 });
    }
  } else {
    // SOM DA CENA = o prompt da imagem (inglês), sem o sufixo do MJ; senão o conceito/texto.
    const dias = (row.dias as Array<{ slides?: Array<{ notaVisual?: string; conceito?: string; texto?: string }> }>) ?? [];
    const slide = dias?.[0]?.slides?.[0];
    const cena = ((slide?.notaVisual ?? '').replace(/--\w+[\s\S]*$/, '').trim() || slide?.conceito || slide?.texto || '').slice(0, 200);
    if (!cena) return NextResponse.json({ erro: 'sem-cena', detalhe: 'A peça ainda não tem imagem/cena. Gera a imagem primeiro.' }, { status: 400 });
    somPrompt = somPromptDeCena(cena);
    try {
      somUrl = await gerarSom(somPrompt, body.slug);
    } catch (e) {
      return NextResponse.json({ erro: 'eleven-falhou', detalhe: String(e instanceof Error ? e.message : e) }, { status: 502 });
    }
  }

  soulab.somUrl = somUrl; soulab.somPrompt = somPrompt; soulab.somTipo = tipo; soulab.somEstilo = somEstilo;
  theme.soulab = soulab;
  const { error: e2 } = await supabase.from('carousel_collections').update({ theme }).eq('slug', body.slug);
  if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, somUrl, tipo });
}
