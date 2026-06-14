import Link from 'next/link';
import { GotaMini } from '../icons/GotaAssina';

const VEUS: [string, string][] = [
  ['A Permanência', 'Permanence'],
  ['A Memória', 'Memory'],
  ['O Turbilhão', 'The Whirlwind'],
  ['O Esforço', 'Effort'],
  ['A Desolação', 'Desolation'],
  ['O Horizonte', 'The Horizon'],
  ['A Dualidade', 'Duality'],
];

// O método em breve, na home: Ver e Soltar + os sete véus, com porta para o livro.
export function MetodoResumo({ locale }: { locale: string }) {
  const isEn = locale === 'en';
  const livroHref = isEn ? '/en/os-sete-veus' : '/os-sete-veus';

  return (
    <section className="text-center max-w-[620px] mx-auto my-4">
      <p className="rv font-sans text-[0.78rem] tracking-[0.32em] uppercase text-ocre mb-3">
        {isEn ? 'The method' : 'O método'}
      </p>
      <p className="rv font-serif italic font-light text-ambar text-[clamp(1.2rem,3.6vw,1.5rem)] leading-[1.45]">
        {isEn ? 'Two movements: to see, and to release.' : 'Dois gestos: ver, e soltar.'}
      </p>
      <p className="rv mt-6 text-[1.05rem] leading-[1.85] text-creme-2">
        {isEn
          ? 'We repeat not for lack of will, but because a veil, learned early to keep us safe, still chooses for us. To SEE the pattern without judgement, and to RELEASE what no longer serves: there is no releasing without seeing.'
          : 'Repetimos não por falta de vontade, mas porque um véu, aprendido cedo para nos manter a salvo, ainda escolhe por nós. VER o padrão sem juízo, e SOLTAR o que já não serve: não há soltar sem ver.'}
      </p>

      <ol className="rv mt-9 flex flex-wrap justify-center gap-x-3 gap-y-2 max-w-[520px] mx-auto">
        {VEUS.map(([pt, en], i) => (
          <li key={i} className="font-serif text-creme-2/85 text-[1rem]">
            <span className="text-ocre">{i + 1}</span>&nbsp;{isEn ? en : pt}
            {i < VEUS.length - 1 && <span className="text-ocre/30 ml-3">·</span>}
          </li>
        ))}
      </ol>

      <div className="rv mt-10">
        <Link href={livroHref} className="font-sans text-[0.9rem] tracking-[0.04em] text-ambar no-underline border-b border-ambar/40 hover:border-ambar pb-1 transition-colors">
          {isEn ? 'The seven veils, one by one →' : 'Os sete véus, um a um →'}
        </Link>
      </div>
      <GotaMini className="rv w-[24px] h-[24px] mx-auto mt-10 opacity-60 block" />
    </section>
  );
}
