import { setRequestLocale } from 'next-intl/server';
import { TopNav } from '@/components/TopNav';
import { LangToggle } from '@/components/LangToggle';
import { Footer } from '@/components/home/Footer';
import { BotaoCompra } from '@/components/BotaoCompra';
import { GotaAssina, GotaMini } from '@/components/icons/GotaAssina';
import type { Metadata } from 'next';

// Landing dedicada de Os 7 Sinais de Desencaixe (irmão de Os Sete Véus).
// Mesma altura de cuidado que a página /os-sete-veus, mas com a voz e a matéria
// DESTE livro: o momento à mesa, o desencaixe, os sete sinais, a falsa escolha
// (voltar a caber · abandonar a mesa) e o terceiro verbo, permanecer. As frases
// fortes são da própria Vivianne (introdução do livro), não inventadas.
export const dynamic = 'force-dynamic';

const SUPA = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
const capaUrl = (locale: string) =>
  `${SUPA}/storage/v1/object/public/viviannepag-assets/livro-pilar/os-7-sinais/capa-composta${locale === 'en' ? '-en' : ''}.png`;
const capaLocal = (locale: string) => `/produtos/os-7-sinais-capa${locale === 'en' ? '-en' : ''}.png`;
const CAPA_BASE = capaUrl('pt');

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn
      ? 'The Seven Signs of Not Belonging · Vivianne dos Santos'
      : 'Os 7 Sinais de Desencaixe · Vivianne dos Santos',
    description: isEn
      ? 'The quiet moment when you stop fitting a place that was good. Belonging without making yourself smaller.'
      : 'O momento calado em que deixas de caber num lugar que foi bom. Pertencer sem te diminuíres.',
    openGraph: { images: [CAPA_BASE] },
  };
}

// Os sete sinais: a linha que se reconhece em 3 segundos (o título de cada
// capítulo do livro). Sem nomes de marca; a frase é o reconhecimento.
const SINAIS: [string, string][] = [
  ['Estás presente mas não te sentes pertencente.', 'You are present but you do not feel that you belong.'],
  ['Começas a diminuir-te para caber.', 'You begin to shrink yourself to fit.'],
  ['Sentes saudades de algo que nunca viveste.', 'You feel longing for something you never lived.'],
  ['Oscilas entre hiper-adaptação e isolamento.', 'You swing between over-adapting and isolation.'],
  ['O teu sistema nervoso começa a rejeitar certos ambientes.', 'Your nervous system begins to reject certain environments.'],
  ['Começas a confundir paz com ausência de pessoas.', 'You begin to confuse peace with the absence of people.'],
  ['Percebes que o problema nunca foi pertencer, mas o preço da pertença.', 'You realise the problem was never belonging, but the price of belonging.'],
];

export default async function Os7Sinais({ params }: { params: Promise<{ locale: string }> }) {
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
            alt={isEn ? 'The Seven Signs of Not Belonging' : 'Os 7 Sinais de Desencaixe'}
            onError={(e) => { const t = e.currentTarget; if (!t.src.endsWith(capaLocal(locale))) t.src = capaLocal(locale); }}
            className="w-[260px] h-auto rounded-[18px] mx-auto mb-10 block border border-ocre"
            style={{ boxShadow: '0 0 0 6px rgba(184,132,61,0.10), 0 24px 70px -24px rgba(0,0,0,0.7)', aspectRatio: '1600 / 2560' }}
          />
          <p className="font-sans text-[0.7rem] tracking-[0.34em] uppercase text-salvia mb-5">
            {isEn ? 'New book · companion to The Seven Veils' : 'Novo livro · irmão de Os Sete Véus'}
          </p>
          <h1 className="font-serif font-light text-[clamp(2.4rem,7.5vw,4.2rem)] leading-[1.05] tracking-[-0.01em] text-creme">
            {isEn ? 'The Seven Signs\nof Not Belonging' : 'Os 7 Sinais\nde Desencaixe'}
          </h1>
          <p className="font-serif italic font-light text-ocre text-[clamp(1.1rem,3.6vw,1.5rem)] mt-5 leading-[1.4]">
            {isEn ? 'Belonging without making yourself smaller.' : 'Pertencer sem te diminuíres.'}
          </p>
          <GotaAssina className="w-[72px] h-[72px] mx-auto mt-8 opacity-95 block" />
          <p className="max-w-[580px] mx-auto mt-10 text-[1.08rem] leading-[1.85] text-creme-2">
            {isEn
              ? 'The companion book to The Seven Veils. About the quiet moment, hard to confess, when you stop fitting a place that was good, '
              : 'O irmão de Os Sete Véus. Sobre o momento calado, difícil de confessar, em que deixas de caber num lugar que foi bom, '}
            <strong className="text-ambar font-normal">
              {isEn
                ? 'without anything in it having changed, and without anyone having done anything wrong.'
                : 'sem que nada nele tenha mudado, e sem que ninguém tenha feito nada de errado.'}
            </strong>
          </p>
          <p className="font-sans text-[0.78rem] tracking-[0.12em] text-creme-2/45 mt-5">
            {isEn ? '~50,000 words · immediate PDF · €14 (instead of €19)' : '~50.000 palavras · PDF imediato · €14 (em vez de €19)'}
          </p>
        </header>

        <div className="veu my-16" />

        {/* O MOMENTO À MESA — o gancho, nas palavras dela */}
        <section className="max-w-[620px] mx-auto my-12">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-7 text-center">
            {isEn ? 'The moment' : 'O momento'}
          </p>
          <div className="font-serif font-light text-creme-2 text-[1.12rem] leading-[1.95] space-y-5">
            {isEn ? (
              <>
                <p>You are at the table. An ordinary dinner. The voices you know by heart rise and fall around you, and you know, before each sentence ends, who is going to say what. You are surrounded by people you love, present, your whole body there.</p>
                <p>And at the same time there is something you cannot name that moves through you slowly: <em>you are no longer the person they are talking to.</em></p>
                <p>It is not that they say anything wrong. They treat you exactly as they always have, and that is precisely where it hurts. What changed is not in the room. <strong className="text-ambar font-normal">It is in you.</strong></p>
              </>
            ) : (
              <>
                <p>Estás à mesa. Um jantar qualquer. As vozes que conheces de cor sobem e descem à tua volta, e sabes, antes de cada frase acabar, quem vai dizer o quê. Estás rodeada de pessoas que amas, presente, com o corpo inteiro ali.</p>
                <p>E ao mesmo tempo há uma coisa que não consegues nomear e que te atravessa devagar: <em>já não és a pessoa com quem elas estão a conversar.</em></p>
                <p>Não é que digam alguma coisa errada. Tratam-te exactamente como sempre te trataram, e é precisamente aí que dói. O que mudou não está na sala. <strong className="text-ambar font-normal">Está em ti.</strong></p>
              </>
            )}
          </div>
        </section>

        <div className="veu my-16" />

        {/* NÃO ÉS INGRATA — desarmar a vergonha */}
        <section className="max-w-[600px] mx-auto my-12 text-center">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-6">
            {isEn ? 'Before anything else' : 'Antes de mais'}
          </p>
          <p className="font-serif italic font-light text-ambar text-[clamp(1.2rem,3.6vw,1.55rem)] leading-[1.45]">
            {isEn ? 'You are not ungrateful.' : 'Não és ingrata.'}
          </p>
          <p className="mt-7 text-[1.05rem] leading-[1.85] text-creme-2">
            {isEn
              ? 'To feel the not-fitting is not to undervalue what you have. It is the exact opposite. Only someone who truly loves the place feels this ache. If you did not care, it would not hurt. The ache is the proof of the love, not its absence.'
              : 'Sentir o desencaixe não é não dar valor ao que tens. É o exacto oposto. Só sente esta dor quem ama de verdade o lugar. Se não te importasses, não te doía. A dor é a prova do amor, não a sua falta.'}
          </p>
          <GotaMini className="w-[24px] h-[24px] mx-auto mt-8 opacity-60 block" />
        </section>

        <div className="veu my-16" />

        {/* OS SETE SINAIS — reconhecimento */}
        <section className="my-12">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-3 text-center">
            {isEn ? 'The seven signs' : 'Os sete sinais'}
          </p>
          <p className="text-center text-creme-2/70 max-w-[540px] mx-auto mb-9 text-[1rem] leading-relaxed">
            {isEn
              ? 'Not steps to climb, but lenses on the same feeling. Do you recognise yourself in any of them?'
              : 'Não são degraus a subir, são lentes sobre a mesma sensação. Reconheces-te em algum?'}
          </p>
          <ol className="max-w-[600px] mx-auto">
            {SINAIS.map(([pt, en], i) => (
              <li key={i} className="flex items-baseline gap-5 py-4 border-b border-ocre/12 last:border-0">
                <span className="font-serif font-light text-ocre text-2xl w-7 shrink-0">{i + 1}</span>
                <span className="flex-1">
                  <span className="block text-creme-2 text-[1.05rem] leading-snug">{isEn ? en : pt}</span>
                  <span className="block font-sans text-[0.66rem] tracking-[0.26em] uppercase text-salvia mt-1.5">
                    {isEn ? `Sign ${i + 1}` : `Sinal ${i + 1}`}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <div className="veu my-16" />

        {/* A FALSA ESCOLHA + O TERCEIRO VERBO */}
        <section className="max-w-[640px] mx-auto my-12">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-7 text-center">
            {isEn ? 'The false choice' : 'A falsa escolha'}
          </p>
          <div className="grid sm:grid-cols-2 gap-5 mb-9">
            <div className="border border-ocre/15 rounded-[14px] p-6">
              <p className="font-serif text-creme text-[1.1rem] mb-2">{isEn ? 'Go back to fitting' : 'Voltar a caber'}</p>
              <p className="text-creme-2/75 text-[0.96rem] leading-[1.7]">
                {isEn ? 'You shrink until you fit again, and you pay with pieces of yourself.' : 'Encolhes-te até caberes outra vez, e pagas com pedaços de ti.'}
              </p>
            </div>
            <div className="border border-ocre/15 rounded-[14px] p-6">
              <p className="font-serif text-creme text-[1.1rem] mb-2">{isEn ? 'Leave the table' : 'Abandonar a mesa'}</p>
              <p className="text-creme-2/75 text-[0.96rem] leading-[1.7]">
                {isEn ? 'You cut in the name of your truth, and you pay with solitude.' : 'Cortas em nome da tua verdade, e pagas com a solidão.'}
              </p>
            </div>
          </div>
          <p className="text-center text-[1.05rem] leading-[1.85] text-creme-2 mb-7">
            {isEn
              ? 'Both start from the same lie: that you cannot have both things. This book refuses that choice, with a third verb.'
              : 'Ambas partem da mesma mentira: a de que não podes ter as duas coisas. Este livro recusa essa escolha, com um terceiro verbo.'}
          </p>
          <p className="text-center font-serif italic font-light text-ambar text-[clamp(1.4rem,4.5vw,1.9rem)] leading-[1.3]">
            {isEn ? 'To remain.' : 'Permanecer.'}
          </p>
          <p className="text-center mt-6 text-[1.05rem] leading-[1.85] text-creme-2">
            {isEn
              ? 'To stay at the table without shrinking, whole, in your version of now. The hardest of the three, and the only one that costs you neither a piece of yourself nor a person you love.'
              : 'Ficar à mesa sem te encolheres, inteira, na tua versão de agora. A mais difícil das três, e a única que não te custa um pedaço de ti nem uma pessoa que amas.'}
          </p>
        </section>

        <div className="veu my-16" />

        {/* AMOSTRA — a tese, palavras dela */}
        <section className="max-w-[620px] mx-auto my-12 text-center">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-7">{isEn ? 'A taste' : 'Uma amostra'}</p>
          <p className="font-serif font-light text-creme text-[clamp(1.3rem,4vw,1.7rem)] leading-[1.5]">
            {isEn
              ? 'The opposite of not-fitting is not fitting in. It is belonging without needing to make yourself smaller.'
              : 'O oposto do desencaixe não é encaixar. É pertencer sem precisares de te diminuíres.'}
          </p>
          <p className="mt-7 text-[1.05rem] leading-[1.85] text-creme-2/85">
            {isEn
              ? 'There is no place of arrival at the end of these pages. There is a way of being inside this without losing yourself. A language for what had no name. The company of someone who was at that table, and felt exactly what you felt.'
              : 'Não há, no fim destas páginas, um lugar de chegada. Há uma forma de estar dentro disto sem te perderes. Uma linguagem para o que não tinha nome. A companhia de alguém que esteve a essa mesa, e sentiu exactamente o que tu sentiste.'}
          </p>
        </section>

        <div className="veu my-16" />

        {/* O QUE LEVAS */}
        <section className="max-w-[560px] mx-auto my-12">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-7 text-center">
            {isEn ? 'What you take home' : 'O que levas'}
          </p>
          <ul className="space-y-4">
            {(isEn
              ? [
                  ['Seven signs', 'each one in three movements: recognition, deepening, and the smallest, truest turn.'],
                  ['Pauses to breathe', 'small stops along the way, to set the book down and let something settle.'],
                  ['~50,000 words', 'immediate PDF, to read on your phone, computer or to print. Yours to keep and return to.'],
                  ['An honest promise', 'not a place of arrival. A way to stay.'],
                ]
              : [
                  ['Sete sinais', 'cada um em três movimentos: reconhecimento, aprofundamento, e a viragem mais pequena e verdadeira.'],
                  ['Respiros', 'pequenas pausas pelo caminho, para pousar o livro e deixar assentar.'],
                  ['~50.000 palavras', 'PDF imediato, para ler no telemóvel, no computador ou imprimir. Teu para guardar e voltar.'],
                  ['Uma promessa honesta', 'não um lugar de chegada. Uma forma de ficar.'],
                ]
            ).map(([t, d]) => (
              <li key={t} className="flex items-baseline gap-4">
                <GotaMini className="w-[16px] h-[16px] shrink-0 opacity-60 translate-y-1 block" />
                <p className="text-creme-2 text-[1.02rem] leading-[1.7]">
                  <strong className="text-creme font-normal">{t}</strong>
                  {isEn ? ', ' : ', '}{d}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <div className="veu my-16" />

        {/* COMPRA */}
        <section className="max-w-[440px] mx-auto my-12 text-center">
          <h2 className="font-serif font-light text-creme text-[clamp(1.6rem,5vw,2.1rem)] leading-tight mb-3">
            {isEn ? 'Take the book home' : 'Leva o livro contigo'}
          </h2>
          <div className="flex items-baseline justify-center gap-3 mb-3">
            <span className="font-serif text-ambar text-[2rem] leading-none">€14</span>
            <span className="line-through text-creme-2/40 text-[1.1rem]">€19</span>
            <span className="bg-ouro/20 text-ouro border border-ouro/40 rounded-full px-3 py-1 text-[0.7rem] font-semibold tracking-[0.04em]">
              {isEn ? 'Save €5' : 'Poupas €5'}
            </span>
          </div>
          <p className="text-creme-2/65 text-[0.95rem] leading-relaxed mb-8">
            {isEn ? 'Immediate PDF, yours to keep and return to. 7-day guarantee.' : 'PDF imediato, teu para guardar e voltar. Garantia de 7 dias.'}
          </p>
          <BotaoCompra slug="os-7-sinais" locale={locale} titulo={isEn ? 'The Seven Signs of Not Belonging' : 'Os 7 Sinais de Desencaixe'} preco="€14" />
        </section>

        {/* VEJO-TE + nota da autora */}
        <section className="max-w-[600px] mx-auto my-12 text-center">
          <p className="font-serif italic font-light text-creme-2 text-[1.15rem] leading-[1.7]">
            {isEn
              ? 'I see you. I see what you feel at that table, and I see that you have carried it alone, without a name, thinking it was a fault of yours. It is not.'
              : 'Vejo-te. Vejo o que sentes a essa mesa, e vejo que o tens carregado sozinha, sem nome, achando que era defeito teu. Não é.'}
          </p>
          <p className="mt-8 text-creme-2/45 text-[0.85rem] italic font-serif leading-relaxed">
            {isEn
              ? 'From the path, not from a pedestal. Vivianne dos Santos studies transpersonal psychology and systemic family constellations. What is shared here passed through her first.'
              : 'Do caminho, não de um pedestal. Vivianne dos Santos estuda psicologia transpessoal e constelação familiar sistémica. O que aqui se partilha passou primeiro por ela.'}
          </p>
        </section>

        <div className="veu my-16" />
        <Footer />
      </div>
    </>
  );
}
