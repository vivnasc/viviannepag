import { setRequestLocale } from 'next-intl/server';
import { TopNav } from '@/components/TopNav';
import { RomanceGate } from '@/components/romance/RomanceGate';
import { AMOSTRA_AMPARO } from '@/lib/romance-amostra';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const CAPA_URL = `${(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '')}/storage/v1/object/public/viviannepag-assets/romances/rom-01-amparo/capa-composta-pt.png`;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? "Amparo's Hands — a novel of Véspera (free)" : 'As Mãos de Amparo — um romance de Véspera (oferta)',
    description: isEn
      ? 'Read the first chapter freely. If it stays with you, the whole novel is a gift.'
      : 'Lê o primeiro capítulo sem pedir nada. Se ficar contigo, o romance inteiro é oferta.',
    openGraph: { images: [CAPA_URL] },
  };
}

export default async function AmparoLanding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEn = locale === 'en';
  const A = isEn ? AMOSTRA_AMPARO.en : AMOSTRA_AMPARO.pt;

  const paragrafos = (s: string) => s.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

  return (
    <main className="min-h-screen">
      <TopNav />

      {/* CAPA + PITCH */}
      <section className="max-w-[920px] mx-auto px-6 pt-14 pb-10 flex flex-col md:flex-row items-center gap-10">
        <div className="shrink-0 w-[220px] md:w-[260px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CAPA_URL} alt={isEn ? "Amparo's Hands cover" : 'Capa de As Mãos de Amparo'} className="rounded-[10px] shadow-2xl border border-ocre/20" />
        </div>
        <div className="text-center md:text-left">
          <p className="text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-3">
            {isEn ? 'The Véspera Library · a gift from the house' : 'Biblioteca de Véspera · oferta da casa'}
          </p>
          <h1 className="font-serif font-light text-creme text-4xl md:text-5xl leading-[1.1] mb-4">
            {isEn ? <>Amparo&rsquo;s Hands</> : <>As Mãos de Amparo</>}
          </h1>
          <p className="font-serif italic text-creme-2/80 text-lg leading-relaxed mb-5">
            {isEn
              ? 'For thirty-six years, Amparo has caught her son before every fall. This is the year she learns that hands can also rest.'
              : 'Há trinta e seis anos que Amparo apanha o filho antes de cada queda. Este é o ano em que aprende que as mãos também se pousam.'}
          </p>
          <p className="text-creme-2/60 text-[0.9rem]">
            {isEn
              ? 'A novel · 12 chapters. Read the first one below, freely. If it stays with you, the whole book is yours.'
              : 'Um romance · 12 capítulos. Lê o primeiro aqui em baixo, sem pedir nada. Se ficar contigo, o livro inteiro é teu.'}
          </p>
        </div>
      </section>

      {/* AMOSTRA: ASSENTOS + CAPÍTULO 1, em papel */}
      <section className="max-w-[680px] mx-auto px-6 pb-12">
        <div className="bg-[#FFFDF9] text-[#3D2B1F] rounded-[14px] px-7 md:px-12 py-10 shadow-2xl">
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
            {isEn ? '— end of the sample —' : '— fim da amostra —'}
          </p>
        </div>
      </section>

      {/* GATE */}
      <section className="max-w-[680px] mx-auto px-6 pb-20">
        <div className="border border-ocre/25 rounded-[14px] px-7 py-10">
          <RomanceGate locale={locale} />
        </div>
        <p className="text-center text-creme-2/40 text-[0.75rem] mt-6 font-serif italic">
          {isEn
            ? 'Véspera is a village where the roles that protect us become prisons — and every novel is a road back. Eleven more are on their way.'
            : 'Véspera é uma vila onde os papéis que nos protegem se tornam prisões — e cada romance é um caminho de regresso. Vêm mais onze a caminho.'}
        </p>
      </section>
    </main>
  );
}
