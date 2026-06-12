import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// GET /api/admin/tiktok/supabase-verify?file=tiktokXXX.txt&code=tiktok-developers-site-verification=YYY
// Põe o ficheiro de verificação de domínio do TikTok DENTRO do bucket público do
// Supabase, para podermos verificar o prefixo do Supabase no portal do TikTok e
// servir os vídeos diretamente de lá (sem passar pelo nosso site).
//
// Fica acessível em:
//   https://<supabase>/storage/v1/object/public/viviannepag-assets/<file>

const BUCKET = 'viviannepag-assets';

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const file = req.nextUrl.searchParams.get('file') || '';
  const code = req.nextUrl.searchParams.get('code') || '';
  if (!/^tiktok[\w.-]+\.txt$/.test(file)) {
    return NextResponse.json({ erro: 'file', detalhe: 'nome tem de ser tipo tiktokXXXX.txt' }, { status: 400 });
  }
  if (!code.startsWith('tiktok-developers-site-verification=')) {
    return NextResponse.json({ erro: 'code', detalhe: 'code tem de começar por tiktok-developers-site-verification=' }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  const { error } = await sb.storage.from(BUCKET).upload(file, code + '\n', { contentType: 'text/plain', upsert: true });
  if (error) return NextResponse.json({ erro: 'upload', detalhe: error.message }, { status: 500 });

  const url = sb.storage.from(BUCKET).getPublicUrl(file).data.publicUrl;
  return NextResponse.json({ ok: true, url, prefixoParaVerificar: url.replace(file, '') });
}
