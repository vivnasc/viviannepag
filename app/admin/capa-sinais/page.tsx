import Link from 'next/link';
import { CapaSinaisGerador } from '@/components/admin/CapaSinaisGerador';
import { RenderLivroSinais } from '@/components/admin/RenderLivroSinais';

export const dynamic = 'force-dynamic';

export default function CapaSinaisAdmin() {
  return (
    <main className="max-w-[960px] mx-auto px-7 py-12">
      <header className="mb-10">
        <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin</p>
        <h1 className="font-serif font-light text-creme text-3xl">capa · Os 7 Sinais de Desencaixe</h1>
        <nav className="flex gap-5 mt-4 text-[0.85rem]">
          <Link href="/admin/livro-pilar" className="text-creme-2/50 hover:text-creme transition-colors no-underline pb-1">capas do método</Link>
          <span className="text-ambar border-b border-ambar/60 pb-1">os 7 sinais</span>
        </nav>
        <p className="text-creme-2/60 text-[0.85rem] mt-4 font-serif italic">
          Gerador próprio desta capa: tipográfica e clara, sem IA e sem fundo escuro. Escolhe a variante, o idioma e qual dos 7 sinais fica fora da linha. Descarrega o PNG ou usa no site.
        </p>
      </header>

      <CapaSinaisGerador />
      <RenderLivroSinais />
    </main>
  );
}
