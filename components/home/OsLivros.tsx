/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';

// Destaque na home: os DOIS livros, com o mesmo peso.
// O pilar (Os Sete Véus, do Método VS) primeiro, o irmão (Os 7 Sinais de
// Desencaixe) a seguir. A home aponta para cada página; não repete o livro.
// O pilar não pode perder destaque por causa do livro novo.

const SUPA = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
const capaPilar = (isEn: boolean) =>
  `${SUPA}/storage/v1/object/public/viviannepag-assets/livro-pilar/os-7-veus/capa-composta${isEn ? '-en' : ''}.png`;

type Livro = {
  selo: string;
  titulo: string;
  sub: string;
  desc: string;
  capa: string;
  capaRatio: string;
  href: string;
  cta: string;
  preco: React.ReactNode;
};

export function OsLivros({ locale }: { locale: string }) {
  const isEn = locale === 'en';
  const base = isEn ? '/en' : '';

  const livros: Livro[] = [
    {
      selo: isEn ? 'The pillar · Method VS' : 'O pilar · Método VS',
      titulo: isEn ? 'The Seven Veils' : 'Os Sete Véus',
      sub: isEn
        ? 'See what binds you. Release what makes you repeat.'
        : 'Vê o que te prende. Solta o que te faz repetir.',
      desc: isEn
        ? 'The pillar book of Method VS. A crossing through the seven veils that stand between you and who you are, and the simple way to lift them: see, and release.'
        : 'O livro-pilar do Método VS. Uma travessia pelos sete véus que se põem entre ti e quem és, e o caminho simples para os erguer: ver, e soltar.',
      capa: capaPilar(isEn),
      capaRatio: '1400 / 1873',
      href: `${base}/os-sete-veus`,
      cta: isEn ? 'Discover the book' : 'Conhecer o livro',
      preco: <span className="text-creme">€19</span>,
    },
    {
      selo: isEn ? 'New book · a companion to The Seven Veils' : 'Novo livro · irmão de Os Sete Véus',
      titulo: isEn ? 'The Seven Signs of Not Belonging' : 'Os 7 Sinais de Desencaixe',
      sub: isEn
        ? 'On belonging without making yourself smaller'
        : 'O equilíbrio entre pertença e autenticidade',
      desc: isEn
        ? 'The quiet moment when you stop fitting a place that was good, without anything in it having changed, and without anyone having done anything wrong. Not a book about learning to fit in.'
        : 'O momento calado em que deixas de caber num lugar que foi bom, sem que nada nele tenha mudado, e sem que ninguém tenha feito nada de errado. Não é um livro sobre aprender a encaixar.',
      capa: isEn ? '/produtos/os-7-sinais-capa-en.png' : '/produtos/os-7-sinais-capa.png',
      capaRatio: '1600 / 2560',
      href: isEn ? '/en/loja/os-7-sinais' : '/loja/os-7-sinais',
      cta: isEn ? 'Read the book' : 'Ler o livro',
      preco: (
        <>
          <span className="text-creme">€14</span>{' '}
          <span className="line-through opacity-60 text-[0.85rem]">€19</span>
        </>
      ),
    },
  ];

  return (
    <section className="max-w-[820px] mx-auto">
      <p className="rv text-center font-sans text-[0.72rem] tracking-[0.32em] uppercase text-ocre mb-3">
        {isEn ? 'The books' : 'Os livros'}
      </p>
      <h2 className="rv text-center font-serif font-light text-creme text-[clamp(1.7rem,5vw,2.4rem)] leading-[1.2] mb-12">
        {isEn ? 'The pillar and its companion' : 'O pilar e o seu irmão'}
      </h2>

      <div className="flex flex-col gap-14">
        {livros.map((l, idx) => (
          <div
            key={l.href}
            className={`rv grid grid-cols-[210px_1fr] gap-10 items-center max-[620px]:grid-cols-1 max-[620px]:text-center max-[620px]:gap-7 ${
              idx % 2 === 1 ? 'max-[620px]:flex-col' : ''
            }`}
          >
            <Link
              href={l.href}
              className={`block no-underline mx-auto ${idx % 2 === 1 ? 'sm:order-2' : ''}`}
            >
              <img
                src={l.capa}
                alt={l.titulo}
                className="w-[210px] h-auto rounded-[10px] border border-ocre/30 block"
                style={{ boxShadow: '0 22px 60px -28px rgba(0,0,0,0.7)', aspectRatio: l.capaRatio }}
              />
            </Link>
            <div className={`text-left max-[620px]:text-center ${idx % 2 === 1 ? 'sm:order-1' : ''}`}>
              <p className="font-sans text-[0.7rem] tracking-[0.3em] uppercase text-ocre mb-3">
                {l.selo}
              </p>
              <h3 className="font-serif font-light text-[clamp(1.5rem,4vw,2.1rem)] leading-[1.14] text-creme mb-3">
                {l.titulo}
              </h3>
              <p className="font-serif italic text-ocre text-[1.02rem] mb-4 whitespace-pre-line">
                {l.sub}
              </p>
              <p className="text-creme-2 text-[1rem] leading-[1.8] mb-6 max-w-[46ch] max-[620px]:mx-auto">
                {l.desc}
              </p>
              <div className="flex items-center gap-5 max-[620px]:justify-center">
                <Link
                  href={l.href}
                  className="inline-block bg-ambar text-[#2A1C12] no-underline rounded-full px-7 py-3 text-[0.92rem] font-sans tracking-[0.02em] hover:bg-ocre transition-colors"
                >
                  {l.cta}
                </Link>
                <span className="font-sans text-[0.95rem] text-creme-2">{l.preco}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
