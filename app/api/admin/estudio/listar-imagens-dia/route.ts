import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const mundo = searchParams.get('mundo');
  const dia = searchParams.get('dia');
  if (!mundo || !dia) return NextResponse.json({ erro: 'campos-obrigatorios' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const bucket = 'viviannepag-assets';
  const prefix = `estudio/${mundo}/dia-${dia}`;

  const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 100 });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ images: [] });

  // Filename pattern: slide-IDX-LAYOUT-TS.jpg
  // Anchored, constrained timestamp 10-13 digits
  const rx = /^slide-(\d+)-(.+)-(\d{10,13})\.jpg$/;
  const images = data
    .filter(f => f.name)
    .map(f => {
      const m = f.name.match(rx);
      if (!m) return null;
      const path = `${prefix}/${f.name}`;
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      return { slideIdx: Number(m[1]), layout: m[2], ts: Number(m[3]), url: urlData.publicUrl };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.ts - a.ts); // newest first

  return NextResponse.json({ images });
}
