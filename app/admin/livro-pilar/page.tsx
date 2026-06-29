import Link from 'next/link';
import { LivrosCapas } from '@/components/admin/LivrosCapas';
import { RenderLivros } from '@/components/admin/RenderLivros';
import { CapaSinaisUpload } from '@/components/admin/CapaSinaisUpload';

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
          <Link href="/admin/capa-sinais" className="text-creme-2/50 hover:text-creme transition-colors no-underline pb-1">capa · os 7 sinais</Link>
        </nav>
        <p className="text-creme-2/60 text-[0.85rem] mt-4 font-serif italic">
          Um só sítio para as capas dos 4 livros (pilar + ver/vir/viver): gera o símbolo de cada um (mesma família), escolhe a tua, e depois rende para compor a tipografia e publicar.
        </p>
      </header>

      <LivrosCapas />

      <section className="border border-ocre/15 rounded-[14px] p-6 mt-8">
        <h3 className="font-serif text-creme text-[1.05rem] mb-1">Carregar capa própria · Os Sete Véus</h3>
        <p className="text-creme-2/60 text-[0.82rem] font-serif italic mb-5">
          Se fizeste a capa fora do site, carrega-a aqui (PT e EN). Fica a capa na home e na loja, sem gerar nada.
        </p>
        <CapaSinaisUpload slug="os-7-veus" />
      </section>

      <RenderLivros />
    </main>
  );
}
