import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// Estado do "Plano da Semana" guardado no servidor (Storage), para aparecer em
// QUALQUER dispositivo (antes era só localStorage, ficava preso ao aparelho).
const BUCKET = 'viviannepag-assets';
const PATH = 'estado/plano-semana.json';

async function ensureBucket(supabase: ReturnType<typeof getSupabaseAdmin>) {
  const { data } = await supabase.storage.getBucket(BUCKET);
  if (!data) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error && !/already exists|duplicate/.test(error.message)) throw new Error(error.message);
  }
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  try {
    const { data, error } = await supabase.storage.from(BUCKET).download(PATH);
    if (error || !data) return NextResponse.json({ estado: null });
    const txt = await data.text();
    return NextResponse.json({ estado: JSON.parse(txt) });
  } catch {
    return NextResponse.json({ estado: null });
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ erro: 'json' }, { status: 400 }); }
  const supabase = getSupabaseAdmin();
  try {
    await ensureBucket(supabase);
    const buffer = Buffer.from(JSON.stringify(body));
    const { error } = await supabase.storage.from(BUCKET).upload(PATH, buffer, { contentType: 'application/json', upsert: true });
    if (error) return NextResponse.json({ erro: 'upload', detalhe: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ erro: 'estado', detalhe: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
