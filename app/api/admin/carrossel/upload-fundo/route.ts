import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST multipart { file, slug, dia, idx } — arrasta/sobe uma imagem MJ como
// fundo de um slide (capa/fecho). Guarda em viviannepag-assets e grava o
// imageUrl no slide da coleccao. Devolve a coleccao actualizada.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file') as File | null;
  const slug = String(form.get('slug') ?? '');
  const dia = Number(form.get('dia'));
  const idx = Number(form.get('idx'));
  if (!file || !slug || !dia || isNaN(idx)) return NextResponse.json({ erro: 'campos' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const bucket = 'viviannepag-assets';
  const ext = (file.type.includes('png') ? 'png' : file.type.includes('webp') ? 'webp' : 'jpg');
  const path = `carrossel-veus/${slug}/dia-${dia}/slide-${idx}-${Date.now()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabase.storage.from(bucket).upload(path, buf, { contentType: file.type || 'image/jpeg', upsert: true });
  if (upErr) return NextResponse.json({ erro: 'upload', detalhe: upErr.message }, { status: 500 });
  const imageUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

  // grava o imageUrl no slide
  const { data: col, error } = await supabase.from('carousel_collections').select('dias').eq('slug', slug).single();
  if (error || !col) return NextResponse.json({ erro: 'nao-encontrada' }, { status: 404 });
  const dias = Array.isArray(col.dias) ? (col.dias as Record<string, unknown>[]) : [];
  const d = dias.find((x) => x.dia === dia);
  if (d && Array.isArray(d.slides) && (d.slides as Record<string, unknown>[])[idx]) {
    (d.slides as Record<string, unknown>[])[idx].imageUrl = imageUrl;
  }
  const { data, error: upd } = await supabase.from('carousel_collections').update({ dias }).eq('slug', slug).select().single();
  if (upd) return NextResponse.json({ erro: 'db', detalhe: upd.message }, { status: 500 });
  return NextResponse.json({ ok: true, imageUrl, coleccao: data });
}
