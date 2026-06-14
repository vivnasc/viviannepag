import Link from 'next/link';
import { GotaAssina } from '../icons/GotaAssina';

// O herói da home: o Método VS é a porta de entrada. A mensagem lidera, o livro
// é o artefacto. (locale e capa vêm do server para evitar mismatch de hidratação.)
export function MetodoHero({ locale, capa }: { locale: string; capa: string }) {
  const isEn = locale === 'en';
  const livroHref = isEn ? '/en/os-sete-veus' : '/os-sete-veus';

  return (
    <header className="pt-24 pb-12 text-center">
      <p className="rv font-sans text-[0.72rem] tracking-[0.34em] uppercase text-salvia mb-6">
        {isEn ? 'Method VS · See and Release' : 'Método VS · Ver e Soltar'}
      </p>
      <h1 className="rv font-serif font-light text-[clamp(2.3rem,6.5vw,3.8rem)] leading-[1.08] tracking-[-0.01em] text-creme max-w-[16ch] mx-auto">
        {isEn ? 'The patterns that make you repeat are veils.' : 'Os padrões que te fazem repetir são véus.'}
      </h1>
      <p className="rv font-serif italic font-light text-ocre text-[clamp(1.1rem,3.6vw,1.45rem)] mt-6 leading-[1.4] whitespace-pre-line">
        {isEn ? 'See what binds you.\nRelease what makes you repeat.' : 'Vê o que te prende.\nSolta o que te faz repetir.'}
      </p>

      <GotaAssina className="rv w-[64px] h-[64px] mx-auto mt-9 mb-10 opacity-95 block" />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={capa}
        alt={isEn ? 'The Seven Veils' : 'Os Sete Véus'}
        className="rv w-[230px] h-auto rounded-[16px] mx-auto mb-8 block border border-ocre"
        style={{ boxShadow: '0 0 0 6px rgba(184,132,61,0.10), 0 24px 70px -24px rgba(0,0,0,0.7)', aspectRatio: '1400 / 1873' }}
      />

      <div className="rv flex flex-col items-center gap-3">
        <Link
          href={livroHref}
          className="inline-block bg-ambar text-[#2A1C12] no-underline rounded-full px-8 py-3 text-[0.95rem] font-sans tracking-[0.02em] hover:bg-ocre transition-colors"
        >
          {isEn ? 'Discover the book' : 'Conhece o livro'}
        </Link>
        <p className="font-sans text-[0.76rem] tracking-[0.12em] text-creme-2/45">
          {isEn ? 'Os Sete Véus · ~22,000 words · €19' : 'Os Sete Véus · ~22.000 palavras · €19'}
        </p>
      </div>
    </header>
  );
}
