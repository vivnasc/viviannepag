import { setRequestLocale } from 'next-intl/server';
import { TopNav } from '@/components/TopNav';
import { LangToggle } from '@/components/LangToggle';
import { Footer } from '@/components/home/Footer';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const SUPA = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
const capaUrl = (locale: string) =>
  `${SUPA}/storage/v1/object/public/viviannepag-assets/livro-medo/capa-propria${locale === 'en' ? '-en' : ''}.png`;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn
      ? 'The Seven Faces of Fear · Vivianne dos Santos'
      : 'As Sete Faces do Medo · Vivianne dos Santos',
    description: isEn
      ? 'Fear has seven faces you learned to call by other names, and one root that generates them all. A book to see it, not to conquer it.'
      : 'O medo tem sete faces que aprendeste a chamar por outros nomes, e uma raiz que as gera a todas. Um livro para o veres, não para o venceres.',
    openGraph: { images: [capaUrl(locale)] },
  };
}

// Emblema: uma raiz ao centro e sete faces que dela irradiam (seis + a raiz).
// O ponto de baixo, maior, é a raiz (a separação) que gera as outras.
function SeteFaces({ className }: { className?: string }) {
  const pts = Array.from({ length: 7 }, (_, i) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / 7;
    return { x: 70 + 52 * Math.cos(ang), y: 70 + 52 * Math.sin(ang), raiz: i === 4 };
  });
  return (
    <svg viewBox="0 0 140 140" fill="none" className={className} aria-hidden>
      <circle cx="70" cy="70" r="52" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      {pts.map((p, i) => (
        <line key={`l${i}`} x1="70" y1="70" x2={p.x} y2={p.y} stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      ))}
      {pts.map((p, i) => (
        <circle key={`c${i}`} cx={p.x} cy={p.y} r={p.raiz ? 6 : 3.4} fill={p.raiz ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" />
      ))}
      <circle cx="70" cy="70" r="8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="70" cy="70" r="2.4" fill="currentColor" />
    </svg>
  );
}

const Sep = () => <div className="h-px bg-ocre/20 max-w-[110px] mx-auto my-16" />;

// As sete faces: [medo, símbolo] em PT e EN; a 7.ª é a raiz.
const FACES: { pt: [string, string]; en: [string, string] }[] = [
  { pt: ['A Rejeição', 'O Espelho'], en: ['Rejection', 'The Mirror'] },
  { pt: ['A Perda', 'O Punho'], en: ['Loss', 'The Grip'] },
  { pt: ['A Escassez', 'O Inverno'], en: ['Scarcity', 'The Winter'] },
  { pt: ['A Incerteza', 'A Fortaleza'], en: ['Uncertainty', 'The Fortress'] },
  { pt: ['A Exposição', 'A Luz'], en: ['Exposure', 'The Light'] },
  { pt: ['A Insignificância', 'O Apagamento'], en: ['Insignificance', 'The Erasure'] },
  { pt: ['A Separação', 'O Abismo'], en: ['Separation', 'The Abyss'] },
];

export default async function AsSeteFacesDoMedo({ params }: { params: Promise<{ locale: string }> }) {
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
        <header className="pt-24 pb-10 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={capa}
            alt={isEn ? 'The Seven Faces of Fear' : 'As Sete Faces do Medo'}
            className="w-[270px] h-auto rounded-[16px] mx-auto mb-10 block border border-ocre"
            style={{ boxShadow: '0 0 0 6px rgba(184,132,61,0.10), 0 24px 70px -24px rgba(0,0,0,0.7)', aspectRatio: '2 / 3' }}
          />
          <p className="font-sans text-[0.7rem] tracking-[0.34em] uppercase text-salvia mb-5">
            {isEn ? 'Seven faces, one root' : 'Sete faces, uma raiz'}
          </p>
          <h1 className="font-serif font-light text-[clamp(2.6rem,8vw,4.4rem)] leading-[1.04] tracking-[-0.01em] text-creme">
            {isEn ? 'The Seven Faces of Fear' : 'As Sete Faces do Medo'}
          </h1>
          <p className="font-serif italic font-light text-ocre text-[clamp(1.1rem,3.6vw,1.5rem)] mt-5 leading-[1.4]">
            {isEn
              ? 'How fear built our choices, our relationships and our lives.'
              : 'Como o medo construiu as nossas escolhas, relações e vidas.'}
          </p>
          <SeteFaces className="w-[92px] h-auto mx-auto mt-9 text-ocre/90" />
          <p className="max-w-[580px] mx-auto mt-9 text-[1.08rem] leading-[1.9] text-creme-2">
            {isEn
              ? 'There is a force you never see and that, even so, bends almost everything you do. You do not feel it as fear. You feel it as good sense when you do not risk, as responsibility when you stay, as love when you sacrifice yourself. It always has a beautiful name, and that is its greatest talent: passing for virtue so as never to be recognised.'
              : 'Há uma força que nunca vês e que, mesmo assim, curva quase tudo o que fazes. Não a sentes como medo. Sentes-la como bom senso quando não arriscas, como responsabilidade quando ficas, como amor quando te sacrificas. Tem sempre um nome bonito, e é esse o seu maior talento: fazer-se passar por virtude para não ser reconhecida.'}
          </p>
        </header>

        <Sep />

        {/* A PERGUNTA */}
        <section className="text-center max-w-[620px] mx-auto my-12">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-6">
            {isEn ? 'The question the book asks' : 'A pergunta que o livro faz'}
          </p>
          <p className="font-serif italic font-light text-ambar text-[clamp(1.3rem,4vw,1.7rem)] leading-[1.4]">
            {isEn
              ? 'How much of what you call your personality is, in the end, an adaptation to fear?'
              : 'Quanto daquilo a que chamas a tua personalidade é, afinal, uma adaptação ao medo?'}
          </p>
        </section>

        <Sep />

        {/* O QUE É: ver, não vencer */}
        <section className="max-w-[600px] mx-auto my-12 text-center">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-6">
            {isEn ? 'What it is' : 'O que é'}
          </p>
          <p className="text-[1.05rem] leading-[1.9] text-creme-2">
            {isEn
              ? 'This is not a book about conquering fear. To conquer presupposes an enemy on the outside, and fear is not in front of you like an obstacle: it is beneath you, like the ground, so present that you stopped noticing it. It does not organise only the moments when you tremble. It organises the whole days in which you feel perfectly calm and, even so, always choose the known over the possible. '
              : 'Não é um livro para venceres o medo. Vencer pressupõe um inimigo lá fora, e o medo não está à tua frente como um obstáculo: está por baixo de ti, como o chão, tão presente que deixaste de o notar. Não organiza só os momentos em que tremes. Organiza os dias inteiros em que te sentes perfeitamente calma e, no entanto, escolhes sempre o conhecido em vez do possível. '}
            <strong className="text-ambar font-normal">
              {isEn
                ? 'Seeing is the one thing fear does not know how to do to itself, and that is why it lasts so long.'
                : 'Ver é a única coisa que o medo não sabe fazer de si próprio, e é por isso que dura tanto.'}
            </strong>
          </p>
        </section>

        <Sep />

        {/* AS SETE FACES */}
        <section className="max-w-[560px] mx-auto my-12">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-9 text-center">
            {isEn ? 'The seven faces' : 'As sete faces'}
          </p>
          <ol className="space-y-5">
            {FACES.map((f, i) => {
              const [medo, simbolo] = isEn ? f.en : f.pt;
              const raiz = i === FACES.length - 1;
              return (
                <li key={i} className="flex items-baseline gap-4">
                  <span className="font-sans text-[0.72rem] tracking-[0.14em] text-ocre/60 w-7 shrink-0 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="font-serif text-creme text-[1.18rem]">{simbolo}</span>
                    <span className="font-serif italic text-creme-2/55 text-[0.98rem]">{'  ·  '}{medo}</span>
                    {raiz && (
                      <span className="font-sans text-[0.6rem] tracking-[0.2em] uppercase text-ambar/80 ml-3 align-middle">
                        {isEn ? 'the root' : 'a raiz'}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="text-center text-creme-2/55 text-[0.92rem] italic font-serif leading-relaxed mt-9">
            {isEn
              ? 'Six faces you learned to call by other names, and a seventh that generates them all: the fear of separating, of ceasing to belong, of ceasing to be.'
              : 'Seis faces que aprendeste a chamar por outros nomes, e uma sétima que as gera a todas: o receio de te separares, de deixares de pertencer, de deixares de ser.'}
          </p>
        </section>

        <Sep />

        {/* AMOSTRA */}
        <section className="max-w-[620px] mx-auto my-12 text-center">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-8">
            {isEn ? 'A taste' : 'Uma amostra'}
          </p>
          <div className="font-serif font-light text-creme-2 text-[1.18rem] leading-[1.9] space-y-9">
            <p>
              {isEn ? 'It is not an overreaction. It is memory.' : 'Não é exagero. É memória.'}
            </p>
            <p className="text-ambar">
              {isEn
                ? 'The wave does not die when it falls. It returns to what it was always made of.'
                : 'A onda não morre quando baixa. Regressa àquilo de que sempre foi feita.'}
            </p>
          </div>
        </section>

        <Sep />

        {/* FECHO (sem preço: o lançamento é dela) */}
        <section className="max-w-[480px] mx-auto my-12 text-center">
          <p className="font-sans text-[0.7rem] tracking-[0.28em] uppercase text-salvia/80 mb-4">
            {isEn ? 'Coming soon' : 'Brevemente'}
          </p>
          <p className="max-w-[600px] mx-auto text-center text-creme-2/60 text-[0.95rem] italic font-serif leading-relaxed">
            {isEn
              ? 'These pages promise you no courage. They offer you sight. Do not read to correct yourself. Read to see yourself. By Vivianne dos Santos.'
              : 'Estas páginas não te prometem coragem. Propõem-te ver. Não leias para te corrigires. Lê para te veres. Por Vivianne dos Santos.'}
          </p>
        </section>

        <Sep />
        <Footer />
      </div>
    </>
  );
}
