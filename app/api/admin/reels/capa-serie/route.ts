import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getCapasSerie, gerarCapaSerie } from '@/lib/reels/capaSerie';

export const runtime = 'nodejs';
export const maxDuration = 300;

// GET — capas guardadas. POST { serie } — gera (de novo) a imagem-assinatura e fixa-a.
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  return NextResponse.json({ capas: await getCapasSerie() });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'sem-replicate-token' }, { status: 500 });
  const { serie = 'ninguem' } = (await req.json().catch(() => ({}))) as { serie?: string };
  try {
    const url = await gerarCapaSerie(serie, token);
    return NextResponse.json({ ok: true, url, capas: await getCapasSerie() });
  } catch (e) {
    return NextResponse.json({ erro: 'flux', detalhe: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
