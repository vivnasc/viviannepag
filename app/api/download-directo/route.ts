import { NextResponse, type NextRequest } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// Estrategia de fetch do PDF, por ordem de prioridade:
// 1. Supabase bucket 'escritos' em produtos.ficheiro_path ou produtos/{slug}.pdf
//    (e onde o render-ebook.js editorial publica)
// 2. Disco local private-produtos/{slug}.pdf (fallback legacy)
async function fetchPdf(slug: string): Promise<Buffer | null> {
  // 1. Supabase
  try {
    const supabase = getSupabaseAdmin();
    let ficheiroPath = `produtos/${slug}.pdf`;
    const { data: produto } = await supabase
      .from('produtos').select('ficheiro_path').eq('slug', slug).maybeSingle();
    if (produto?.ficheiro_path) ficheiroPath = produto.ficheiro_path;

    const { data, error } = await supabase.storage.from('escritos').download(ficheiroPath);
    if (!error && data) {
      return Buffer.from(await data.arrayBuffer());
    }
  } catch {}

  // 2. Disco
  try {
    return await readFile(join(process.cwd(), 'private-produtos', `${slug}.pdf`));
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')?.replace(/[^a-z0-9-]/g, '');
  const email = req.nextUrl.searchParams.get('email') || '';
  if (!slug) {
    return NextResponse.json({ erro: 'slug-obrigatorio' }, { status: 400 });
  }

  const file = await fetchPdf(slug);
  if (!file) {
    return NextResponse.json({ erro: 'ficheiro-nao-encontrado' }, { status: 404 });
  }

  if (email) {
    const marker = `Licenciado para: ${email}`;
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

  return new NextResponse(new Uint8Array(file), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${slug}.pdf"`,
    },
  });
}
