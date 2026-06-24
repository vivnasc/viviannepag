import { notFound } from 'next/navigation';
import EstudioVS from '@/components/admin/EstudioVS';
import type { MetodoVSContaId } from '@/lib/metodo-vs/marca';

// MÉTODO VS · as 3 FILHAS (ver · vir · viver). O MESMO estúdio completo da mãe
// (componente partilhado EstudioVS), ancorado à voz própria de cada conta (a fraseMae,
// as sensações e a chegada — ver lib/metodo-vs/formatos.ts e gerar.ts). A mãe fica em
// /admin/metodo-vs; as filhas em /admin/metodo-vs/ver | /vir | /viver.
const FILHAS: MetodoVSContaId[] = ['ver', 'vir', 'viver'];

export default async function MetodoVSFilhaPage({ params }: { params: Promise<{ conta: string }> }) {
  const { conta } = await params;
  if (!FILHAS.includes(conta as MetodoVSContaId)) notFound();
  return <EstudioVS conta={conta as MetodoVSContaId} />;
}
