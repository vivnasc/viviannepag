import Link from 'next/link';
import { RomancesCapas } from '@/components/admin/RomancesCapas';

export const dynamic = 'force-dynamic';

export default function EditoraRomancesAdmin() {
  return (
    <main className="max-w-[960px] mx-auto px-7 py-12">
      <header className="mb-10">
        <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin</p>
        <h1 className="font-serif font-light text-creme text-3xl">editora</h1>
        <nav className="flex gap-5 mt-4 text-[0.85rem]">
          <Link href="/admin/editora" className="text-creme-2/50 hover:text-creme transition-colors no-underline pb-1">
            ebooks
          </Link>
          <span className="text-ambar border-b border-ambar/60 pb-1">romances</span>
        </nav>
        <p className="text-creme-2/60 text-[0.85rem] mt-4 font-serif italic">
          Biblioteca de Véspera. Gera variantes de capa (Replicate, gouache da casa, sem texto), escolhe a tua, e a composição final faz-se com a tipografia da casa por cima.
        </p>
      </header>

      <RomancesCapas />
    </main>
  );
}
