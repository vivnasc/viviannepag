import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { guardarImagem } from '@/lib/banda/flux';
import { getRomance } from '@/lib/romances';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST { slug, url } — fixa a variante escolhida como capa oficial do romance,
// copiando-a para romances/<slug>/capa.jpg (path canónico, upsert).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string; url?: string };
  const romance = getRomance(body.slug ?? '');
  if (!romance) return NextResponse.json({ erro: 'romance-desconhecido' }, { status: 400 });
  if (!body.url) return NextResponse.json({ erro: 'sem-url' }, { status: 400 });

  const capaUrl = await guardarImagem(body.url, `romances/${romance.slug}/capa.jpg`);
  return NextResponse.json({ capaUrl: `${capaUrl}?v=${Date.now()}` });
}
