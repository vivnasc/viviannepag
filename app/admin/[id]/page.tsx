import { notFound } from 'next/navigation';
import { EscritoEditor } from '@/components/admin/EscritoEditor';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { redirect } from 'next/navigation';

export default async function EditarEscritoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) {
    redirect('/admin');
  }
  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('escritos')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) notFound();

  return (
    <EscritoEditor
      modo="editar"
      inicial={{
        id: data.id,
        slug: data.slug,
        locale: data.locale,
        titulo: data.titulo,
        resumo: data.resumo ?? '',
        conteudo: data.conteudo ?? '',
        tematica: data.tematica,
        capa: data.capa,
        data: data.data,
        publicado: !!data.publicado,
      }}
    />
  );
}
