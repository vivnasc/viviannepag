import Link from 'next/link';
import { LivrosCapas } from '@/components/admin/LivrosCapas';
import { RenderLivros } from '@/components/admin/RenderLivros';

export const dynamic = 'force-dynamic';

export default function LivrosAdmin() {
  return (
    <main className="max-w-[960px] mx-auto px-7 py-12">
      <header className="mb-10">
        <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin</p>
        <h1 className="font-serif font-light text-creme text-3xl">capas e livros · Método VS</h1>
        <nav className="flex gap-5 mt-4 text-[0.85rem]">
          <Link href="/admin/editora" className="text-creme-2/50 hover:text-creme transition-colors no-underline pb-1">ebooks</Link>
          <Link href="/admin/editora/romances" className="text-creme-2/50 hover:text-creme transition-colors no-underline pb-1">romances</Link>
          <span className="text-ambar border-b border-ambar/60 pb-1">método</span>
        </nav>
        <p className="text-creme-2/60 text-[0.85rem] mt-4 font-serif italic">
          Um só sítio para as capas dos 4 livros (pilar + ver/vir/viver): gera o símbolo de cada um (mesma família), escolhe a tua, e depois rende para compor a tipografia e publicar.
        </p>
      </header>

      <LivrosCapas />
      <RenderLivros />
    </main>
  );
}
