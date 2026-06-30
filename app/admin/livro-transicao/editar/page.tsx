import Link from 'next/link';
import { LivroEditor } from '@/components/admin/LivroEditor';

export const dynamic = 'force-dynamic';

export default function EditarLivroPage() {
  return (
    <main className="max-w-[1080px] mx-auto px-7 py-12">
      <header className="mb-9">
        <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin · livro · editar</p>
        <h1 className="font-serif font-light text-creme text-3xl">A Grande Transição</h1>
        <p className="text-creme/55 text-sm mt-2 max-w-[640px]">
          Lê capítulo a capítulo, edita o texto à mão, e em cada parágrafo deixa um comentário para a
          Claude te propor a reescrita. As edições guardam-se à parte (não tocam no original nem no
          PDF até exportares).
        </p>
        <Link href="/admin/livro-transicao" className="inline-block mt-3 text-[0.78rem] text-ocre/80 hover:text-ocre">
          ← capa, imagens e render
        </Link>
      </header>
      <LivroEditor />
    </main>
  );
}
