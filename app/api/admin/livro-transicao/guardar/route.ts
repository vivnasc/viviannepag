import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { readEdicoes, writeEdicoes } from '@/lib/livro-edicoes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST { id, texto: string[], comentario?: string } — guarda a edição de uma
// unidade no overlay (Supabase Storage). NÃO toca no git nem no PDF.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const body = (await req.json()) as { id?: string; texto?: unknown; comentario?: unknown };
  const id = typeof body.id === 'string' ? body.id : '';
  if (!id) return NextResponse.json({ erro: 'sem-id' }, { status: 400 });

  const texto = Array.isArray(body.texto)
    ? body.texto.map((p) => String(p)).filter((p) => p.trim() !== '')
    : undefined;
  const comentario = typeof body.comentario === 'string' ? body.comentario : '';

  try {
    const edicoes = await readEdicoes();
    edicoes[id] = { texto, comentario, ts: Date.now() };
    await writeEdicoes(edicoes);
  } catch (e) {
    return NextResponse.json(
      { erro: 'storage', detalhe: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
