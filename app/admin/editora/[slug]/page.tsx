import Link from 'next/link';
import { notFound } from 'next/navigation';
import { lerLivro } from '@/lib/editora';
import PublicarBotao from './PublicarBotao';

export const dynamic = 'force-dynamic';

export default async function LivroEditora({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const livro = lerLivro(slug);
  if (!livro) notFound();
  const a = livro.auditoria;

  return (
    <main className="max-w-[960px] mx-auto px-7 py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Link href="/admin/editora" className="text-ocre/80 text-[0.82rem] hover:text-ambar no-underline">← editora</Link>
        <p className="text-creme-2/40 text-[0.78rem]">
          {livro.colecao} · {livro.capitulos.length} capítulos · {livro.palavras.toLocaleString('pt-PT')} palavras
        </p>
      </div>

      {/* auditoria de compliance + publicar */}
      <div className="flex items-start justify-between gap-6 flex-wrap mb-8 border border-ocre/15 rounded-[14px] p-5 bg-terra-2/30">
        <div className="min-w-0">
          <p className="text-[0.7rem] tracking-[0.22em] uppercase text-ocre mb-3">auditoria de regras</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {a.itens.map(it => (
              <span key={it.label} className="inline-flex items-center gap-1.5 text-[0.78rem]" title={it.detalhe}>
                <span className={it.estado === 'ok' ? 'text-salvia' : it.estado === 'aviso' ? 'text-ambar' : 'text-rosa'}>
                  {it.estado === 'ok' ? '✓' : it.estado === 'aviso' ? '!' : '✕'}
                </span>
                <span className="text-creme-2/80">{it.label}</span>
                <span className="text-creme-2/35">{it.detalhe}</span>
              </span>
            ))}
          </div>
        </div>
        <PublicarBotao slug={livro.slug} bloqueado={a.erros > 0} />
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
