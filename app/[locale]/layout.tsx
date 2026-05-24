import type { Metadata, Viewport } from 'next';
import { Fraunces, Outfit } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#2A1C12',
  width: 'device-width',
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://viviannedossantos.com';
  const verification: Record<string, string> = {};
  if (process.env.GOOGLE_SITE_VERIFICATION) {
    verification.google = process.env.GOOGLE_SITE_VERIFICATION;
  }

  return {
    metadataBase: new URL(url),
    title: t('title'),
    description: t('description'),
    verification,
    alternates: {
      canonical: locale === 'en' ? `${url}/en` : `${url}/`,
      languages: {
        pt: `${url}/`,
        en: `${url}/en`,
        'x-default': `${url}/`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Vivianne dos Santos',
      title: t('ogTitle'),
      description: t('ogDescription'),
      url: '/',
      locale: locale === 'pt' ? 'pt_PT' : 'en_US',
      alternateLocale: locale === 'pt' ? 'en_US' : 'pt_PT',
      images: [
        {
          url: '/vivianne-2.jpg',
          width: 1024,
          height: 1280,
          alt: 'Vivianne dos Santos',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: ['/vivianne-2.jpg'],
    },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
      ],
      apple: '/favicon-180.png',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as 'pt' | 'en')) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://viviannedossantos.com';

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Vivianne dos Santos',
      url,
      image: `${url}/vivianne-2.jpg`,
      jobTitle:
        locale === 'pt'
          ? 'Escritora e terapeuta sistémica em formação'
          : 'Writer and systemic therapist in training',
      sameAs: [
        'https://instagram.com/vivianne.dos.santos',
        'https://instagram.com/freeme_app',
        'https://instagram.com/infonte.app',
        'https://instagram.com/synchim.app',
        'https://instagram.com/escola_dos_veus',
        'https://instagram.com/loranne_music',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Vivianne dos Santos',
      url,
      inLanguage: locale === 'pt' ? 'pt-PT' : 'en',
    },
  ];

  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang={locale} className={`${fraunces.variable} ${outfit.variable}`}>
      <head>
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`,
              }}
            />
          </>
        )}
      </head>
      <body>
        <div className="grain" />
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)e.target.classList.add('in')})},{threshold:0.12});document.querySelectorAll('.rv').forEach(function(el,i){el.style.transitionDelay=(i%4*0.08)+'s';io.observe(el)});setTimeout(function(){document.querySelectorAll('.rv:not(.in)').forEach(function(el){el.classList.add('in')})},2500);})();`,
          }}
        />
      </body>
    </html>
  );
}
