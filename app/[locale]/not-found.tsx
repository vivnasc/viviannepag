import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { GotaMini } from '@/components/icons/GotaAssina';

export default function NotFound() {
  const t = useTranslations('notFound');
  return (
    <main className="relative z-[2] max-w-wrap mx-auto px-7 min-h-[80vh] flex flex-col items-center justify-center text-center">
      <p className="text-[0.78rem] tracking-[0.32em] uppercase text-ocre mb-5">
        {t('eyebrow')}
      </p>
      <h1 className="font-serif font-light text-creme text-[clamp(2rem,6vw,3.2rem)] leading-[1.1] tracking-[-0.01em] mb-5">
        {t('titulo')}
      </h1>
      <p className="font-serif italic text-creme-2 text-[1.05rem] max-w-[480px] mb-8">
        {t('lead')}
      </p>
      <GotaMini className="w-[36px] h-[36px] opacity-50 mb-10" />
      <Link
        href="/"
        className="text-ocre no-underline border-b border-ocre/40 hover:border-ambar hover:text-ambar transition-colors text-[0.95rem] tracking-[0.04em] pb-0.5"
      >
        {t('voltar')}
      </Link>
    </main>
  );
}
