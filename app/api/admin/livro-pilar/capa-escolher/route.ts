import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { guardarImagem } from '@/lib/banda/flux';
import { LIVRO_PILAR } from '@/lib/livro-pilar';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST { url } — fixa a variante escolhida como capa oficial do pilar,
// copiando-a para livro-pilar/os-7-veus/capa.jpg (path canónico, upsert).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { url?: string };
  if (!body.url) return NextResponse.json({ erro: 'sem-url' }, { status: 400 });

  const capaUrl = await guardarImagem(body.url, `livro-pilar/${LIVRO_PILAR.slug}/capa.jpg`);
  return NextResponse.json({ capaUrl: `${capaUrl}?v=${Date.now()}` });
}
