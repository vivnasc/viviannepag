import { useTranslations } from 'next-intl';

type MundoKey = 'freeme' | 'infonte' | 'synchim' | 'escola' | 'livro' | 'ecos' | 'loranne';

type Mundo = {
  key: MundoKey;
  href: string;
  accent: 'ocre' | 'rosa' | 'lila' | 'bordeaux';
};

const mundos: Mundo[] = [
  { key: 'escola', href: 'https://escoladosveus.space', accent: 'lila' },
  { key: 'ecos', href: 'https://app.seteecos.com', accent: 'ocre' },
  { key: 'loranne', href: 'https://music.seteveus.space', accent: 'ocre' },
];

const accentBorder = {
  ocre: 'border-ocre/45 hover:border-ambar',
  rosa: 'border-rosa/50 hover:border-rosa',
  lila: 'border-lila/50 hover:border-lila',
  bordeaux: 'border-bordeaux/50 hover:border-bordeaux',
} as const;

const accentBadge = {
  ocre: 'text-ambar',
  rosa: 'text-rosa',
  lila: 'text-lila',
  bordeaux: 'text-bordeaux',
} as const;

const accentSeta = {
  ocre: 'text-ocre',
  rosa: 'text-rosa',
  lila: 'text-lila',
  bordeaux: 'text-bordeaux',
} as const;

export function Mundos() {
  const t = useTranslations('mundos');
  return (
    <section>
      <p className="rv text-center text-[0.78rem] tracking-[0.32em] uppercase text-ocre mb-[10px]">
        {t('eyebrow')}
      </p>
      <h2 className="rv text-center font-serif font-light text-creme text-[clamp(1.5rem,5vw,2.1rem)] leading-[1.25] mb-[50px]">
        {t('lead')}
      </h2>

      <div className="flex flex-col gap-5">
        {mundos.map((m) => (
          <a
            key={m.key}
            href={m.href}
            className={`rv group relative block overflow-hidden rounded-[18px] border ${accentBorder[m.accent]} p-[30px] transition-transform duration-500 hover:-translate-y-1 no-underline text-inherit`}
            style={{
              background:
                'linear-gradient(160deg, rgba(58,40,24,0.85), rgba(42,28,18,0.55))',
            }}
          >
            <span
              className={`block text-[0.74rem] tracking-[0.22em] uppercase font-medium mb-3 ${accentBadge[m.accent]}`}
            >
              {t(`${m.key}.badge`)}
            </span>
            <h3 className="font-serif font-normal text-[1.7rem] text-creme mb-2 tracking-[-0.01em]">
              {t(`${m.key}.titulo`)}
            </h3>
            <p className="text-creme/85 text-[0.98rem] max-w-[90%]">
              {t(`${m.key}.texto`)}
            </p>
            <span
              className={`absolute right-[28px] top-1/2 -translate-y-1/2 text-[1.4rem] opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 transition-transform duration-500 ${accentSeta[m.accent]}`}
              aria-hidden
            >
              {'→'}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
