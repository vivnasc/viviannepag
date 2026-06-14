import { setRequestLocale } from 'next-intl/server';

export const revalidate = 60;
import { LangToggle } from '@/components/LangToggle';
import { TopNav } from '@/components/TopNav';
import { MetodoHero } from '@/components/home/MetodoHero';
import { MetodoResumo } from '@/components/home/MetodoResumo';
import { Respira } from '@/components/home/Respira';
import { Mundos } from '@/components/home/Mundos';
import { Sobre } from '@/components/home/Sobre';
import { EscritosRecentes } from '@/components/home/EscritosRecentes';
import { Newsletter } from '@/components/home/Newsletter';
import { Footer } from '@/components/home/Footer';
import type { Locale } from '@/lib/escritos';

const CAPA_BASE = `${(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '')}/storage/v1/object/public/viviannepag-assets/livro-pilar/os-7-veus/capa-composta.png`;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const capa = `${CAPA_BASE}?v=${Date.now()}`;

  return (
    <>
      <TopNav />
      <LangToggle />
      <div className="relative z-[2] max-w-wrap mx-auto px-7">
        {/* O método é o herói: a porta de entrada da marca */}
        <MetodoHero locale={locale} capa={capa} />
        <div className="veu my-16" />
        <MetodoResumo locale={locale} />
        <div className="veu my-16" />
        <Respira />
        <div className="veu my-16" />
        {/* Quem está por trás do método */}
        <Sobre />
        <div className="veu my-16" />
        {/* Os outros mundos (apps), agora secundários */}
        <Mundos />
        <div className="veu my-16" />
        <EscritosRecentes locale={locale as Locale} />
        <div className="veu my-16" />
        <Newsletter />
        <div className="veu my-16" />
        <Footer />
      </div>
    </>
  );
}
