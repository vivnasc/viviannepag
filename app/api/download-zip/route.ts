import { NextResponse, type NextRequest } from 'next/server';
import JSZip from 'jszip';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { packBySlug, packIncluiProduto } from '@/lib/packs';
import { getProdutoPdfBuffer } from '@/lib/produto-pdf';

export const runtime = 'nodejs';
// Pack pode ter muitos PDFs; damos folga para os buscar e zipar sem estourar.
export const maxDuration = 60;

// Nome de ficheiro seguro a partir do titulo do produto.
function nomeFicheiro(titulo: string, slug: string, n: number): string {
  const base = (titulo || slug)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, "")   // tira acentos
    .replace(/[^a-zA-Z0-9 ]/g, '').trim()
    .replace(/\s+/g, '-').toLowerCase()
    .slice(0, 60) || slug;
  return `${String(n).padStart(2, '0')}-${base}.pdf`;
}

// GET /api/download-zip?slug=pack-xxx&email=...&lang=...        (pack nomeado)
//  ou /api/download-zip?slugs=a,b,c&email=...&lang=...          (pack montado)
// Junta todos os PDFs num unico .zip (same-origin, descarga imediata sem abrir
// separadores). Cada PDF leva a licenca carimbada com o email.
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') || '';
  const slugsParam = req.nextUrl.searchParams.get('slugs') || '';
  const email = req.nextUrl.searchParams.get('email') || '';
  const lang = (req.nextUrl.searchParams.get('lang') || '').toLowerCase();

  const supabase = getSupabaseAdmin();
  const { data: produtos, error } = await supabase
    .from('produtos')
    .select('slug, titulo')
    .eq('publicado', true);
  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  // Pack montado pela pessoa: lista explicita de slugs. Senao, pack nomeado.
  let incluidos: { slug: string; titulo: string }[];
  let nomeBase: string;
  if (slugsParam) {
    const pedidos = slugsParam.split(',').map((s) => s.replace(/[^a-z0-9-]/g, '')).filter(Boolean);
    incluidos = (produtos ?? []).filter((p) => pedidos.includes(p.slug));
    nomeBase = 'o-teu-pack';
  } else {
    const pack = packBySlug(slug);
    if (!pack) {
      return NextResponse.json({ erro: 'pack-desconhecido' }, { status: 404 });
    }
    incluidos = (produtos ?? []).filter((p) => packIncluiProduto(pack, p.slug));
    nomeBase = pack.slug;
  }
  if (incluidos.length === 0) {
    return NextResponse.json({ erro: 'pack-vazio' }, { status: 404 });
  }

  // Busca os PDFs em paralelo (em vez de em sequencia) — corta drasticamente
  // o tempo num pack com muitos titulos e evita o timeout da funcao.
  const zip = new JSZip();
  const resultados = await Promise.all(
    incluidos.map((p) => getProdutoPdfBuffer(p.slug, lang, email)),
  );
  let adicionados = 0;
  incluidos.forEach((p, i) => {
    const res = resultados[i];
    if (res) {
      zip.file(nomeFicheiro(p.titulo, p.slug, i + 1), res.buffer);
      adicionados += 1;
    }
  });

  if (adicionados === 0) {
    return NextResponse.json({ erro: 'sem-ficheiros' }, { status: 404 });
  }

  // STORE (sem compressao): PDFs ja vem comprimidos, por isso comprimir de novo
  // so gastaria CPU/tempo sem ganho real de tamanho.
  const conteudo = await zip.generateAsync({ type: 'nodebuffer', compression: 'STORE' });
  const nomeZip = `${nomeBase}.zip`;

  return new NextResponse(new Uint8Array(conteudo), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${nomeZip}"`,
      'Cache-Control': 'no-store',
    },
  });
}
