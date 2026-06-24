import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { gerarVoz } from '@/lib/metodo/voz';
import GUIOES from '@/lib/anuncio/guiao.json';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Prévia da VOZ do anúncio: gera, na hora, a tua voz (eleven_v3) a ler a narração
// do guião, para a ouvires ANTES de mandar montar o vídeo. Sem GitHub. Usa a mesma
// função e voz dos teus conteúdos (lib/metodo/voz). É EXATAMENTE a voz que o vídeo
// final vai ter — sem surpresas.
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const v = (req.nextUrl.searchParams.get('variante') === 'B' ? 'B' : 'A') as 'A' | 'B';
  const g = (GUIOES as Record<string, { falas: string[] }>)[v];
  const texto = g.falas.join(' ');
  try {
    const { url, dur } = await gerarVoz(texto, `anuncio-${v.toLowerCase()}`);
    return NextResponse.json({ ok: true, url, dur, texto });
  } catch (e) {
    return NextResponse.json({ erro: (e as Error).message }, { status: 500 });
  }
}
