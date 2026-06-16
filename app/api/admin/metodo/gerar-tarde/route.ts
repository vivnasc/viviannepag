import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { CONTAS, type ContaId, type VeuNome } from '@/lib/metodo/contas';
import { getFormato } from '@/lib/metodo/formatos';
import { gerarFormatoBeats } from '@/lib/metodo/formato-ia';
import { gerarFundoIA } from '@/lib/metodo/ia';
import { gerarSom } from '@/lib/series/som';
import { nomeVeu } from '@/lib/metodo/posts';

export const runtime = 'nodejs';
export const maxDuration = 300;

// CAMADA 2 · POST DA TARDE (reel dramático): pega num MOTOR + véu, gera os beats
// (texto), UMA cena dramática (imagem) e o SOM (ElevenLabs), e PERSISTE como um
// reel 'nbeats' — os beats aparecem em sequência sobre a cena, com música. Depois
// é só "animar" (a cena vira clip) e "renderizar". hora = tarde (17h).

async function fundoImagem(prompt: string, slug: string, token: string): Promise<string | null> {
  if (!prompt) return null;
  for (let t = 0; t < 4; t++) {
    try {
      const url = await gerarImagemFlux(prompt, token, { raw: true });
      try { return await guardarImagem(url, `metodo/${slug}/fundo-${Date.now()}.jpg`); } catch { return url; }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await new Promise((r) => setTimeout(r, /429|throttl/i.test(msg) ? 12000 : 1500 * (t + 1)));
    }
  }
  return null;
}

// a conta a que o véu pertence (as portas têm os seus véus; o resto cai na mãe).
function contaDoVeu(veu: VeuNome): ContaId {
  for (const c of Object.values(CONTAS)) if (c.veus.includes(veu)) return c.id;
  return 'mae';
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const token = process.env.REPLICATE_API_TOKEN;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });
  if (!token) return NextResponse.json({ erro: 'falta REPLICATE_API_TOKEN' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { formato?: string; veu?: string; data?: string };
  const formato = getFormato(body.formato ?? '');
  if (!formato) return NextResponse.json({ erro: 'formato-desconhecido' }, { status: 400 });
  const veu = (body.veu ?? '') as VeuNome;
  if (!veu) return NextResponse.json({ erro: 'veu' }, { status: 400 });
  const contaId = contaDoVeu(veu);
  const conta = CONTAS[contaId];

  // data: hoje (local) por defeito; a Vivianne ajusta na agenda.
  const hoje = new Date();
  const data = body.data || `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
  const slug = `metodo-tarde-${formato.id}-${veu.toLowerCase()}-${Date.now().toString(36)}`;

  // 1) BEATS (texto do motor)
  let beats: string[];
  try { beats = await gerarFormatoBeats(formato, veu, apiKey); }
  catch (e) { return NextResponse.json({ erro: 'beats', detalhe: e instanceof Error ? e.message : String(e) }, { status: 502 }); }
  if (!beats.length) return NextResponse.json({ erro: 'sem-beats' }, { status: 502 });

  // 2) CENA dramática (1 imagem que ENCARNA o 1.º beat) — vira o fundo do reel.
  let bgPrompt = '';
  let bgUrl: string | null = null;
  try {
    bgPrompt = await gerarFundoIA(conta, [], apiKey, beats[0], 'dramatico');
    bgUrl = await fundoImagem(bgPrompt, slug, token);
  } catch { /* segue sem imagem; a Vivianne gera depois */ }

  // 3) SOM dramático (ElevenLabs) — NÃO é o Ancient Ground (esse é o contemplativo).
  let faixaUrlTarde: string | null = null;
  try {
    const somPrompt = `Cinematic dramatic ambient soundscape, deep and emotional, slow building tension, atmospheric pads and distant resonance, no melody, no voices, seamless loop. Mood: ${formato.proposito}`;
    faixaUrlTarde = await gerarSom(somPrompt, slug);
  } catch { /* sem som; renderiza sem áudio, mete-se depois */ }

  // slides: 1 por beat. O slide 0 carrega a CENA (imagem) que será animada e usada
  // como fundo único; os outros só texto. O ÚLTIMO mostra o véu (a saída/direção).
  const slides = beats.map((texto, i) => ({
    tipo: 'metodo' as const,
    texto,
    destaque: [] as string[],
    notaVisual: i === 0 ? bgPrompt : '',
    imageUrl: i === 0 ? bgUrl : null,
    estilo: i === 0 ? 'dramatico' : undefined,
    capa: i === 0,
    conceito: i === 0 ? formato.nome : '',
    veuReveal: i === beats.length - 1 ? nomeVeu(veu) : undefined,
    contaId,
  }));

  const faixa = faixaUrlTarde ? { numero: 0, titulo: 'Som da tarde (ElevenLabs)', url: faixaUrlTarde } : undefined;
  const legenda = `${beats.join('\n\n')}\n\nMétodo VS · ${nomeVeu(veu)}`;
  const dias = [{ dia: 1, mundo: 'autora', palavra: beats[0].slice(0, 48), slides, faixa, legenda, hashtags: [] }];

  const row = {
    slug,
    title: beats[0].slice(0, 48),
    brief: beats[0],
    dias,
    theme: {
      formato: 'reel', subtipo: 'nbeats', video: true, mundo: 'autora', marca: conta.marca,
      agendadoEm: data, hora: '17:00',
      metodo: { conta: contaId, tipo: 'nbeats', veu, formato: formato.id, totalBeats: beats.length, tema: formato.nome },
    },
  };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('carousel_collections').upsert([row], { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, slug, conta: contaId, beats, temImagem: !!bgUrl, temSom: !!faixaUrlTarde });
}
