import { LivroMedo } from '@/components/admin/LivroMedo';

export const dynamic = 'force-dynamic';

export default function LivroMedoAdmin() {
  return (
    <main className="max-w-[960px] mx-auto px-7 py-12">
      <header className="mb-10">
        <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin · livro</p>
        <h1 className="font-serif font-light text-creme text-3xl">As Sete Faces do Medo</h1>
        <p className="text-creme-2/60 text-[0.85rem] mt-4 font-serif italic">
          O painel do livro, por ordem: carrega as capas (PT e EN), renderiza (mete a capa no PDF e
          publica na loja) e testa a compra. O manuscrito vive em{' '}
          <span className="not-italic text-creme-2/80">livro_medo/</span> e o interior é tipografado
          por Typst (<span className="not-italic text-creme-2/80">build/livro-medo.typ</span>).
        </p>
      </header>

      <LivroMedo />
    </main>
  );
}
