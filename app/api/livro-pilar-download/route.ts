import { NextResponse } from 'next/server';
import { getProdutoPdfBuffer } from '@/lib/produto-pdf';

export const runtime = 'nodejs';

// GET ?email= · download do PDF do pilar (Os Sete Véus), pelo mesmo caminho dos
// produtos da loja (produtos/os-7-veus.pdf no bucket). Marca a licença se vier email.
export async function GET(req: Request) {
  const email = new URL(req.url).searchParams.get('email') ?? undefined;
  const res = await getProdutoPdfBuffer('os-7-veus', 'pt', email);
  if (!res) return NextResponse.json({ erro: 'sem-ficheiro' }, { status: 404 });
  return new NextResponse(res.buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Os Sete Veus - Vivianne dos Santos.pdf"',
    },
  });
}
