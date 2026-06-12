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
    title: isEn ? 'The Véspera Library · novels by Vivianne dos Santos' : 'Biblioteca de Véspera · os romances de Vivianne dos Santos',
    description: isEn
      ? "Short novels about women who carry too much and learn to set it down. The first one, Amparo's Hands, is a gift: read chapter 1 freely."
      : 'Romances curtos sobre mulheres que carregam de mais e aprendem a pousar. O primeiro, As Mãos de Amparo, é oferta: lê o capítulo 1 sem pedir nada.',
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
      <header className="max-w-[860px] mx-auto px-6 pt-20 pb-10 text-center">
        <p className="text-[0.72rem] tracking-[0.32em] uppercase text-salvia mb-4">
          {isEn ? 'the novels of Vivianne dos Santos' : 'os romances de Vivianne dos Santos'}
        </p>
        <h1 className="font-serif font-light text-creme text-[clamp(2rem,5vw,3rem)] leading-[1.12] mb-5">
          {isEn ? 'The Véspera Library' : 'Biblioteca de Véspera'}
        </h1>
        <p className="max-w-[600px] mx-auto font-serif italic text-creme-2/85 text-lg leading-relaxed">
          {isEn
            ? 'Short novels about women who carry too much and learn to set it down. Stories where you end up reading yourself.'
            : 'Romances curtos sobre mulheres que carregam de mais e aprendem a pousar. Histórias em que acabas a ler-te a ti.'}
        </p>
      </header>

      {/* O LIVRO DISPONÍVEL, EM GRANDE */}
      <section className="max-w-[860px] mx-auto px-6 pb-16">
        <div className="border border-salvia/40 rounded-[18px] p-7 md:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-10">
          <div className="shrink-0 w-[190px] md:w-[230px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={CAPA_AMPARO}
              alt={isEn ? "Amparo's Hands cover" : 'Capa de As Mãos de Amparo'}
              className="rounded-[10px] shadow-2xl border border-ocre/20"
            />
          </div>
          <div className="text-center md:text-left">
            <p className="text-[0.7rem] tracking-[0.3em] uppercase text-salvia mb-3">
              {isEn ? 'free · the first novel' : 'grátis · o primeiro romance'}
            </p>
            <h2 className="font-serif font-light text-creme text-3xl md:text-4xl leading-[1.12] mb-4">
              {isEn ? <>Amparo&rsquo;s Hands</> : <>As Mãos de Amparo</>}
            </h2>
            <p className="font-serif italic text-creme-2/80 text-[1.05rem] leading-relaxed mb-6">
              {isEn
                ? 'For thirty-six years, Amparo has caught her son before every fall. This is the year she learns that hands can also rest.'
                : 'Há trinta e seis anos que Amparo apanha o filho antes de cada queda. Este é o ano em que aprende que as mãos também se pousam.'}
            </p>
            <Link
              href={`${prefix}/amparo`}
              className="inline-block no-underline bg-ambar text-[#2A1F17] font-medium text-[0.95rem] tracking-wide rounded-full px-8 py-3 hover:opacity-90 transition-opacity"
            >
              {isEn ? 'Read chapter 1 free' : 'Ler o capítulo 1 grátis'}
            </Link>
            <p className="text-creme-2/50 text-[0.8rem] mt-4">
              {isEn
                ? 'The whole book in PDF, in English and Portuguese. No payment, ever.'
                : 'O livro inteiro em PDF, em português e inglês. Sem pagar nada.'}
            </p>
          </div>
        </div>
      </section>

      {/* OS PRÓXIMOS, POR PERGUNTA */}
      <div className="max-w-[860px] mx-auto px-6 pb-16">
        <p className="text-center text-[0.72rem] tracking-[0.32em] uppercase text-salvia mb-12">
          {isEn ? 'on their way · one question at a time' : 'a caminho · uma pergunta de cada vez'}
        </p>
        <div className="space-y-14">
          {ESTANTES.map(estante => (
            <section key={estante.id} id={estante.id} className="scroll-mt-24">
              <div className="mb-6">
                <h2 className="font-serif italic font-light text-creme text-[1.45rem] leading-snug mb-2">
                  {isEn ? estante.perguntaEn : estante.pergunta}
                </h2>
                <p className="text-creme-2/60 text-[0.9rem]">
                  {isEn ? estante.temaEn : estante.tema}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {estante.livros.map(livro =>
                  livro.estado === 'disponivel' ? (
                    <Link
                      key={livro.slug}
                      href={`${prefix}${livro.href}`}
                      className="no-underline border border-salvia/40 rounded-[14px] p-5 hover:border-salvia transition-colors"
                    >
                      <p className="text-[0.66rem] tracking-[0.26em] uppercase text-salvia mb-1.5">
                        {isEn ? 'available · free' : 'disponível · grátis'}
                      </p>
                      <p className="font-serif text-creme text-[1.1rem] mb-1.5">
                        {isEn ? livro.tituloEn : livro.titulo}
                      </p>
                      <p className="text-creme-2/65 text-[0.85rem] leading-relaxed font-serif italic">
                        {isEn ? livro.promessaEn : livro.promessa}
                      </p>
                    </Link>
                  ) : (
                    <div key={livro.slug} className="border border-ocre/15 rounded-[14px] p-5">
                      <p className="text-[0.64rem] tracking-[0.26em] uppercase text-creme-2/40 mb-1.5">
                        {isEn ? 'on its way' : 'a caminho'}
                      </p>
                      <p className="font-serif text-creme-2/85 text-[1.1rem] mb-1.5">
                        {isEn ? livro.tituloEn : livro.titulo}
                      </p>
                      <p className="text-creme-2/55 text-[0.85rem] leading-relaxed font-serif italic">
                        {isEn ? livro.promessaEn : livro.promessa}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
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
