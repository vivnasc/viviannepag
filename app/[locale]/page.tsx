import { setRequestLocale } from 'next-intl/server';
import { LangToggle } from '@/components/LangToggle';
import { Hero } from '@/components/home/Hero';
import { Respira } from '@/components/home/Respira';
import { Mundos } from '@/components/home/Mundos';
import { Sobre } from '@/components/home/Sobre';
import { Newsletter } from '@/components/home/Newsletter';
import { Footer } from '@/components/home/Footer';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <LangToggle />
      <div className="relative z-[2] max-w-wrap mx-auto px-7">
        <Hero />
        <Respira />
        <Mundos />
        <div className="veu my-16" />
        <Sobre />
        <div className="veu my-16" />
        <Newsletter />
        <div className="veu my-16" />
        <Footer />
      </div>
    </>
  );
}
