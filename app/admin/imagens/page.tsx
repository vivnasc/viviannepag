import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { GaleriaImagens } from '@/components/admin/GaleriaImagens';

export default async function ImagensPage() {
  if (!(await isAdmin())) redirect('/admin');
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('escritos')
    .select('id, slug, locale, titulo, tematica, data, capa')
    .order('data', { ascending: false });

  return <GaleriaImagens escritos={data ?? []} />;
}
