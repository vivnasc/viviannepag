import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { FAMILIAS, familiaDe } from '@/lib/crescer/imagens-mae';
import { listarBanco, bancoDir } from '@/lib/crescer/banco-server';

export const runtime = 'nodejs';
export const maxDuration = 60;
const BUCKET = 'viviannepag-assets';

// GET — devolve as famílias (cestos) + as imagens em cada uma.
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const banco = await listarBanco().catch(() => ({} as Record<string, string[]>));
  return NextResponse.json({ familias: FAMILIAS, banco });
}

// POST multipart { file, familia } — a Vivianne ARRASTA a imagem para o cesto; o sistema
// NOMEIA (timestamp) e guarda em crescer/banco/<familia>/. Sem escolher nome nem tema.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const form = await req.formData();
  const file = form.get('file') as File | null;
  const familia = String(form.get('familia') ?? '');
  if (!file || !familiaDe(familia)) return NextResponse.json({ erro: 'campos' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const ext = file.type.includes('png') ? 'png' : file.type.includes('webp') ? 'webp' : 'jpg';
  const nome = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  const path = `${bancoDir(familia)}/${nome}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(BUCKET).upload(path, buf, { contentType: file.type || 'image/jpeg', upsert: true });
  if (error) return NextResponse.json({ erro: 'upload', detalhe: error.message }, { status: 500 });
  const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  return NextResponse.json({ ok: true, url, familia });
}

// DELETE { url } — apaga uma imagem do cesto.
export async function DELETE(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { url } = (await req.json().catch(() => ({}))) as { url?: string };
  if (!url) return NextResponse.json({ erro: 'url' }, { status: 400 });
  const marca = `/${BUCKET}/`;
  const i = url.indexOf(marca);
  if (i < 0) return NextResponse.json({ erro: 'url-invalida' }, { status: 400 });
  const path = decodeURIComponent(url.slice(i + marca.length).split('?')[0]);
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) return NextResponse.json({ erro: 'remove', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
