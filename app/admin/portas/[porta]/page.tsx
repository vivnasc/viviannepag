import { notFound } from 'next/navigation';
import EstudioPorta from '@/components/admin/EstudioPorta';
import { getPorta, type PortaId } from '@/lib/portas/marca';

// AS 3 PORTAS (livros) · estudio de geracao proprio (molde da Soulab, motor
// separado, NAO toca na Soulab). Uma pagina por porta: /admin/portas/medo |
// /sinais | /transicao. Ver lib/portas/marca.ts.
export default async function PortaPage({ params }: { params: Promise<{ porta: string }> }) {
  const { porta } = await params;
  if (!getPorta(porta)) notFound();
  return <EstudioPorta porta={porta as PortaId} />;
}
