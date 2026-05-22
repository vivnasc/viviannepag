'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useTransition } from 'react';

export function LangToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('lang');
  const [pending, startTransition] = useTransition();

  function go(next: 'pt' | 'en') {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  const base =
    'px-3 py-1.5 text-[0.72rem] tracking-[0.18em] uppercase font-normal border border-ocre/35 text-creme-2 transition-colors hover:text-creme hover:border-ambar disabled:opacity-60';

  return (
    <nav
      className="fixed top-[18px] right-[20px] z-10 flex font-sans"
      aria-label={t('ariaLabel')}
    >
      <button
        type="button"
        onClick={() => go('pt')}
        disabled={pending}
        aria-pressed={locale === 'pt'}
        className={`${base} rounded-l-[14px] border-r-0 ${
          locale === 'pt' ? 'bg-ocre text-terra border-ocre' : ''
        }`}
      >
        PT
      </button>
      <button
        type="button"
        onClick={() => go('en')}
        disabled={pending}
        aria-pressed={locale === 'en'}
        className={`${base} rounded-r-[14px] ${
          locale === 'en' ? 'bg-ocre text-terra border-ocre' : ''
        }`}
      >
        EN
      </button>
    </nav>
  );
}
