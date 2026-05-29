import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const maxDuration = 30;

// GET ?jobId=... — devolve estado do render job (le result.json do Supabase)

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ erro: 'auth' }, { status: 401 });
  }

  const url = new URL(req.url);
  const jobId = url.searchParams.get('jobId');
  if (!jobId) return NextResponse.json({ erro: 'jobId obrigatorio' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const path = `renders/${jobId}/result.json`;

  try {
    const { data, error } = await supabase.storage.from('viviannepag-assets').download(path);
    if (error || !data) {
      return NextResponse.json({ status: 'pendente', jobId });
    }
    const json = JSON.parse(await data.text());
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ status: 'pendente', jobId, erro: String(e) });
  }
}
