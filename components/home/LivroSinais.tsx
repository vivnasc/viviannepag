import Link from 'next/link';
import Image from 'next/image';

// Destaque na home: o livro Os 7 Sinais de Desencaixe (irmão de Os Sete Véus).
// A home aponta para a página de venda; não repete o livro.
export function LivroSinais({ locale }: { locale: string }) {
  const isEn = locale === 'en';
  const href = isEn ? '/en/loja/os-7-sinais' : '/loja/os-7-sinais';

  return (
    <section className="rv max-w-[760px] mx-auto grid grid-cols-[230px_1fr] gap-10 items-center text-left max-[620px]:grid-cols-1 max-[620px]:text-center max-[620px]:gap-7">
      <Link href={href} className="block no-underline mx-auto">
        <Image
          src="/produtos/os-7-sinais-capa.png"
          alt="Os 7 Sinais de Desencaixe"
          width={1600}
          height={2560}
          className="w-[230px] h-auto rounded-[10px] border border-ocre/30 block"
          style={{ boxShadow: '0 22px 60px -28px rgba(0,0,0,0.7)' }}
        />
      </Link>
      <div>
        <p className="font-sans text-[0.72rem] tracking-[0.34em] uppercase text-ocre mb-3">
          {isEn ? 'New book' : 'Novo livro'}
        </p>
        <h2 className="font-serif font-light text-[clamp(1.7rem,4.6vw,2.5rem)] leading-[1.12] text-creme mb-3">
          Os 7 Sinais de Desencaixe
        </h2>
        <p className="font-serif italic text-ocre text-[1.04rem] mb-4">
          {isEn
            ? 'On belonging without making yourself smaller'
            : 'O equilíbrio entre pertença e autenticidade'}
        </p>
        <p className="text-creme-2 text-[1.02rem] leading-[1.8] mb-6 max-w-[44ch] max-[620px]:mx-auto">
          {isEn
            ? 'The quiet moment when you stop fitting a place that was good, without anything in it having changed, and without anyone having done anything wrong. Not a book about learning to fit in.'
            : 'O momento calado em que deixas de caber num lugar que foi bom, sem que nada nele tenha mudado, e sem que ninguém tenha feito nada de errado. Não é um livro sobre aprender a encaixar.'}
        </p>
        <div className="flex items-center gap-5 max-[620px]:justify-center">
          <Link
            href={href}
            className="inline-block bg-ambar text-[#2A1C12] no-underline rounded-full px-7 py-3 text-[0.92rem] font-sans tracking-[0.02em] hover:bg-ocre transition-colors"
          >
            {isEn ? 'Read the book' : 'Ler o livro'}
          </Link>
          <span className="font-sans text-[0.95rem] text-creme-2">
            <span className="text-creme">€14</span>{' '}
            <span className="line-through opacity-60 text-[0.85rem]">€19</span>
          </span>
        </div>
      </div>
    </section>
  );
}
