import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'escritos';
const MAX_SIZE = 8 * 1024 * 1024; // 8 MB

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ erro: 'auth' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file');
  const slugRaw = form.get('slug');
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ erro: 'sem-ficheiro' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ erro: 'demasiado-grande' }, { status: 413 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ erro: 'tipo-invalido' }, { status: 415 });
  }

  const slug = typeof slugRaw === 'string' && slugRaw.trim()
    ? slugRaw.trim().replace(/[^a-z0-9-]/gi, '-').toLowerCase()
    : 'sem-slug';
  const ext = (file.type.split('/')[1] || 'jpg').replace(/[^a-z0-9]/g, '');
  const filename = `${slug}-${Date.now()}.${ext}`;
  const storagePath = `${slug}/${filename}`;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });
  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }
  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return NextResponse.json({ url: pub.publicUrl, path: storagePath });
}
