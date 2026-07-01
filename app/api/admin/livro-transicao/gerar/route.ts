import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { guardarImagem } from '@/lib/banda/flux';
import { IMAGENS_POR_CHAVE } from '@/lib/livro-transicao';

export const runtime = 'nodejs';
export const maxDuration = 300;

// POST { chave } — gera UMA imagem do livro (capa ou vinheta de Parte) no
// Replicate (flux-1.1-pro, rácio por imagem, estética do manifesto) e guarda em
// livro-transicao/<chave>.jpg (upsert: a mais recente vence; o render vai
// sempre buscar essa). A capa carregada pela Vivianne (capa-propria) tem
// prioridade no render.

type Prediction = {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string | string[];
  error?: string;
};

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'sem-replicate-token' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { chave?: string };
  const img = IMAGENS_POR_CHAVE[body.chave ?? ''];
  if (!img) return NextResponse.json({ erro: 'chave-invalida' }, { status: 400 });

  const createRes = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'wait=60' },
    body: JSON.stringify({
      input: { prompt: img.prompt, aspect_ratio: img.aspect, output_format: 'jpg', output_quality: 95, safety_tolerance: 5 },
    }),
  });
  if (!createRes.ok) {
    return NextResponse.json({ erro: `replicate ${createRes.status}: ${(await createRes.text()).slice(0, 160)}` }, { status: 502 });
  }
  let pred = (await createRes.json()) as Prediction;
  let polls = 0;
  while (!['succeeded', 'failed', 'canceled'].includes(pred.status) && polls < 90) {
    await new Promise((r) => setTimeout(r, 2000));
    const pr = await fetch(`https://api.replicate.com/v1/predictions/${pred.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!pr.ok) return NextResponse.json({ erro: `replicate poll ${pr.status}` }, { status: 502 });
    pred = (await pr.json()) as Prediction;
    polls++;
  }
  if (pred.status !== 'succeeded') {
    return NextResponse.json({ erro: `replicate: ${pred.error ?? pred.status}` }, { status: 502 });
  }
  const out = Array.isArray(pred.output) ? pred.output[0] : pred.output;
  if (!out) return NextResponse.json({ erro: 'replicate sem output' }, { status: 502 });

  let imageUrl = out;
  try {
    // cache-busting no URL devolvido à UI; o ficheiro no bucket é estável.
    const url = await guardarImagem(out, `livro-transicao/${img.chave}.jpg`);
    imageUrl = `${url}?v=${Date.now()}`;
  } catch {
    /* fica o URL do Replicate (expira, mas dá para ver) */
  }
  return NextResponse.json({ imageUrl, chave: img.chave });
}
