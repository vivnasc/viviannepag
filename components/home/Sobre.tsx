import Image from 'next/image';
import { useTranslations } from 'next-intl';

export function Sobre() {
  const t = useTranslations('sobre');
  return (
    <section className="rv max-w-[680px] mx-auto grid grid-cols-[200px_1fr] gap-10 items-center text-left max-[560px]:grid-cols-1 max-[560px]:text-center max-[560px]:gap-6">
      <Image
        src="/vivianne-2.jpg"
        alt={t('assina')}
        width={1024}
        height={1280}
        className="w-[200px] h-[260px] object-cover rounded-[14px] border border-ocre/30 max-[560px]:w-[170px] max-[560px]:h-[220px] max-[560px]:mx-auto"
        style={{ objectPosition: '50% 22%' }}
      />
      <div>
        <p className="text-[0.78rem] tracking-[0.32em] uppercase text-ocre mb-[10px] text-left max-[560px]:text-center">
          {t('eyebrow')}
        </p>
        <p className="text-creme-2 mb-4 text-[1.02rem]">{t('p1')}</p>
        <p className="text-creme-2 mb-4 text-[1.02rem]">{t('p2')}</p>
        <p className="text-creme-2 mb-4 text-[1.02rem]">{t('p3')}</p>
        <p className="font-serif italic text-ocre mt-1">{t('assina')}</p>
      </div>
    </section>
  );
}
