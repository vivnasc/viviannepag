import { useTranslations } from 'next-intl';
import { GotaMini } from '../icons/GotaAssina';

export function Respira() {
  const t = useTranslations();
  return (
    <div className="rv text-center max-w-[520px] mx-auto my-12">
      <p className="font-serif italic font-light text-ambar text-[clamp(1.15rem,3.4vw,1.4rem)] leading-[1.4] tracking-[0.005em]">
        {t('respira')}
      </p>
      <GotaMini className="w-[26px] h-[26px] mx-auto mt-[18px] opacity-60 block" />
    </div>
  );
}
