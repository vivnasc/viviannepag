import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import livro from '@/livro/livro.json';
import { readEdicoes, idDe, type Edicoes } from '@/lib/livro-edicoes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET — o livro para ler/editar: base do git (livro.json) + overlay das edições
// da Vivianne (Supabase). Devolve, por unidade, o texto a editar e o original.
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  let edicoes: Edicoes = {};
  try {
    edicoes = await readEdicoes();
  } catch {
    edicoes = {};
  }

  const unidades = (livro.unidades as Array<Record<string, unknown>>).map((u) => {
    const id = idDe(u as { tipo: string; titulo?: string; kicker?: string });
    const e = edicoes[id];
    const original = (u.texto as string[]) ?? [];
    return {
      id,
      tipo: u.tipo as string,
      kicker: (u.kicker as string) ?? '',
      titulo: (u.titulo as string) ?? '',
      epigrafe: (u.epigrafe as string) ?? null,
      texto: e?.texto ?? original,
      textoOriginal: original,
      comentario: e?.comentario ?? '',
      editado: Boolean(e?.texto),
    };
  });

  return NextResponse.json({
    titulo: (livro as { titulo: string }).titulo,
    autora: (livro as { autora: string }).autora,
    unidades,
  });
}
