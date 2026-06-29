import Link from 'next/link';
import { CapaImg } from '@/components/home/CapaImg';
import { RenderLivroSinais } from '@/components/admin/RenderLivroSinais';

export const dynamic = 'force-dynamic';

const SUPA = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
const capaComposta = `${SUPA}/storage/v1/object/public/viviannepag-assets/livro-pilar/os-7-sinais/capa-composta.png`;
const capaRaw = `${SUPA}/storage/v1/object/public/viviannepag-assets/livro-pilar/os-7-sinais/capa.jpg`;

export default function CapaSinaisAdmin() {
  return (
    <main className="max-w-[960px] mx-auto px-7 py-12">
      <header className="mb-10">
        <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin</p>
        <h1 className="font-serif font-light text-creme text-3xl">capa · Os 7 Sinais de Desencaixe</h1>
        <nav className="flex gap-5 mt-4 text-[0.85rem]">
          <Link href="/admin/livro-pilar" className="text-creme-2/50 hover:text-creme transition-colors no-underline pb-1">gerar/escolher a imagem</Link>
          <span className="text-ambar border-b border-ambar/60 pb-1">os 7 sinais</span>
        </nav>
        <p className="text-creme-2/60 text-[0.85rem] mt-4 font-serif italic">
          A capa do livro é a TUA imagem (a que escolheste em &quot;gerar/escolher a imagem&quot; com &quot;usar esta&quot;). Aqui vês a capa atual e publicas o livro com ela.
        </p>
      </header>

      <section className="grid grid-cols-[260px_1fr] gap-10 items-start max-[620px]:grid-cols-1">
        <div>
          <p className="text-[0.7rem] tracking-[0.28em] uppercase text-ocre mb-3">capa atual</p>
          <CapaImg
            src={`${capaComposta}?t=1`}
            fallback={capaRaw}
            alt="Capa de Os 7 Sinais de Desencaixe"
            className="w-[260px] h-auto rounded-[10px] border border-ocre/30 block"
          />
        </div>
        <div className="text-creme-2/75 text-[0.9rem] leading-[1.7] space-y-3 max-w-[40ch]">
          <p>Para trocar a capa: vai a <Link href="/admin/livro-pilar" className="text-ambar underline">gerar/escolher a imagem</Link>, escolhe a imagem que queres e carrega <strong className="text-creme">&quot;usar esta&quot;</strong>.</p>
          <p>Depois, aqui em baixo, carrega <strong className="text-creme">&quot;renderizar livro + publicar&quot;</strong>: o livro sai com a tua imagem na capa (com o título por cima), e a mesma capa fica no site.</p>
        </div>
      </section>

      <RenderLivroSinais />
    </main>
  );
}
