import Link from 'next/link';
import { CapaImg } from '@/components/home/CapaImg';

// Referência na home ao livro "A Grande Transição" (Ciências da Consciência
// Emergente). NÃO é o Método VS: tem secção e identidade próprias, mas o mesmo
// tratamento visual dos cartões dos livros. Aponta para a landing, não repete.

const SUPA = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
const capa = (isEn: boolean) =>
  `${SUPA}/storage/v1/object/public/viviannepag-assets/livro-transicao/capa-propria${isEn ? '-en' : ''}.png`;

export function LivroTransicaoHome({ locale }: { locale: string }) {
  const isEn = locale === 'en';
  const base = isEn ? '/en' : '';
  const href = `${base}/a-grande-transicao`;
  const v = Date.now();

  return (
    <section className="max-w-[820px] mx-auto">
      <p className="rv text-center font-sans text-[0.72rem] tracking-[0.32em] uppercase text-ocre mb-3">
        {isEn ? 'Sciences of Emerging Consciousness' : 'Ciências da Consciência Emergente'}
      </p>
      <h2 className="rv text-center font-serif font-light text-creme text-[clamp(1.7rem,5vw,2.4rem)] leading-[1.2] mb-12">
        {isEn ? 'A different book' : 'Um livro à parte'}
      </h2>

      <div className="rv grid grid-cols-[210px_1fr] gap-10 items-center max-[620px]:grid-cols-1 max-[620px]:text-center max-[620px]:gap-7">
        <Link href={href} className="block no-underline mx-auto">
          <CapaImg
            src={`${capa(isEn)}?v=${v}`}
            alt={isEn ? 'The Great Transition' : 'A Grande Transição'}
            className="w-[210px] h-auto rounded-[10px] border border-ocre/30 block object-cover"
            style={{ boxShadow: '0 22px 60px -28px rgba(0,0,0,0.7)', aspectRatio: '2 / 3' }}
          />
        </Link>
        <div className="text-left max-[620px]:text-center">
          <p className="font-sans text-[0.7rem] tracking-[0.3em] uppercase text-ocre mb-3">
            {isEn ? 'The book' : 'O livro'}
          </p>
          <h3 className="font-serif font-light text-[clamp(1.5rem,4vw,2.1rem)] leading-[1.14] text-creme mb-3">
            {isEn ? 'The Great Transition' : 'A Grande Transição'}
          </h3>
          <p className="font-serif italic text-ocre text-[1.02rem] mb-4">
            {isEn
              ? 'What if much of what you call your nature is only the season you live in?'
              : 'E se grande parte do que chamas a tua natureza for só a estação em que vives?'}
          </p>
          <p className="text-creme-2 text-[1rem] leading-[1.8] mb-6 max-w-[46ch] max-[620px]:mx-auto">
            {isEn
              ? 'Not a self-help book. The investigation of a hypothesis at the scale of the species: much of what we call human nature may be history, adaptation to millennia of scarcity, and not destiny.'
              : 'Não é um livro de melhoria pessoal. É a investigação de uma hipótese à escala da espécie: grande parte daquilo a que chamamos natureza humana talvez seja história, adaptação a milénios de escassez, e não destino.'}
          </p>
          <div className="flex items-center gap-5 max-[620px]:justify-center">
            <Link
              href={href}
              className="inline-block bg-ambar text-[#2A1C12] no-underline rounded-full px-7 py-3 text-[0.92rem] font-sans tracking-[0.02em] hover:bg-ocre transition-colors"
            >
              {isEn ? 'Discover the book' : 'Conhecer o livro'}
            </Link>
            <span className="font-sans text-[0.95rem] text-creme-2">
              <span className="line-through opacity-55 text-[0.85rem] mr-1.5">$35</span>
              <span className="text-creme">$27</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
