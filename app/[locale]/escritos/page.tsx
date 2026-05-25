import Link from 'next/link';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LangToggle } from '@/components/LangToggle';
import { TopNav } from '@/components/TopNav';
import { listEscritos, formatarData, type Locale, type EscritoMeta } from '@/lib/escritos';
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

function CardEscrito({
  e,
  locale,
  t,
  destaque,
}: {
  e: EscritoMeta;
  locale: string;
  t: (key: string) => string;
  destaque?: boolean;
}) {
  const href = locale === 'en' ? `/en/escritos/${e.slug}` : `/escritos/${e.slug}`;
  const tematicaLabel = e.tematica
    ? t(`tematicas.${e.tematica}` as 'tematicas.o-no')
    : null;

  if (destaque) {
    return (
      <Link href={href} className="block group no-underline mb-16">
        <div className="relative overflow-hidden rounded-[20px] border border-ocre/25">
          {e.capa && (
            <Image
              src={e.capa}
              alt={e.titulo}
              width={1600}
              height={1067}
              priority
              unoptimized={e.capa.endsWith('.svg')}
              className="w-full aspect-[3/2] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-terra/95 via-terra/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-10">
            {tematicaLabel && (
              <p className="text-[0.68rem] tracking-[0.32em] uppercase text-ambar mb-3">
                · {tematicaLabel} ·
              </p>
            )}
            <h2 className="font-serif font-light text-creme text-[clamp(1.8rem,5vw,2.8rem)] leading-[1.1] mb-3 group-hover:text-ambar transition-colors">
              {e.titulo}
            </h2>
            <p className="font-serif italic text-creme-2/90 text-[clamp(0.95rem,2.5vw,1.12rem)] leading-[1.5] max-w-[540px]">
              {e.resumo}
            </p>
            <p className="text-[0.7rem] tracking-[0.2em] uppercase text-ocre/70 mt-4">
              {formatarData(e.data, locale as Locale)}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="block group no-underline">
      <div className="overflow-hidden rounded-[16px] border border-ocre/20 transition-colors group-hover:border-ambar/40">
        {e.capa && (
          <Image
            src={e.capa}
            alt={e.titulo}
            width={800}
            height={533}
            unoptimized={e.capa.endsWith('.svg')}
            className="w-full aspect-[3/2] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        )}
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            {tematicaLabel && (
              <span className="text-[0.64rem] tracking-[0.28em] uppercase text-ambar">
                {tematicaLabel}
              </span>
            )}
            <span className="text-[0.64rem] tracking-[0.18em] uppercase text-ocre/60">
              {formatarData(e.data, locale as Locale)}
            </span>
          </div>
          <h3 className="font-serif font-light text-creme text-[clamp(1.2rem,3vw,1.45rem)] leading-[1.2] mb-2 group-hover:text-ambar transition-colors">
            {e.titulo}
          </h3>
          <p className="text-creme-2/80 text-[0.9rem] leading-[1.55] line-clamp-2">
            {e.resumo}
          </p>
        </div>
      </div>
    </Link>
  );
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

  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://viviannedossantos.com';
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Vivianne dos Santos', item: url },
      {
        '@type': 'ListItem',
        position: 2,
        name: t('todosTitulo'),
        item: `${url}${locale === 'en' ? '/en' : ''}/escritos`,
      },
    ],
  };

  const [destaque, ...resto] = escritos;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <TopNav />
      <LangToggle />
      <main className="relative z-[2] max-w-[960px] mx-auto px-7 pt-24 pb-20">
        <header className="text-center mb-14">
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
          <>
            {destaque && (
              <CardEscrito e={destaque} locale={locale} t={t} destaque />
            )}

            {resto.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {resto.map((e) => (
                  <CardEscrito key={e.slug} e={e} locale={locale} t={t} />
                ))}
              </div>
            )}
          </>
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
