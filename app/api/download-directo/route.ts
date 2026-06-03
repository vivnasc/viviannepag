import { NextResponse, type NextRequest } from 'next/server';
import { getProdutoPdfBuffer } from '@/lib/produto-pdf';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')?.replace(/[^a-z0-9-]/g, '');
  const email = req.nextUrl.searchParams.get('email') || '';
  const lang = (req.nextUrl.searchParams.get('lang') || '').toLowerCase();
  if (!slug) {
    return NextResponse.json({ erro: 'slug-obrigatorio' }, { status: 400 });
  }

  const res = await getProdutoPdfBuffer(slug, lang, email);
  if (!res) {
    return NextResponse.json({ erro: 'ficheiro-nao-encontrado' }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(res.buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${res.slug}.pdf"`,
    },
  });
}
