import { setRequestLocale } from 'next-intl/server';
import { TopNav } from '@/components/TopNav';
import { LangToggle } from '@/components/LangToggle';
import { Footer } from '@/components/home/Footer';
import { GotaAssina } from '@/components/icons/GotaAssina';
import { DiagnosticoQuiz } from '@/components/DiagnosticoQuiz';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'Which is your first movement? · Method VS' : 'Qual é o teu primeiro movimento? · Método VS',
    description: isEn ? 'A short diagnostic that points you to where to begin: see, come, or live.' : 'Um diagnóstico curto que te aponta por onde começar: ver, vir ou viver.',
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEn = locale === 'en';
  return (
    <>
      <TopNav />
      <LangToggle />
      <div className="relative z-[2] max-w-wrap mx-auto px-7">
        <header className="pt-24 pb-8 text-center">
          <p className="font-sans text-[0.7rem] tracking-[0.34em] uppercase text-salvia mb-4">{isEn ? 'Method VS · See and Release' : 'Método VS · Ver e Soltar'}</p>
          <h1 className="font-serif font-light text-[clamp(2.2rem,6vw,3.4rem)] leading-[1.08] text-creme">{isEn ? 'Where do you begin?' : 'Por onde começas?'}</h1>
          <p className="font-serif italic font-light text-ocre text-[clamp(1.05rem,3.4vw,1.3rem)] mt-4">{isEn ? 'See, come, live. Find your first movement.' : 'Ver, vir, viver. Descobre o teu primeiro movimento.'}</p>
          <GotaAssina className="w-[56px] h-[56px] mx-auto mt-7 opacity-95 block" />
        </header>
        <section className="pb-10"><DiagnosticoQuiz locale={locale} /></section>
        <div className="veu my-14" />
        <Footer />
      </div>
    </>
  );
}
