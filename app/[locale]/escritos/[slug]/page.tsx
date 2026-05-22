import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LangToggle } from '@/components/LangToggle';
import {
  getEscrito,
  listAllSlugs,
  formatarData,
  type Locale,
} from '@/lib/escritos';
import { GotaMini } from '@/components/icons/GotaAssina';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const slugs = await listAllSlugs();
  const locales: Locale[] = ['pt', 'en'];
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const escrito = await getEscrito(slug, locale as Locale);
  if (!escrito) return {};
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://viviannedossantos.com';
  const ptPath = `/escritos/${slug}`;
  const enPath = `/en/escritos/${slug}`;
  const path = locale === 'en' ? enPath : ptPath;
  return {
    title: `${escrito.titulo} · Vivianne dos Santos`,
    description: escrito.resumo,
    alternates: {
      canonical: `${url}${path}`,
      languages: {
        pt: `${url}${ptPath}`,
        en: `${url}${enPath}`,
      },
    },
    openGraph: {
      type: 'article',
      title: escrito.titulo,
      description: escrito.resumo,
      url: `${url}${path}`,
      publishedTime: escrito.data,
    },
  };
}

export default async function EscritoPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('escritos');
  const escrito = await getEscrito(slug, locale as Locale);
  if (!escrito) notFound();

  return (
    <>
      <LangToggle />
      <main className="relative z-[2] max-w-[680px] mx-auto px-7 pt-20 pb-24">
        <nav className="mb-12">
          <Link
            href={locale === 'en' ? '/en/escritos' : '/escritos'}
            className="text-ocre/80 no-underline text-[0.82rem] tracking-[0.08em] hover:text-ambar transition-colors"
          >
            ← {t('voltar')}
          </Link>
        </nav>

        <header className="mb-12 text-center">
          <p className="text-[0.72rem] tracking-[0.28em] uppercase text-ocre/70 mb-5">
            {formatarData(escrito.data, locale as Locale)}
          </p>
          <h1 className="font-serif font-light text-creme text-[clamp(2rem,5.5vw,3rem)] leading-[1.1] tracking-[-0.01em] mb-6">
            {escrito.titulo}
          </h1>
          <p className="font-serif italic text-creme-2 text-[clamp(1.05rem,3vw,1.2rem)] leading-[1.5] max-w-[560px] mx-auto">
            {escrito.resumo}
          </p>
          {escrito.isFallback && locale === 'en' && (
            <p className="mt-6 text-ocre/70 text-[0.8rem] tracking-[0.12em] italic font-serif">
              — {t('noticeEn')} —
            </p>
          )}
          <GotaMini className="w-[28px] h-[28px] mx-auto mt-8 opacity-50 block" />
        </header>

        <article
          className="escrito-prose"
          dangerouslySetInnerHTML={{ __html: escrito.conteudoHtml }}
        />

        <div className="text-center mt-20">
          <Link
            href={locale === 'en' ? '/en/escritos' : '/escritos'}
            className="text-ocre no-underline border-b border-ocre/40 hover:border-ambar hover:text-ambar transition-colors text-[0.9rem] tracking-[0.04em] pb-0.5"
          >
            ← {t('voltar')}
          </Link>
        </div>
      </main>
    </>
  );
}
