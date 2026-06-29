import Link from 'next/link';
import { CapaSinaisUpload } from '@/components/admin/CapaSinaisUpload';
import { RenderLivroSinais } from '@/components/admin/RenderLivroSinais';

export const dynamic = 'force-dynamic';

export default function CapaSinaisAdmin() {
  return (
    <main className="max-w-[960px] mx-auto px-7 py-12">
      <header className="mb-10">
        <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin</p>
        <h1 className="font-serif font-light text-creme text-3xl">capa · Os 7 Sinais de Desencaixe</h1>
        <p className="text-creme-2/60 text-[0.85rem] mt-4 font-serif italic">
          A capa é a TUA imagem (a que fizeste fora do site). Carrega-a aqui e ela fica a capa na home, na loja e no PDF.
        </p>
      </header>

      <CapaSinaisUpload />

      <RenderLivroSinais />
    </main>
  );
}
