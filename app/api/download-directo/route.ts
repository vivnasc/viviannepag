import { NextResponse, type NextRequest } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')?.replace(/[^a-z0-9-]/g, '');
  if (!slug) {
    return NextResponse.json({ erro: 'slug-obrigatorio' }, { status: 400 });
  }

  const filePath = join(process.cwd(), 'private-produtos', `${slug}.pdf`);

  try {
    const file = await readFile(filePath);
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${slug}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ erro: 'ficheiro-nao-encontrado' }, { status: 404 });
  }
}
