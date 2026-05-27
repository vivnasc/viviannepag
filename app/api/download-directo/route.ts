import { NextResponse, type NextRequest } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')?.replace(/[^a-z0-9-]/g, '');
  const email = req.nextUrl.searchParams.get('email') || '';
  if (!slug) {
    return NextResponse.json({ erro: 'slug-obrigatorio' }, { status: 400 });
  }

  const filePath = join(process.cwd(), 'private-produtos', `${slug}.pdf`);

  try {
    const file = await readFile(filePath);

    if (email) {
      const marker = `Licenciado para: ${email}`;
      const markerBytes = Buffer.from(marker, 'utf-8');
      const pdfStr = file.toString('binary');
      const modifiedPdf = pdfStr.replace(
        /viviannedossantos\.com<\/div>/,
        `viviannedossantos.com · ${marker}</div>`
      );
      if (modifiedPdf !== pdfStr) {
        return new NextResponse(Buffer.from(modifiedPdf, 'binary'), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${slug}.pdf"`,
          },
        });
      }
    }

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
