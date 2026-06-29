import { setRequestLocale } from 'next-intl/server';

export const revalidate = 60;
import { LangToggle } from '@/components/LangToggle';
import { TopNav } from '@/components/TopNav';
import { MetodoHero } from '@/components/home/MetodoHero';
import { MetodoMovimentos } from '@/components/home/MetodoMovimentos';
import { OsLivros } from '@/components/home/OsLivros';
import { Sobre } from '@/components/home/Sobre';
import { EscritosRecentes } from '@/components/home/EscritosRecentes';
import { Newsletter } from '@/components/home/Newsletter';
import { Footer } from '@/components/home/Footer';
import type { Locale } from '@/lib/escritos';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <TopNav />
      <LangToggle />
      <div className="relative z-[2] max-w-wrap mx-auto px-7">
        {/* A Vivianne (rosto) + o Método VS; aponta para o livro, não o repete */}
        <MetodoHero locale={locale} />
        <div className="veu my-16" />
        {/* O método em três movimentos (ver/vir/viver), apresentado, não só citado */}
        <MetodoMovimentos locale={locale} />
        <div className="veu my-16" />
        {/* Os dois livros, com o mesmo peso: o pilar (Os Sete Véus) e o irmão
            (Os 7 Sinais de Desencaixe). O pilar não perde destaque. */}
        <OsLivros locale={locale} />
        <div className="veu my-16" />
        {/* Quem está por trás do método */}
        <Sobre />
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
