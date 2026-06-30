import Link from 'next/link';
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

      <Link
        href="/admin/livro-transicao/editar"
        className="group relative block mb-12 overflow-hidden rounded-2xl border border-ocre/25 bg-gradient-to-br from-ocre/[0.09] via-transparent to-transparent px-7 py-6 transition hover:border-ocre/60 hover:from-ocre/[0.14]"
      >
        <div className="flex items-center gap-6">
          <span className="shrink-0 grid place-items-center w-[88px] h-[88px] rounded-full border border-ocre/30 bg-[#1a160f]/40 transition group-hover:border-ocre/55">
            <svg width="60" height="35" viewBox="0 0 240 140" fill="none" className="text-ocre">
              <path d="M20 70 Q60 20 120 20 Q180 20 220 70 Q180 120 120 120 Q60 120 20 70 Z" stroke="currentColor" strokeWidth="3" />
              <circle cx="120" cy="70" r="28" stroke="currentColor" strokeWidth="3" />
              <circle cx="120" cy="70" r="42" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
              <circle cx="120" cy="70" r="9" fill="currentColor" />
              <line x1="120" y1="12" x2="120" y2="0" stroke="currentColor" strokeWidth="2" />
              <line x1="120" y1="140" x2="120" y2="128" stroke="currentColor" strokeWidth="2" />
              <line x1="0" y1="70" x2="12" y2="70" stroke="currentColor" strokeWidth="2" />
              <line x1="228" y1="70" x2="240" y2="70" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-[0.64rem] tracking-[0.3em] uppercase text-ocre/80 mb-1.5">estúdio de edição</p>
            <h2 className="font-serif font-light text-creme text-2xl leading-tight">Ler e editar o texto</h2>
            <p className="text-creme-2/65 text-[0.86rem] mt-1.5 max-w-[520px]">
              Lê capítulo a capítulo, afina cada parágrafo à mão e, onde quiseres, deixa um comentário
              para a Claude te propor a reescrita, na tua voz.
            </p>
            <span className="inline-flex items-center gap-1.5 mt-3 text-[0.8rem] text-ocre transition group-hover:gap-2.5">
              abrir o estúdio
              <span aria-hidden>→</span>
            </span>
          </div>
        </div>
      </Link>

      <LivroTransicao />
    </main>
  );
}
