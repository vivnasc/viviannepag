import Link from 'next/link';
import { CapaImg } from '@/components/home/CapaImg';

// Referência na home ao livro "As Sete Faces do Medo". NÃO é o Método VS nem A
// Grande Transição: livro à parte, com identidade própria, mas o mesmo
// tratamento visual dos cartões dos livros. Aponta para a landing, não repete.

const SUPA = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
const capa = (isEn: boolean) =>
  `${SUPA}/storage/v1/object/public/viviannepag-assets/livro-medo/capa-propria${isEn ? '-en' : ''}.png`;

export function LivroMedoHome({ locale }: { locale: string }) {
  const isEn = locale === 'en';
  const base = isEn ? '/en' : '';
  const href = `${base}/as-sete-faces-do-medo`;
  const v = Date.now();

  return (
    <section className="max-w-[820px] mx-auto">
      <p className="rv text-center font-sans text-[0.72rem] tracking-[0.32em] uppercase text-ocre mb-3">
        {isEn ? 'Seven faces, one root' : 'Sete faces, uma raiz'}
      </p>
      <h2 className="rv text-center font-serif font-light text-creme text-[clamp(1.7rem,5vw,2.4rem)] leading-[1.2] mb-12">
        {isEn ? 'A new book' : 'Um livro novo'}
      </h2>

      <div className="rv grid grid-cols-[210px_1fr] gap-10 items-center max-[620px]:grid-cols-1 max-[620px]:text-center max-[620px]:gap-7">
        <Link href={href} className="block no-underline mx-auto">
          <CapaImg
            src={`${capa(isEn)}?v=${v}`}
            alt={isEn ? 'The Seven Faces of Fear' : 'As Sete Faces do Medo'}
            className="w-[210px] h-auto rounded-[10px] border border-ocre/30 block object-cover"
            style={{ boxShadow: '0 22px 60px -28px rgba(0,0,0,0.7)', aspectRatio: '2 / 3' }}
          />
        </Link>
        <div className="text-left max-[620px]:text-center">
          <p className="font-sans text-[0.7rem] tracking-[0.3em] uppercase text-ocre mb-3">
            {isEn ? 'The book' : 'O livro'}
          </p>
          <h3 className="font-serif font-light text-[clamp(1.5rem,4vw,2.1rem)] leading-[1.14] text-creme mb-3">
            {isEn ? 'The Seven Faces of Fear' : 'As Sete Faces do Medo'}
          </h3>
          <p className="font-serif italic text-ocre text-[1.02rem] mb-4">
            {isEn
              ? 'How much of what you call your personality is, in the end, an adaptation to fear?'
              : 'Quanto daquilo a que chamas a tua personalidade é, afinal, uma adaptação ao medo?'}
          </p>
          <p className="text-creme-2 text-[1rem] leading-[1.8] mb-6 max-w-[46ch] max-[620px]:mx-auto">
            {isEn
              ? 'Fear has seven faces you learned to call by other names, and one root that generates them all. Not a book to conquer fear, but to see it: seeing is the one thing fear does not know how to do to itself.'
              : 'O medo tem sete faces que aprendeste a chamar por outros nomes, e uma raiz que as gera a todas. Não é um livro para venceres o medo, é para o veres: ver é a única coisa que o medo não sabe fazer de si próprio.'}
          </p>
          <div className="flex items-center gap-5 max-[620px]:justify-center">
            <Link
              href={href}
              className="inline-block bg-ambar text-[#2A1C12] no-underline rounded-full px-7 py-3 text-[0.92rem] font-sans tracking-[0.02em] hover:bg-ocre transition-colors"
            >
              {isEn ? 'Read the book' : 'Ler o livro'}
            </Link>
            <span className="font-sans text-[0.95rem] text-creme-2">
              <span className="line-through opacity-55 text-[0.85rem] mr-1.5">$25</span>
              <span className="text-creme">$17</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
