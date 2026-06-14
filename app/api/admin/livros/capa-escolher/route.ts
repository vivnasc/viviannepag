import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { guardarImagem } from '@/lib/banda/flux';
import { getLivroCapa } from '@/lib/livros-capa';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST { slug, url } — fixa a variante escolhida como capa do livro (capa.jpg).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { slug, url } = (await req.json().catch(() => ({}))) as { slug?: string; url?: string };
  const livro = getLivroCapa(slug ?? '');
  if (!livro) return NextResponse.json({ erro: 'livro-desconhecido' }, { status: 400 });
  if (!url) return NextResponse.json({ erro: 'sem-url' }, { status: 400 });
  const capaUrl = await guardarImagem(url, `livro-pilar/${livro.slug}/capa.jpg`);
  return NextResponse.json({ capaUrl: `${capaUrl}?v=${Date.now()}` });
}
