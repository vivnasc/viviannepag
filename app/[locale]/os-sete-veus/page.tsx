import { setRequestLocale } from 'next-intl/server';
import { TopNav } from '@/components/TopNav';
import { BotaoCompra } from '@/components/BotaoCompra';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const CAPA_URL = `${(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '')}/storage/v1/object/public/viviannepag-assets/livro-pilar/os-7-veus/capa-composta.png`;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'The Seven Veils · Method VS' : 'Os Sete Véus · Método VS',
    description: isEn
      ? 'See what binds you. Release what makes you repeat. The pillar book of Method VS, by Vivianne dos Santos.'
      : 'Vê o que te prende. Solta o que te faz repetir. O livro-pilar do Método VS, por Vivianne dos Santos.',
    openGraph: { images: [CAPA_URL] },
  };
}

const VEUS = [
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

  return (
    <main className="min-h-screen">
      <TopNav />

      {/* HERO */}
      <section className="max-w-[960px] mx-auto px-6 pt-14 pb-12 flex flex-col md:flex-row items-center gap-12">
        <div className="shrink-0 w-[240px] md:w-[300px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CAPA_URL} alt={isEn ? 'The Seven Veils' : 'Os Sete Véus'} className="rounded-[10px] shadow-2xl border border-ocre/20" />
        </div>
        <div className="text-center md:text-left">
          <p className="text-[0.7rem] tracking-[0.34em] uppercase text-salvia mb-3">
            {isEn ? 'Method VS · See and Release' : 'Método VS · Ver e Soltar'}
          </p>
          <h1 className="font-serif font-light text-creme text-4xl md:text-5xl leading-[1.1] mb-4">
            {isEn ? 'The Seven Veils' : 'Os Sete Véus'}
          </h1>
          <p className="font-serif italic text-creme-2/85 text-lg md:text-xl leading-relaxed mb-5">
            {isEn ? 'See what binds you. Release what makes you repeat.' : 'Vê o que te prende. Solta o que te faz repetir.'}
          </p>
          <p className="text-creme-2/65 text-[0.95rem] leading-relaxed mb-2">
            {isEn
              ? 'The pillar book of Method VS. A crossing through the seven veils that stand between you and who you are, and the simple way to lift them.'
              : 'O livro-pilar do Método VS. Uma travessia pelos sete véus que se põem entre ti e quem és, e o caminho simples para os erguer.'}
          </p>
          <p className="text-creme-2/45 text-[0.82rem]">
            {isEn ? '~22,000 words · immediate PDF · by Vivianne dos Santos' : '~22.000 palavras · PDF imediato · por Vivianne dos Santos'}
          </p>
        </div>
      </section>

      {/* O MÉTODO */}
      <section className="max-w-[760px] mx-auto px-6 py-10 border-t border-ocre/12">
        <p className="text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-4 text-center">
          {isEn ? 'The method' : 'O método'}
        </p>
        <p className="font-serif text-creme-2/85 text-lg leading-relaxed text-center max-w-[620px] mx-auto">
          {isEn
            ? 'The patterns that make you repeat are veils. Two movements lift them: to SEE the pattern without judging yourself, and to RELEASE what no longer serves you. There is no releasing without seeing.'
            : 'Os padrões que te fazem repetir são véus. Dois movimentos erguem-nos: VER o padrão sem te julgares, e SOLTAR o que já não te serve. Não há soltar sem ver.'}
        </p>
      </section>

      {/* OS 7 VÉUS */}
      <section className="max-w-[760px] mx-auto px-6 py-10 border-t border-ocre/12">
        <p className="text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-6 text-center">
          {isEn ? 'The seven veils' : 'Os sete véus'}
        </p>
        <ol className="space-y-3">
          {VEUS.map(([nomePt, descPt, nomeEn, descEn], i) => (
            <li key={i} className="flex items-baseline gap-4 border-b border-ocre/10 pb-3">
              <span className="font-serif text-ambar/80 text-lg w-6 shrink-0">{i + 1}</span>
              <span className="font-serif text-creme text-[1.05rem]">{isEn ? nomeEn : nomePt}</span>
              <span className="text-creme-2/55 text-[0.9rem] italic">{isEn ? descEn : descPt}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* AMOSTRA */}
      <section className="max-w-[720px] mx-auto px-6 py-12 border-t border-ocre/12">
        <p className="text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-5 text-center">
          {isEn ? 'A taste' : 'Uma amostra'}
        </p>
        <div className="font-serif text-creme-2/80 text-[1.02rem] leading-[1.9] space-y-4">
          {isEn ? (
            <>
              <p>Why does someone lucid, who clearly sees what harms them, do it again? Not once, but over and over. The same kind of love already known by heart. The same exhaustion of giving until there is nothing left.</p>
              <p>We do not repeat for lack of will, nor of awareness. We repeat because, at some point, that was the most intelligent answer a body found to survive, to belong, to be loved. And the body does not forget what once kept it safe.</p>
            </>
          ) : (
            <>
              <p>Porque é que alguém lúcido, que vê com clareza o que lhe faz mal, volta a fazê-lo? Não uma vez, vezes sem conta. O mesmo tipo de amor que já se sabe de cor. A mesma exaustão de quem dá até não ter.</p>
              <p>Não repetimos por falta de vontade, nem de consciência. Repetimos porque, em algum momento, aquilo foi a resposta mais inteligente que um corpo encontrou para sobreviver, para pertencer, para ser amado. E o corpo não esquece o que um dia o manteve seguro.</p>
            </>
          )}
        </div>
      </section>

      {/* COMPRA */}
      <section className="max-w-[460px] mx-auto px-6 py-12 border-t border-ocre/12 text-center">
        <h2 className="font-serif font-light text-creme text-2xl mb-2">
          {isEn ? 'Take the book home' : 'Leva o livro contigo'}
        </h2>
        <p className="text-creme-2/60 text-[0.9rem] mb-6">
          {isEn ? 'Immediate PDF. Yours to keep and return to.' : 'PDF imediato. Teu, para guardar e voltar.'}
        </p>
        <BotaoCompra slug="os-7-veus" locale={locale} titulo={isEn ? 'The Seven Veils' : 'Os Sete Véus'} preco="€19" />
      </section>

      <section className="max-w-[640px] mx-auto px-6 pb-16 text-center">
        <p className="text-creme-2/45 text-[0.82rem] italic font-serif leading-relaxed">
          {isEn
            ? 'From the path, not from a pedestal. Vivianne dos Santos studies transpersonal psychology and systemic family constellations. What is shared here passed through her first.'
            : 'Do caminho, não de um pedestal. Vivianne dos Santos estuda psicologia transpessoal e constelação familiar sistémica. O que aqui se partilha passou primeiro por ela.'}
        </p>
      </section>
    </main>
  );
}
