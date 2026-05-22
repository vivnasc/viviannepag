import { EscritoEditor } from '@/components/admin/EscritoEditor';

export default function NovoEscritoPage() {
  const hoje = new Date().toISOString().slice(0, 10);
  return (
    <EscritoEditor
      modo="novo"
      inicial={{
        slug: '',
        locale: 'pt',
        titulo: '',
        resumo: '',
        conteudo: '',
        tematica: null,
        capa: null,
        data: hoje,
        publicado: false,
      }}
    />
  );
}
