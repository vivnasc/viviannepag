import Link from 'next/link';
import Image from 'next/image';
import { GotaAssina } from '../icons/GotaAssina';

// Herói da home: a Vivianne (rosto da marca) E o Método VS como mensagem. A home
// APONTA para o livro (que tem página própria), não o repete.
export function MetodoHero({ locale }: { locale: string }) {
  const isEn = locale === 'en';
  const diagHref = isEn ? '/en/diagnostico' : '/diagnostico';

  // Dores reconhecíveis (a língua de quem chega), não a filosofia.
  const dores = isEn
    ? ['Relationships.', 'Anxiety.', 'Too much responsibility.', 'Fear of stopping.']
    : ['Relações.', 'Ansiedade.', 'Excesso de responsabilidade.', 'Medo de parar.'];

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
      <h1 className="rv font-serif font-light text-[clamp(1.9rem,5.5vw,3.1rem)] leading-[1.12] tracking-[-0.01em] text-creme max-w-[20ch] mx-auto">
        {isEn ? 'Why do you keep repeating what makes you suffer?' : 'Porque é que continuas a repetir o que te faz sofrer?'}
      </h1>
      <p className="rv mt-6 font-serif italic text-ocre text-[1.05rem] leading-[1.8]">
        {dores.join('  ')}
      </p>
      <p className="rv max-w-[540px] mx-auto mt-7 text-[1.06rem] leading-[1.8] text-creme-2">
        {isEn
          ? 'Method VS helps you spot the invisible patterns that keep you stuck, and gives you a concrete way to release them, one by one.'
          : 'O Método VS ajuda-te a identificar os padrões invisíveis que te mantêm presa e dá-te uma forma concreta de os largar, um a um.'}
      </p>
      <GotaAssina className="rv w-[56px] h-[56px] mx-auto mt-8 opacity-95 block" />
      <div className="rv mt-8">
        <Link
          href={diagHref}
          className="inline-block bg-ambar text-[#2A1C12] no-underline rounded-full px-8 py-3 text-[0.95rem] font-sans tracking-[0.02em] hover:bg-ocre transition-colors"
        >
          {isEn ? 'Find my first step' : 'Descobrir o meu primeiro passo'}
        </Link>
      </div>
    </header>
  );
}
