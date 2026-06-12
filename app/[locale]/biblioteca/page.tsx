import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { TopNav } from '@/components/TopNav';
import { ESTANTES } from '@/lib/biblioteca';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const CAPA_AMPARO = `${(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '')}/storage/v1/object/public/viviannepag-assets/romances/rom-01-amparo/capa-composta-pt.png`;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'The Véspera Library — novels by Vivianne dos Santos' : 'Biblioteca de Véspera — os romances de Vivianne dos Santos',
    description: isEn
      ? 'A village with one question: who carries whom? Seven shelves, seven questions, one novel at a time.'
      : 'Uma vila com uma pergunta só: quem carrega quem? Sete estantes, sete perguntas, um romance de cada vez.',
    openGraph: { images: [CAPA_AMPARO] },
  };
}

export default async function BibliotecaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEn = locale === 'en';
  const prefix = isEn ? '/en' : '';

  return (
    <main className="min-h-screen">
      <TopNav />

      {/* CABEÇA DA BIBLIOTECA */}
      <header className="max-w-[860px] mx-auto px-6 pt-20 pb-12 text-center">
        <p className="text-[0.72rem] tracking-[0.32em] uppercase text-salvia mb-4">
          {isEn ? 'fiction · the novels of the house' : 'ficção · os romances da casa'}
        </p>
        <h1 className="font-serif font-light text-creme text-[clamp(2rem,5vw,3rem)] leading-[1.12] mb-5">
          {isEn ? 'The Véspera Library' : 'Biblioteca de Véspera'}
        </h1>
        <p className="font-serif italic text-creme-2/80 text-lg leading-relaxed max-w-[560px] mx-auto">
          {isEn
            ? 'A village of one question: who carries whom? Seven shelves, seven questions. Every book is a woman, a role that once protected her, and the year she learns to set it down.'
            : 'Uma vila com uma pergunta só: quem carrega quem? Sete estantes, sete perguntas. Cada livro é uma mulher, um papel que um dia a protegeu, e o ano em que aprende a pousá-lo.'}
        </p>
        {/* navegação das estantes */}
        <nav className="flex flex-wrap justify-center gap-2 mt-9">
          {ESTANTES.map(e => (
            <a
              key={e.id}
              href={`#${e.id}`}
              className="no-underline text-[0.72rem] tracking-[0.14em] uppercase text-creme-2/60 border border-ocre/25 rounded-full px-4 py-1.5 hover:text-ambar hover:border-ambar/50 transition-colors"
            >
              {e.romano} · {isEn ? e.nomeEn : e.nome}
            </a>
          ))}
        </nav>
      </header>

      {/* ESTANTES */}
      <div className="max-w-[860px] mx-auto px-6 pb-16 space-y-16">
        {ESTANTES.map(estante => (
          <section key={estante.id} id={estante.id} className="scroll-mt-24">
            <div className="mb-6">
              <p className="text-[0.68rem] tracking-[0.3em] uppercase text-salvia mb-2">
                {isEn ? 'shelf' : 'estante'} {estante.romano} · {isEn ? estante.nomeEn : estante.nome}
              </p>
              <h2 className="font-serif italic font-light text-creme text-[1.45rem] leading-snug">
                {isEn ? estante.perguntaEn : estante.pergunta}
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {estante.livros.map(livro =>
                livro.estado === 'disponivel' ? (
                  <Link
                    key={livro.slug}
                    href={`${prefix}${livro.href}`}
                    className="no-underline border border-salvia/40 rounded-[14px] p-5 hover:border-salvia transition-colors flex gap-5 items-center sm:col-span-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={CAPA_AMPARO}
                      alt={isEn ? livro.tituloEn : livro.titulo}
                      className="w-[92px] rounded-[6px] border border-ocre/20 shrink-0"
                    />
                    <div>
                      <p className="text-[0.66rem] tracking-[0.26em] uppercase text-salvia mb-1.5">
                        {isEn ? 'available · free' : 'disponível · oferta'}
                      </p>
                      <p className="font-serif text-creme text-[1.25rem] mb-1">
                        {isEn ? livro.tituloEn : livro.titulo}
                      </p>
                      <p className="text-creme-2/70 text-[0.85rem] font-serif italic">
                        {isEn ? livro.notaEn : livro.nota}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div
                    key={livro.slug}
                    className="border border-ocre/15 rounded-[14px] p-5"
                  >
                    <p className="text-[0.64rem] tracking-[0.26em] uppercase text-creme-2/40 mb-1.5">
                      {isEn ? 'on its way' : 'a caminho'}
                    </p>
                    <p className="font-serif text-creme-2/80 text-[1.05rem]">
                      {isEn ? livro.tituloEn : livro.titulo}
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>
        ))}
      </div>

      {/* PONTE PARA A LOJA */}
      <footer className="max-w-[640px] mx-auto px-6 pb-20 text-center">
        <p className="font-serif italic text-creme-2/60 text-[0.95rem] leading-relaxed">
          {isEn ? (
            <>Every novel in this library has a self-knowledge sibling. The door next door is{' '}
              <Link href="/en/loja" className="text-ambar no-underline hover:underline">the shop</Link>.</>
          ) : (
            <>Cada romance desta biblioteca tem um irmão de autoconhecimento. A porta ao lado é{' '}
              <Link href="/loja" className="text-ambar no-underline hover:underline">a loja</Link>.</>
          )}
        </p>
      </footer>
    </main>
  );
}
