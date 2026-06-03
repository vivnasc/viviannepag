import { readFile } from 'fs/promises';
import { join } from 'path';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Estrategia de fetch do PDF, por ordem de prioridade:
// 1. Supabase bucket 'escritos' em produtos.ficheiro_path ou produtos/{slug}.pdf
//    (e onde o render-ebook.js editorial publica primeiro, se o bucket aceitar)
// 2. Supabase bucket 'viviannepag-assets' em produtos/{slug}.pdf (fallback
//    do render-ebook quando escritos rejeita mime de PDF)
// 3. Disco local private-produtos/{slug}.pdf (fallback legacy)
async function fetchPdf(slug: string): Promise<Buffer | null> {
  const supabase = getSupabaseAdmin();

  // 1. Escritos via ficheiro_path
  try {
    let ficheiroPath = `produtos/${slug}.pdf`;
    const { data: produto } = await supabase
      .from('produtos').select('ficheiro_path').eq('slug', slug).maybeSingle();
    if (produto?.ficheiro_path) ficheiroPath = produto.ficheiro_path;

    const { data, error } = await supabase.storage.from('escritos').download(ficheiroPath);
    if (!error && data) {
      return Buffer.from(await data.arrayBuffer());
    }
  } catch {}

  // 2. viviannepag-assets/produtos/{slug}.pdf
  try {
    const { data, error } = await supabase.storage
      .from('viviannepag-assets').download(`produtos/${slug}.pdf`);
    if (!error && data) {
      return Buffer.from(await data.arrayBuffer());
    }
  } catch {}

  // 3. Disco
  try {
    return await readFile(join(process.cwd(), 'private-produtos', `${slug}.pdf`));
  } catch {
    return null;
  }
}

// Resolve o PDF de um produto (PT/EN) ja com a licenca carimbada se houver email.
// Reutilizado pela rota single (download-directo) e pela rota de ZIP do pack.
export async function getProdutoPdfBuffer(
  slug: string,
  lang?: string,
  email?: string,
): Promise<{ buffer: Buffer; slug: string } | null> {
  const candidatos = lang === 'en' ? [`${slug}-en`, slug] : [slug];
  let file: Buffer | null = null;
  let usado = slug;
  for (const s of candidatos) {
    file = await fetchPdf(s);
    if (file) { usado = s; break; }
  }
  if (!file) return null;
  if (email) {
    const marker = `Licenciado para: ${email}`;
    const pdfStr = file.toString('binary');
    const modificado = pdfStr.replace(
      /viviannedossantos\.com<\/div>/,
      `viviannedossantos.com · ${marker}</div>`,
    );
    if (modificado !== pdfStr) file = Buffer.from(modificado, 'binary');
  }
  return { buffer: file, slug: usado };
}
