import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

const BUCKET = 'escritos';

// GET · o download do pilar SAI SEMPRE pelo domínio da casa
// (viviannedossantos.com/api/livro-pilar-download). Por trás, um URL assinado
// de 60 segundos no bucket privado.
export async function GET() {
  const path = 'livro-pilar/os-7-veus/livro-pt.pdf';
  const nome = 'Os Sete Veus - Vivianne dos Santos.pdf';

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60, { download: nome });

  if (error || !data?.signedUrl) {
    return NextResponse.json({ erro: error?.message ?? 'sem-ficheiro' }, { status: 404 });
  }
  return NextResponse.redirect(data.signedUrl, 302);
}
