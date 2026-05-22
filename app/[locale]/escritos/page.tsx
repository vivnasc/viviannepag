import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LangToggle } from '@/components/LangToggle';
import { TopNav } from '@/components/TopNav';
import { listEscritos, formatarData, type Locale } from '@/lib/escritos';
import { GotaMini } from '@/components/icons/GotaAssina';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'escritos' });
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://viviannedossantos.com';
  const path = locale === 'en' ? '/en/escritos' : '/escritos';
  return {
    title: `${t('todosTitulo')} · Vivianne dos Santos`,
    description: t('todosSub'),
    alternates: {
      canonical: `${url}${path}`,
      languages: {
        pt: `${url}/escritos`,
        en: `${url}/en/escritos`,
      },
    },
  };
}

export default async function EscritosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('escritos');
  const escritos = await listEscritos(locale as Locale);

  return (
    <>
      <TopNav />
      <LangToggle />
      <main className="relative z-[2] max-w-wrap mx-auto px-7 pt-24 pb-20">
        <header className="text-center mb-16">
          <p className="text-[0.78rem] tracking-[0.32em] uppercase text-ocre mb-4">
            {t('eyebrow')}
          </p>
          <h1 className="font-serif font-light text-creme text-[clamp(2.4rem,7vw,3.8rem)] leading-[1.05] tracking-[-0.01em] mb-5">
            {t('todosTitulo')}
          </h1>
          <p className="font-serif italic text-creme-2 text-[clamp(1rem,3vw,1.18rem)] max-w-[480px] mx-auto">
            {t('todosSub')}
          </p>
          <GotaMini className="w-[28px] h-[28px] mx-auto mt-7 opacity-60 block" />
        </header>

        {escritos.length === 0 ? (
          <p className="text-center text-creme-2/70 italic font-serif">
            {t('vazio')}
          </p>
        ) : (
          <ul className="max-w-[640px] mx-auto space-y-12">
            {escritos.map((e) => {
              const href =
                locale === 'en' ? `/en/escritos/${e.slug}` : `/escritos/${e.slug}`;
              return (
                <li key={e.slug} className="border-b border-ocre/15 pb-12 last:border-b-0">
                  <Link href={href} className="block group no-underline">
                    <p className="text-[0.72rem] tracking-[0.24em] uppercase text-ocre/70 mb-3">
                      {formatarData(e.data, locale as Locale)}
                      {e.isFallback && locale === 'en' && (
                        <span className="ml-3 normal-case tracking-normal italic font-serif text-ocre/60 text-[0.78rem]">
                          · {t('noticeEn')}
                        </span>
                      )}
                    </p>
                    <h2 className="font-serif font-light text-creme text-[clamp(1.6rem,4vw,2.1rem)] leading-[1.15] mb-3 group-hover:text-ambar transition-colors">
                      {e.titulo}
                    </h2>
                    <p className="text-creme-2 text-[1.02rem] leading-[1.65] max-w-[560px]">
                      {e.resumo}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div className="text-center mt-20">
          <Link
            href="/"
            className="text-ocre no-underline border-b border-ocre/40 hover:border-ambar hover:text-ambar transition-colors text-[0.9rem] tracking-[0.04em] pb-0.5"
          >
            ← {locale === 'en' ? 'back to the beginning' : 'voltar ao início'}
          </Link>
        </div>
      </main>
    </>
  );
}
