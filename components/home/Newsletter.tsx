import { useTranslations } from 'next-intl';

export function Newsletter() {
  const t = useTranslations('newsletter');
  return (
    <section className="rv max-w-[540px] mx-auto text-center">
      <p className="text-[0.78rem] tracking-[0.32em] uppercase text-ocre mb-[14px]">
        {t('eyebrow')}
      </p>
      <p className="font-serif italic font-light text-creme text-[clamp(1.05rem,3vw,1.22rem)] leading-[1.55] mb-7 max-w-[480px] mx-auto">
        {t('lead')}
      </p>
      <p className="font-serif italic text-ocre/70 text-[0.95rem] tracking-[0.12em] lowercase">
        — {t('emBreve')} —
      </p>
    </section>
  );
}
