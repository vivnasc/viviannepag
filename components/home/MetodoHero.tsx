import Link from 'next/link';
import Image from 'next/image';
import { GotaAssina } from '../icons/GotaAssina';

// Herói da home: a Vivianne (rosto da marca) E o Método VS como mensagem. A home
// APONTA para o livro (que tem página própria), não o repete.
export function MetodoHero({ locale }: { locale: string }) {
  const isEn = locale === 'en';
  const livroHref = isEn ? '/en/os-sete-veus' : '/os-sete-veus';

  return (
    <header className="pt-20 pb-12 text-center">
      <Image
        src="/vivianne-1.jpg"
        alt="Vivianne dos Santos"
        width={644}
        height={1280}
        priority
        className="w-[210px] h-auto rounded-[28px] mx-auto mb-8 object-cover border border-ocre block"
        style={{ boxShadow: '0 0 0 6px rgba(184,132,61,0.10), 0 20px 60px -20px rgba(0,0,0,0.6)', aspectRatio: '644 / 1280' }}
      />
      <p className="rv font-sans text-[0.72rem] tracking-[0.34em] uppercase text-salvia mb-4">
        {isEn ? 'Vivianne dos Santos · Method VS' : 'Vivianne dos Santos · Método VS'}
      </p>
      <h1 className="rv font-serif font-light text-[clamp(2.3rem,6.5vw,3.7rem)] leading-[1.08] tracking-[-0.01em] text-creme max-w-[15ch] mx-auto whitespace-pre-line">
        {isEn ? 'See what binds you.\nRelease what makes you repeat.' : 'Vê o que te prende.\nSolta o que te faz repetir.'}
      </h1>
      <GotaAssina className="rv w-[64px] h-[64px] mx-auto mt-8 opacity-95 block" />
      <p className="rv max-w-[540px] mx-auto mt-9 text-[1.08rem] leading-[1.85] text-creme-2">
        {isEn
          ? 'The patterns that make you repeat are veils, learned early to keep you safe. Method VS is the simple way to lift them, one by one: '
          : 'Os padrões que te fazem repetir são véus, aprendidos cedo para te manterem a salvo. O Método VS é o caminho simples para os erguer, um a um: '}
        <strong className="text-ambar font-normal">{isEn ? 'see, and release.' : 'ver, e soltar.'}</strong>
      </p>
      <div className="rv mt-9">
        <Link
          href={livroHref}
          className="inline-block bg-ambar text-[#2A1C12] no-underline rounded-full px-8 py-3 text-[0.95rem] font-sans tracking-[0.02em] hover:bg-ocre transition-colors"
        >
          {isEn ? 'The book · The Seven Veils' : 'O livro · Os Sete Véus'}
        </Link>
      </div>
    </header>
  );
}
