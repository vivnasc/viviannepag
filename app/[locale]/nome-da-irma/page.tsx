import { setRequestLocale } from 'next-intl/server';
import { TopNav } from '@/components/TopNav';
import { RomanceCompra } from '@/components/romance/RomanceCompra';
import { romancePdfPronto, romanceCapaUrl } from '@/lib/romance-loja';
import { AMOSTRA_NOME_DA_IRMA } from '@/lib/amostras/nome-da-irma';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? "The Sister's Name · a novel of Véspera" : 'O Nome da Irmã · um romance de Véspera',
    description: isEn
      ? "Eufémia was given her dead sister's name, and with it her sister's life. Read the first chapter here."
      : 'Eufémia recebeu o nome da irmã que morreu, e com ele a vida que era dela. Lê o primeiro capítulo aqui.',
  };
}

export default async function NomeDaIrmaLanding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEn = locale === 'en';
  const am = AMOSTRA_NOME_DA_IRMA;
  const amEn = isEn && !!am.capituloEn;
  const A = {
    titulo: amEn ? am.tituloEn! : am.titulo,
    assentos: amEn ? am.assentosEn! : am.assentos,
    capitulo: amEn ? am.capituloEn! : am.capitulo,
  };
  const pronto = await romancePdfPronto('rom-irma');

  const paragrafos = (s: string) => s.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

  return (
    <main className="min-h-screen">
      <TopNav />

      {/* CAPA TIPOGRÁFICA + PITCH (a capa ilustrada chega com a edição final) */}
      <section className="max-w-[920px] mx-auto px-6 pt-14 pb-10 flex flex-col md:flex-row items-center gap-10">
        <div className="shrink-0 w-[220px] md:w-[260px]">
          {pronto ? (
            // capa composta real (a mesma do render e da biblioteca)
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={romanceCapaUrl('rom-irma', isEn ? 'en' : 'pt') ?? ''}
              alt={isEn ? 'The Sister’s Name' : 'O Nome da Irmã'}
              className="w-full aspect-[2/3] object-cover rounded-[10px] shadow-2xl border border-ambar/40"
            />
          ) : (
            <div className="aspect-[2/3] rounded-[10px] shadow-2xl border border-ambar/40 bg-terra-2 flex flex-col items-center justify-center px-6 text-center">
              <p className="text-[0.6rem] tracking-[0.3em] uppercase text-ambar/70 mb-4">véspera</p>
              <p className="font-serif font-light text-creme text-2xl leading-snug mb-4">
                {isEn ? <>The Sister&rsquo;s Name</> : <>O Nome da Irmã</>}
              </p>
              <p className="text-[0.66rem] tracking-[0.24em] uppercase text-creme-2/50">Vivianne dos Santos</p>
            </div>
          )}
        </div>
        <div className="text-center md:text-left">
          <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ambar/90 mb-3">
            {isEn ? 'The Véspera Library · novel two' : 'Biblioteca de Véspera · o segundo romance'}
          </p>
          <h1 className="font-serif font-light text-creme text-4xl md:text-5xl leading-[1.1] mb-4">
            {isEn ? <>The Sister&rsquo;s Name</> : <>O Nome da Irmã</>}
          </h1>
          <p className="font-serif italic text-creme-2/80 text-lg leading-relaxed mb-5">
            {isEn
              ? "Eufémia was given her dead sister's name, and with it her sister's life: the course, the promised fiancé, the house on the square. At fifty, emptying her mother's room, she finds the certificate, and realises she never chose anything."
              : 'Eufémia recebeu o nome da irmã que morreu antes de ela nascer, e com o nome recebeu a vida: o curso, o noivo prometido, a casa em frente ao largo. Aos cinquenta anos, ao esvaziar o quarto da mãe, encontra a certidão, e percebe que nunca escolheu nada.'}
          </p>
          <p className="text-creme-2/60 text-[0.9rem]">
            {isEn
              ? (pronto
                  ? 'A novel · 12 chapters, complete. Read the first one below; the whole book is in the shop.'
                  : 'A novel · 12 chapters, complete. Read the first one below. The full book is coming to the shop very soon.')
              : (pronto
                  ? 'Um romance · 12 capítulos, terminado. Lê o primeiro aqui em baixo; o livro inteiro está na loja.'
                  : 'Um romance · 12 capítulos, terminado. Lê o primeiro aqui em baixo. O livro inteiro chega à loja em breve.')}
          </p>
        </div>
      </section>

      {/* AMOSTRA: ASSENTOS + CAPÍTULO 1, em papel */}
      <section className="max-w-[680px] mx-auto px-6 pb-12">
        <div className="bg-[#FFFDF9] text-[#3D2B1F] rounded-[14px] px-7 md:px-12 py-10 shadow-2xl">
          {isEn && !am.capituloEn && (
            <p className="text-center text-[0.78rem] text-[#9A5A43] font-serif italic mb-6">
              The English edition is on its way. Until then, the sample below is in the original Portuguese.
            </p>
          )}
          <p className="text-center text-[0.68rem] tracking-[0.3em] uppercase text-[#7D8A6A] mb-6">
            {isEn ? 'From the register of Véspera' : 'Do registo de Véspera'}
          </p>
          <div className="border-t border-b border-[#7D8A6A]/40 py-6 mb-10">
            {paragrafos(A.assentos).map((p, i) => (
              <p key={i} className="font-serif italic text-[0.92rem] leading-[1.75] text-[#6B5548] text-center mb-3 last:mb-0">{p}</p>
            ))}
          </div>
          <p className="text-center text-[0.68rem] tracking-[0.3em] uppercase text-[#7D8A6A] mb-2">
            {isEn ? 'chapter one' : 'capítulo um'}
          </p>
          <h2 className="font-serif italic text-center text-[#8C4A36] text-2xl mb-8">{A.titulo}</h2>
          <div className="font-serif text-[1.02rem] leading-[1.85]">
            {paragrafos(A.capitulo).map((p, i) => (
              <p key={i} className="mb-4 text-justify" style={{ hyphens: 'auto' }}>{p}</p>
            ))}
          </div>
          <p className="text-center text-[#9A5A43] mt-8 font-serif italic">
            {isEn ? '· end of the sample ·' : '· fim da amostra ·'}
          </p>
        </div>
      </section>

      {/* O RESTO DO LIVRO */}
      <RomanceCompra slug="rom-irma" locale={locale} pronto={pronto} />
    </main>
  );
}
