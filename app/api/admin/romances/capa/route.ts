import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { guardarImagem } from '@/lib/banda/flux';
import { getRomance, ROMANCE_CAPA_ESTILO, ROMANCE_CAPA_PALETA } from '@/lib/romances';

export const runtime = 'nodejs';
export const maxDuration = 300;

// POST { slug } — gera UMA variante de capa (Replicate flux-1.1-pro, 3:4,
// gouache da casa, SEM texto na imagem) e guarda em romances/<slug>/capa-<ts>.jpg.
// Chamada própria (e não gerarImagemFlux) porque a capa é 3:4, não 9:16.

const SAFETY = 'NO text, NO words, NO letters, NO logos, NO watermarks, NO captions';

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

  const body = (await req.json().catch(() => ({}))) as { slug?: string };
  const romance = getRomance(body.slug ?? '');
  if (!romance) return NextResponse.json({ erro: 'romance-desconhecido' }, { status: 400 });

  const prompt = `${romance.cena}\n\n${ROMANCE_CAPA_ESTILO}\n\n${ROMANCE_CAPA_PALETA}\n\n${SAFETY}`;

  const createRes = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'wait=60' },
    body: JSON.stringify({
      input: { prompt, aspect_ratio: '3:4', output_format: 'jpg', output_quality: 95, safety_tolerance: 5 },
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

  const ts = Date.now();
  let imageUrl = out;
  try {
    imageUrl = await guardarImagem(out, `romances/${romance.slug}/capa-${ts}.jpg`);
  } catch {
    /* fica o URL do Replicate (expira, mas dá para ver) */
  }
  return NextResponse.json({ imageUrl });
}
