'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from '@/i18n/routing';
import Link from 'next/link';

export function TopNav() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('nav');

  const inicioHref = locale === 'en' ? '/en' : '/';
  const livroHref = locale === 'en' ? '/en/os-sete-veus' : '/os-sete-veus';
  const escritosHref = locale === 'en' ? '/en/escritos' : '/escritos';
  const lojaHref = locale === 'en' ? '/en/loja' : '/loja';
  const bibliotecaHref = locale === 'en' ? '/en/biblioteca' : '/biblioteca';

  const isInicio = pathname === '/';
  const isEscritos = pathname.startsWith('/escritos');
  const isLoja = pathname.startsWith('/loja');
  const isBiblioteca = pathname.startsWith('/biblioteca');

  const base =
    'text-[0.72rem] tracking-[0.18em] uppercase font-normal text-creme-2 hover:text-ambar transition-colors';
  const active = 'text-ambar';

  return (
    <nav
      className="fixed top-[18px] left-[20px] z-10 flex items-center gap-4 font-sans"
      aria-label={t('ariaLabel')}
    >
      <Link href={inicioHref} className={`${base} ${isInicio ? active : ''}`}>
        {t('inicio')}
      </Link>
      <span className="text-ocre/35 text-[0.6rem]">·</span>
      <Link href={livroHref} className={`${base} text-ambar`}>
        {locale === 'en' ? 'the book' : 'o livro'}
      </Link>
      <span className="text-ocre/35 text-[0.6rem]">·</span>
      <Link href={escritosHref} className={`${base} ${isEscritos ? active : ''}`}>
        {t('escritos')}
      </Link>
      <span className="text-ocre/35 text-[0.6rem]">·</span>
      <Link href={lojaHref} className={`${base} ${isLoja ? active : ''}`}>
        {t('loja')}
      </Link>
      <span className="text-ocre/35 text-[0.6rem]">·</span>
      <Link href={bibliotecaHref} className={`${base} ${isBiblioteca ? active : ''}`}>
        {locale === 'en' ? 'library' : 'biblioteca'}
      </Link>
    </nav>
  );
}
