import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { getCapasSerie, setCapaSerie } from '@/lib/reels/capaSerie';

export const runtime = 'nodejs';
export const maxDuration = 300;

// Cena base por série (a imagem-assinatura fixa). Por agora: a lanterna.
const CENAS: Record<string, string> = {
  ninguem: 'a single old brass lantern glowing softly in the dark, warm light revealing soft dust and shadow around it',
};

// GET — capas guardadas. POST { serie } — gera a imagem (Flux) e fixa-a.
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  return NextResponse.json({ capas: await getCapasSerie() });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'sem-replicate-token' }, { status: 500 });
  const { serie = 'ninguem' } = (await req.json().catch(() => ({}))) as { serie?: string };
  const cena = CENAS[serie] ?? CENAS.ninguem;
  try {
    const url = await gerarImagemFlux(cena, token, { estilo: 'gouache', tema: 'lanterna' });
    let finalUrl = url;
    try { finalUrl = await guardarImagem(url, `serie-capas/${serie}-${Date.now()}.jpg`); } catch { /* fica o URL do Replicate */ }
    const capas = await setCapaSerie(serie, finalUrl);
    return NextResponse.json({ ok: true, url: finalUrl, capas });
  } catch (e) {
    return NextResponse.json({ erro: 'flux', detalhe: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
