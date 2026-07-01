import { setRequestLocale } from 'next-intl/server';
import { TopNav } from '@/components/TopNav';
import { LangToggle } from '@/components/LangToggle';
import { Footer } from '@/components/home/Footer';
import { BotaoCompra } from '@/components/BotaoCompra';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const SUPA = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
const CAPA = `${SUPA}/storage/v1/object/public/viviannepag-assets/livro-transicao/capa-propria.png`;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn
      ? 'The Great Transition · Vivianne dos Santos'
      : 'A Grande Transição · Vivianne dos Santos',
    description: isEn
      ? 'What if much of what you call "human nature" is only the season you live in? An introduction to the Sciences of Emerging Consciousness.'
      : 'E se grande parte do que chamas "natureza humana" for só a estação em que vives? Introdução às Ciências da Consciência Emergente.',
    openGraph: { images: [CAPA] },
  };
}

// o olho do livro (o mesmo emblema da carta de 2150) e os três pontos da
// Transição: sobrevivência (cheio) -> fissura (meio) -> emergência (vazio).
function Olho({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 140" fill="none" className={className} aria-hidden>
      <path d="M20 70 Q60 20 120 20 Q180 20 220 70 Q180 120 120 120 Q60 120 20 70 Z" stroke="currentColor" strokeWidth="3" />
      <circle cx="120" cy="70" r="28" stroke="currentColor" strokeWidth="3" />
      <circle cx="120" cy="70" r="42" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="120" cy="70" r="9" fill="currentColor" />
      <line x1="120" y1="12" x2="120" y2="0" stroke="currentColor" strokeWidth="2" />
      <line x1="120" y1="140" x2="120" y2="128" stroke="currentColor" strokeWidth="2" />
      <line x1="0" y1="70" x2="12" y2="70" stroke="currentColor" strokeWidth="2" />
      <line x1="228" y1="70" x2="240" y2="70" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function Travessia({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 40" fill="none" className={className} aria-hidden>
      <line x1="104" y1="20" x2="146" y2="20" stroke="currentColor" strokeWidth="1.5" />
      <line x1="154" y1="20" x2="196" y2="20" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="100" cy="20" r="7" fill="currentColor" />
      <circle cx="150" cy="20" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="200" cy="20" r="7" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.55" />
    </svg>
  );
}

const Sep = () => <div className="h-px bg-ocre/20 max-w-[110px] mx-auto my-16" />;

export default async function AGrandeTransicao({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEn = locale === 'en';
  const capa = `${CAPA}?v=${Date.now()}`;

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
            alt={isEn ? 'The Great Transition' : 'A Grande Transição'}
            className="w-[270px] h-auto rounded-[16px] mx-auto mb-10 block border border-ocre"
            style={{ boxShadow: '0 0 0 6px rgba(184,132,61,0.10), 0 24px 70px -24px rgba(0,0,0,0.7)', aspectRatio: '2 / 3' }}
          />
          <p className="font-sans text-[0.7rem] tracking-[0.34em] uppercase text-salvia mb-5">
            {isEn ? 'Sciences of Emerging Consciousness' : 'Ciências da Consciência Emergente'}
          </p>
          <h1 className="font-serif font-light text-[clamp(2.6rem,8vw,4.4rem)] leading-[1.04] tracking-[-0.01em] text-creme">
            {isEn ? 'The Great Transition' : 'A Grande Transição'}
          </h1>
          <p className="font-serif italic font-light text-ocre text-[clamp(1.1rem,3.6vw,1.5rem)] mt-5 leading-[1.4]">
            {isEn
              ? 'What if much of what you call your nature is only the season you live in?'
              : 'E se grande parte do que chamas a tua natureza for só a estação em que vives?'}
          </p>
          <Olho className="w-[76px] h-auto mx-auto mt-9 text-ocre/90" />
          <p className="max-w-[580px] mx-auto mt-9 text-[1.08rem] leading-[1.9] text-creme-2">
            {isEn
              ? 'A future civilisation looks back at our time and gives us what we could not see from within: that the harshness with which we treated life was not our nature, it was the season we lived in, and that, without knowing it, we had already begun to cross a threshold.'
              : 'Uma civilização futura olha para o nosso tempo e devolve-nos aquilo que não conseguíamos ver de dentro: que a dureza com que tratávamos a vida não era a nossa natureza, era a estação em que vivíamos, e que, sem o sabermos, já tínhamos começado a atravessar um limiar.'}
          </p>
          <p className="font-sans text-[0.78rem] tracking-[0.12em] text-creme-2/45 mt-6">
            {isEn ? 'Immediate PDF · €19' : 'PDF imediato · €19'}
          </p>
        </header>

        <Sep />

        {/* A PERGUNTA */}
        <section className="text-center max-w-[600px] mx-auto my-12">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-6">
            {isEn ? 'The question the book asks' : 'A pergunta que o livro faz'}
          </p>
          <p className="font-serif italic font-light text-ambar text-[clamp(1.3rem,4vw,1.7rem)] leading-[1.4]">
            {isEn
              ? 'What is a human being when it no longer needs to live in a state of threat?'
              : 'O que é o ser humano quando deixa de precisar de viver em estado de ameaça?'}
          </p>
        </section>

        <Sep />

        {/* O QUE É / NÃO É */}
        <section className="max-w-[600px] mx-auto my-12 text-center">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-6">
            {isEn ? 'What it is' : 'O que é'}
          </p>
          <p className="text-[1.05rem] leading-[1.9] text-creme-2">
            {isEn
              ? 'This is not a self-help book. It is the investigation of a hypothesis at the scale of the species: much of what we call human nature, the vigilance, the hurry, the hunger to accumulate, the guilt of resting, may be history, adaptation to millennia of scarcity, and not destiny. '
              : 'Não é um livro de melhoria pessoal. É a investigação de uma hipótese à escala da espécie: grande parte daquilo a que chamamos natureza humana, a vigilância, a pressa, a fome de acumular, a culpa de descansar, talvez seja história, adaptação a milénios de escassez, e não destino. '}
            <strong className="text-ambar font-normal">
              {isEn ? 'What was learned can be relearned otherwise.' : 'O que foi aprendido pode ser reaprendido de outro modo.'}
            </strong>
          </p>
        </section>

        <Sep />

        {/* A TRAVESSIA */}
        <section className="max-w-[600px] mx-auto my-12 text-center">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-7">
            {isEn ? 'The crossing' : 'A travessia'}
          </p>
          <Travessia className="w-[220px] h-auto mx-auto mb-7 text-ocre" />
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              [isEn ? 'Survival' : 'Sobrevivência', isEn ? 'living not to die' : 'viver para não morrer'],
              [isEn ? 'Fissure' : 'Fissura', isEn ? 'loss and possibility' : 'perda e possibilidade'],
              [isEn ? 'Emergence' : 'Emergência', isEn ? 'to create and to mean' : 'criar e significar'],
            ].map(([t, s], i) => (
              <div key={i}>
                <p className="font-sans text-[0.64rem] tracking-[0.2em] uppercase text-ocre/85">{t}</p>
                <p className="font-serif italic text-creme-2/70 text-[0.9rem] mt-1.5 leading-snug">{s}</p>
              </div>
            ))}
          </div>
        </section>

        <Sep />

        {/* AMOSTRA (destaques do livro) */}
        <section className="max-w-[620px] mx-auto my-12 text-center">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-8">
            {isEn ? 'A taste' : 'Uma amostra'}
          </p>
          <div className="font-serif font-light text-creme-2 text-[1.18rem] leading-[1.9] space-y-9">
            <p>
              {isEn
                ? 'Much of what we call human nature may be no nature at all. It may be history.'
                : 'Grande parte daquilo a que chamamos natureza humana talvez não seja natureza nenhuma. Talvez seja história.'}
            </p>
            <p className="text-ambar">
              {isEn ? 'None of this began in you. It reached you, inherited.' : 'Nada disto começou em ti. Chegou a ti, herdado.'}
            </p>
          </div>
        </section>

        <Sep />

        {/* COMPRA */}
        <section className="max-w-[440px] mx-auto my-12 text-center">
          <h2 className="font-serif font-light text-creme text-[clamp(1.6rem,5vw,2.1rem)] leading-tight mb-3">
            {isEn ? 'Take the book home' : 'Leva o livro contigo'}
          </h2>
          <p className="text-creme-2/65 text-[0.95rem] leading-relaxed mb-8">
            {isEn ? 'Immediate PDF, yours to keep and return to. €19.' : 'PDF imediato, teu para guardar e voltar. €19.'}
          </p>
          <BotaoCompra
            slug="a-grande-transicao"
            locale={locale}
            titulo={isEn ? 'The Great Transition' : 'A Grande Transição'}
            preco="€19"
          />
        </section>

        <p className="max-w-[600px] mx-auto pb-4 text-center text-creme-2/45 text-[0.85rem] italic font-serif leading-relaxed">
          {isEn
            ? 'These pages promise nothing. They offer a change of light over the present, so that certain pains stop looking like personal failings and reveal themselves as the mark of an age that lasted too long. By Vivianne dos Santos.'
            : 'Estas páginas não prometem nada. Propõem uma mudança de luz sobre o presente, para que certas dores deixem de parecer falhas pessoais e se revelem como a marca de uma época que se prolongou demais. Por Vivianne dos Santos.'}
        </p>

        <Sep />
        <Footer />
      </div>
    </>
  );
}
