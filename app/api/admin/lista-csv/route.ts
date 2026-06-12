import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// GET — exporta a lista de emails em CSV (admin).
export async function GET() {
  if (!(await isAdmin())) return new Response('auth', { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('subscribers')
    .select('email, source, created_at')
    .order('created_at', { ascending: false })
    .limit(10000);

  const linhas = ['email,origem,quando'];
  for (const s of data ?? []) {
    linhas.push(`${s.email},${s.source ?? 'site'},${s.created_at ?? ''}`);
  }

  return new Response(linhas.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="lista-viviannedossantos.csv"',
    },
  });
}
