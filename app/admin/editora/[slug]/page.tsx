import Link from 'next/link';
import { notFound } from 'next/navigation';
import { lerLivro } from '@/lib/editora';

export const dynamic = 'force-dynamic';

export default async function LivroEditora({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const livro = lerLivro(slug);
  if (!livro) notFound();

  return (
    <main className="max-w-[960px] mx-auto px-7 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <Link href="/admin/editora" className="text-ocre/80 text-[0.82rem] hover:text-ambar no-underline">← editora</Link>
        <p className="text-creme-2/40 text-[0.78rem]">
          {livro.colecao} · {livro.capitulos.length} capítulos · {livro.palavras.toLocaleString('pt-PT')} palavras
        </p>
      </div>

      {/* painel de leitura em creme, fiel ao livro */}
      <article className="bg-creme text-terra rounded-[18px] px-8 py-12 md:px-16 md:py-16 shadow-2xl">
        <div className="max-w-[680px] mx-auto">
          <header className="text-center border-b border-terra/10 pb-10 mb-12">
            <h1 className="font-serif font-light text-terra text-[2.2rem] leading-[1.15]">{livro.titulo}</h1>
            {livro.subtitulo && <p className="font-serif italic text-terra/70 text-[1.1rem] mt-4">{livro.subtitulo}</p>}
            {livro.autoria && <p className="text-terra/60 text-[0.85rem] mt-6 tracking-wide">Por {livro.autoria}</p>}
            {livro.bio && <p className="text-terra/50 text-[0.8rem] mt-2 italic font-serif">{livro.bio}</p>}
          </header>

          {livro.disclaimer && (
            <div className="bg-terra/[0.04] border border-terra/10 rounded-[12px] px-6 py-5 mb-12">
              <p className="text-[0.68rem] tracking-[0.2em] uppercase text-terra/50 mb-2">antes de começar</p>
              <p className="text-terra/70 text-[0.88rem] italic font-serif leading-relaxed">{livro.disclaimer}</p>
            </div>
          )}

          <div className="space-y-16">
            {livro.capitulos.map((c, i) => (
              <section key={i}>
                <header className="mb-6">
                  <p className="text-ocre text-[0.72rem] tracking-[0.18em] uppercase">capítulo {i + 1}</p>
                  <h2 className="font-serif font-light text-terra text-[1.55rem] mt-1">{c.titulo.replace(/^\d+\.\s*/, '')}</h2>
                  <p className="text-terra/30 text-[0.72rem] mt-1">{c.palavras.toLocaleString('pt-PT')} palavras</p>
                </header>
                <div
                  className="prose-livro text-terra/85 text-[1.02rem] leading-[1.75] font-serif"
                  dangerouslySetInnerHTML={{ __html: c.html }}
                />
              </section>
            ))}
          </div>
        </div>
      </article>

      <div className="mt-8 text-center">
        <Link href="/admin/editora" className="text-ocre/80 text-[0.82rem] hover:text-ambar no-underline">← voltar à editora</Link>
      </div>
    </main>
  );
}
