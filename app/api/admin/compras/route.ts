import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('compras')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ compras: data });
}
