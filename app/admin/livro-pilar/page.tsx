import Link from 'next/link';
import { LivroPilarCapas } from '@/components/admin/LivroPilarCapas';
import { ManuaisRender } from '@/components/admin/ManuaisRender';

export const dynamic = 'force-dynamic';

export default function LivroPilarAdmin() {
  return (
    <main className="max-w-[960px] mx-auto px-7 py-12">
      <header className="mb-10">
        <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin</p>
        <h1 className="font-serif font-light text-creme text-3xl">livro-pilar · Os Sete Véus</h1>
        <nav className="flex gap-5 mt-4 text-[0.85rem]">
          <Link href="/admin/editora" className="text-creme-2/50 hover:text-creme transition-colors no-underline pb-1">
            ebooks
          </Link>
          <Link href="/admin/editora/romances" className="text-creme-2/50 hover:text-creme transition-colors no-underline pb-1">
            romances
          </Link>
          <span className="text-ambar border-b border-ambar/60 pb-1">pilar</span>
        </nav>
        <p className="text-creme-2/60 text-[0.85rem] mt-4 font-serif italic">
          O manual-mãe do Método VS. Gera variantes de capa (Replicate, estética do véu, sem texto), escolhe a tua, e carrega em «renderizar PDF» para a composição final (capa com tipografia + miolo A5) chegar ao botão de descarregar.
        </p>
      </header>

      <LivroPilarCapas />
      <ManuaisRender />
    </main>
  );
}
