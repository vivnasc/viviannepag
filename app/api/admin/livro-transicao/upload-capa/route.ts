import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const maxDuration = 60;

const BUCKET = 'viviannepag-assets';

// POST (multipart/form-data) { file } — a Vivianne carrega a sua própria capa
// (a imagem dos dois mundos que gerou onde quiser). Guarda em
// livro-transicao/capa-propria.png e essa vence sempre o render.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ erro: 'sem-ficheiro' }, { status: 400 });
  }
  if (file.size > 12 * 1024 * 1024) {
    return NextResponse.json({ erro: 'demasiado-grande' }, { status: 413 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ erro: 'tipo-invalido' }, { status: 415 });
  }

  const supabase = getSupabaseAdmin();
  const buffer = Buffer.from(await file.arrayBuffer());
  const path = 'livro-transicao/capa-propria.png';
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: `${pub.publicUrl}?v=${Date.now()}` });
}
