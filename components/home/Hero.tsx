import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { GotaAssina } from '../icons/GotaAssina';

export function Hero() {
  const t = useTranslations('hero');
  return (
    <header className="pt-20 pb-15 text-center">
      <Image
        src="/vivianne-1.jpg"
        alt={t('nome')}
        width={644}
        height={1280}
        priority
        className="w-[220px] h-auto rounded-[28px] mx-auto mb-8 object-cover border border-ocre block"
        style={{
          boxShadow:
            '0 0 0 6px rgba(184,132,61,0.10), 0 20px 60px -20px rgba(0,0,0,0.6)',
          aspectRatio: '644 / 1280',
        }}
      />
      <h1 className="font-serif font-light text-[clamp(2.6rem,8vw,4.4rem)] leading-[1.05] tracking-[-0.01em] text-creme">
        {t('nome')}
      </h1>
      <p className="font-serif italic font-light text-ocre text-[clamp(1.05rem,3.4vw,1.35rem)] mt-[18px]">
        {t('sub')}
      </p>
      <GotaAssina className="w-[76px] h-[76px] mx-auto mt-7 opacity-95 block" />
      <p className="rv max-w-[540px] mx-auto mt-12 text-[1.08rem] text-creme-2">
        {t('tese')}{' '}
        <strong className="text-ambar font-normal">{t('teseDestaque')}</strong>
      </p>
    </header>
  );
}
