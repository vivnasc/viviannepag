import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

const BUCKET = 'romances';

// GET ?lang=pt|en · o download do romance-oferta SAI SEMPRE pelo domínio da
// casa (viviannedossantos.com/api/romance-download?lang=pt). Por trás, um URL
// assinado de 60 segundos no bucket privado: quem partilhar o link, partilha
// a casa da Vivianne, não o Supabase.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'pt';
  const path = `romances/rom-01-amparo/livro-${lang}.pdf`;
  const nome = lang === 'en'
    ? "Amparo's Hands - Vivianne dos Santos.pdf"
    : 'As Maos de Amparo - Vivianne dos Santos.pdf';

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60, { download: nome });

  if (error || !data?.signedUrl) {
    return NextResponse.json({ erro: error?.message ?? 'sem-ficheiro' }, { status: 404 });
  }
  return NextResponse.redirect(data.signedUrl, 302);
}
