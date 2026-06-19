import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { ROMANCES } from '@/lib/romances';

export const runtime = 'nodejs';

const BUCKET = 'romances';

// GET ?slug=&lang=pt|en · o download de um romance SAI SEMPRE pelo domínio da
// casa (viviannedossantos.com/api/romance-download?lang=pt). Por trás, um URL
// assinado de 60 segundos no bucket privado: quem partilhar o link, partilha
// a casa da Vivianne, não o Supabase. Sem slug = o romance-oferta (Amparo),
// para os links antigos do funil continuarem a funcionar.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'pt';
  const slug = url.searchParams.get('slug') || 'rom-01-amparo';

  const romance = ROMANCES.find((r) => r.slug === slug);
  if (!romance) {
    return NextResponse.json({ erro: 'romance-desconhecido' }, { status: 404 });
  }

  const titulo = lang === 'en' ? romance.tituloEn : romance.titulo;
  // nome de ficheiro limpo (sem acentos nem aspas), como "As Maos de Amparo …"
  const limpo = titulo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[‘’']/g, '');
  const nome = `${limpo} - Vivianne dos Santos.pdf`;
  const path = `romances/${slug}/livro-${lang}.pdf`;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60, { download: nome });

  if (error || !data?.signedUrl) {
    return NextResponse.json({ erro: error?.message ?? 'sem-ficheiro' }, { status: 404 });
  }
  return NextResponse.redirect(data.signedUrl, 302);
}
