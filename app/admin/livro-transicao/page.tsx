import { LivroTransicao } from '@/components/admin/LivroTransicao';

export const dynamic = 'force-dynamic';

export default function LivroTransicaoAdmin() {
  return (
    <main className="max-w-[960px] mx-auto px-7 py-12">
      <header className="mb-10">
        <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin · livro</p>
        <h1 className="font-serif font-light text-creme text-3xl">A Grande Transição</h1>
        <p className="text-creme-2/60 text-[0.85rem] mt-4 font-serif italic">
          O painel do livro das Ciências da Consciência Emergente: carrega ou gera as imagens (capa dos dois mundos e as vinhetas das quatro Partes), e renderiza o PDF tipografado a partir do manuscrito em <span className="not-italic text-creme-2/80">livro/A_Grande_Transicao_completo.md</span>.
        </p>
      </header>

      <LivroTransicao />
    </main>
  );
}
