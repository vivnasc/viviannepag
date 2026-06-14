import { setRequestLocale } from 'next-intl/server';
import { TopNav } from '@/components/TopNav';
import { LangToggle } from '@/components/LangToggle';
import { Footer } from '@/components/home/Footer';
import { BotaoCompra } from '@/components/BotaoCompra';
import { GotaAssina, GotaMini } from '@/components/icons/GotaAssina';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const SUPA = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
const capaUrl = (locale: string) =>
  `${SUPA}/storage/v1/object/public/viviannepag-assets/livro-pilar/os-7-veus/capa-composta${locale === 'en' ? '-en' : ''}.png`;
const CAPA_BASE = capaUrl('pt');

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'The Seven Veils · Method VS · Vivianne dos Santos' : 'Os Sete Véus · Método VS · Vivianne dos Santos',
    description: isEn
      ? 'See what binds you. Release what makes you repeat. The pillar book of Method VS.'
      : 'Vê o que te prende. Solta o que te faz repetir. O livro-pilar do Método VS.',
    openGraph: { images: [CAPA_BASE] },
  };
}

const VEUS: [string, string, string, string][] = [
  ['A Permanência', 'defenderes quem já não és', 'Permanence', 'defending who you no longer are'],
  ['A Memória', 'viveres preso à tua história', 'Memory', 'living trapped in your story'],
  ['O Turbilhão', 'afogares-te na própria cabeça', 'The Whirlwind', 'drowning in your own head'],
  ['O Esforço', 'esforçares-te para seres amada', 'Effort', 'striving to be loved'],
  ['A Desolação', 'o medo do vazio', 'Desolation', 'the fear of emptiness'],
  ['O Horizonte', 'viver à espera de um quando', 'The Horizon', 'living in wait for a someday'],
  ['A Dualidade', 'a separação, raiz de todos', 'Duality', 'separation, the root of them all'],
];

export default async function OsSeteVeus({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEn = locale === 'en';
  const capa = `${capaUrl(locale)}?v=${Date.now()}`;

  return (
    <>
      <TopNav />
      <LangToggle />
      <div className="relative z-[2] max-w-wrap mx-auto px-7">

        {/* HERO */}
        <header className="pt-24 pb-12 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={capa}
            alt={isEn ? 'The Seven Veils' : 'Os Sete Véus'}
            className="w-[260px] h-auto rounded-[18px] mx-auto mb-10 block border border-ocre"
            style={{ boxShadow: '0 0 0 6px rgba(184,132,61,0.10), 0 24px 70px -24px rgba(0,0,0,0.7)', aspectRatio: '1400 / 1873' }}
          />
          <p className="font-sans text-[0.7rem] tracking-[0.34em] uppercase text-salvia mb-5">
            {isEn ? 'Method VS · See and Release' : 'Método VS · Ver e Soltar'}
          </p>
          <h1 className="font-serif font-light text-[clamp(2.6rem,8vw,4.4rem)] leading-[1.04] tracking-[-0.01em] text-creme">
            {isEn ? 'The Seven Veils' : 'Os Sete Véus'}
          </h1>
          <p className="font-serif italic font-light text-ocre text-[clamp(1.1rem,3.6vw,1.5rem)] mt-5 leading-[1.4] whitespace-pre-line">
            {isEn ? 'See what binds you.\nRelease what makes you repeat.' : 'Vê o que te prende.\nSolta o que te faz repetir.'}
          </p>
          <GotaAssina className="w-[72px] h-[72px] mx-auto mt-8 opacity-95 block" />
          <p className="max-w-[560px] mx-auto mt-10 text-[1.08rem] leading-[1.85] text-creme-2">
            {isEn
              ? 'The pillar book of Method VS. A crossing through the seven veils that stand between you and who you are, and the simple way to lift them: '
              : 'O livro-pilar do Método VS. Uma travessia pelos sete véus que se põem entre ti e quem és, e o caminho simples para os erguer: '}
            <strong className="text-ambar font-normal">{isEn ? 'see, and release.' : 'ver, e soltar.'}</strong>
          </p>
          <p className="font-sans text-[0.78rem] tracking-[0.12em] text-creme-2/45 mt-5">
            {isEn ? '~22,000 words · immediate PDF · €19' : '~22.000 palavras · PDF imediato · €19'}
          </p>
        </header>

        <div className="veu my-16" />

        {/* O MÉTODO */}
        <section className="text-center max-w-[600px] mx-auto my-12">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-6">{isEn ? 'The method' : 'O método'}</p>
          <p className="font-serif italic font-light text-ambar text-[clamp(1.2rem,3.6vw,1.5rem)] leading-[1.45]">
            {isEn ? 'The patterns that make you repeat are veils.' : 'Os padrões que te fazem repetir são véus.'}
          </p>
          <p className="mt-7 text-[1.05rem] leading-[1.85] text-creme-2">
            {isEn
              ? 'Two movements lift them. To SEE the pattern without judging yourself, only locating it. And to RELEASE what no longer serves you, not by force, but by ceasing to hold it. There is no releasing without seeing.'
              : 'Dois movimentos erguem-nos. VER o padrão sem te julgares, apenas localizá-lo. E SOLTAR o que já não te serve, não à força, mas deixando de o segurar. Não há soltar sem ver.'}
          </p>
          <GotaMini className="w-[24px] h-[24px] mx-auto mt-8 opacity-60 block" />
        </section>

        <div className="veu my-16" />

        {/* OS SETE VÉUS */}
        <section className="my-12">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-8 text-center">{isEn ? 'The seven veils' : 'Os sete véus'}</p>
          <ol className="max-w-[560px] mx-auto">
            {VEUS.map(([nomePt, descPt, nomeEn, descEn], i) => (
              <li key={i} className="flex items-baseline gap-5 py-4 border-b border-ocre/12 last:border-0">
                <span className="font-serif font-light text-ocre text-2xl w-7 shrink-0">{i + 1}</span>
                <span className="font-serif text-creme text-[1.15rem]">{isEn ? nomeEn : nomePt}</span>
                <span className="text-creme-2/60 text-[0.95rem] italic leading-snug">{isEn ? descEn : descPt}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="veu my-16" />

        {/* AMOSTRA */}
        <section className="max-w-[620px] mx-auto my-12 text-center">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-7">{isEn ? 'A taste' : 'Uma amostra'}</p>
          <div className="font-serif font-light text-creme-2 text-[1.12rem] leading-[1.95] space-y-5">
            {isEn ? (
              <>
                <p>Why does someone lucid, who clearly sees what harms them, do it again? Not once, but over and over.</p>
                <p>We do not repeat for lack of will, nor of awareness. We repeat because, at some point, that was the most intelligent answer a body found to survive, to belong, to be loved. And the body does not forget what once kept it safe.</p>
              </>
            ) : (
              <>
                <p>Porque é que alguém lúcido, que vê com clareza o que lhe faz mal, volta a fazê-lo? Não uma vez, vezes sem conta.</p>
                <p>Não repetimos por falta de vontade, nem de consciência. Repetimos porque, em algum momento, aquilo foi a resposta mais inteligente que um corpo encontrou para sobreviver, para pertencer, para ser amado. E o corpo não esquece o que um dia o manteve seguro.</p>
              </>
            )}
          </div>
        </section>

        <div className="veu my-16" />

        {/* COMPRA */}
        <section className="max-w-[440px] mx-auto my-12 text-center">
          <h2 className="font-serif font-light text-creme text-[clamp(1.6rem,5vw,2.1rem)] leading-tight mb-3">
            {isEn ? 'Take the book home' : 'Leva o livro contigo'}
          </h2>
          <p className="text-creme-2/65 text-[0.95rem] leading-relaxed mb-8">
            {isEn ? 'Immediate PDF, yours to keep and return to. €19.' : 'PDF imediato, teu para guardar e voltar. €19.'}
          </p>
          <BotaoCompra slug="os-7-veus" locale={locale} titulo={isEn ? 'The Seven Veils' : 'Os Sete Véus'} preco="€19" />
        </section>

        <p className="max-w-[600px] mx-auto pb-4 text-center text-creme-2/45 text-[0.85rem] italic font-serif leading-relaxed">
          {isEn
            ? 'From the path, not from a pedestal. Vivianne dos Santos studies transpersonal psychology and systemic family constellations. What is shared here passed through her first.'
            : 'Do caminho, não de um pedestal. Vivianne dos Santos estuda psicologia transpessoal e constelação familiar sistémica. O que aqui se partilha passou primeiro por ela.'}
        </p>

        <div className="veu my-16" />
        <Footer />
      </div>
    </>
  );
}
