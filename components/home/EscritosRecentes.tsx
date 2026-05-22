import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listEscritos, formatarData, type Locale } from '@/lib/escritos';

export async function EscritosRecentes({ locale }: { locale: Locale }) {
  const escritos = (await listEscritos(locale)).slice(0, 2);
  if (escritos.length === 0) return null;
  const t = await getTranslations('escritos');
  const todosHref = locale === 'en' ? '/en/escritos' : '/escritos';

  return (
    <section className="rv max-w-[640px] mx-auto text-center">
      <p className="text-[0.78rem] tracking-[0.32em] uppercase text-ocre mb-[14px]">
        {t('eyebrow')}
      </p>
      <p className="font-serif italic font-light text-creme text-[clamp(1.05rem,3vw,1.22rem)] leading-[1.55] mb-10 max-w-[480px] mx-auto">
        {t('lead')}
      </p>
      <ul className="space-y-10 text-left">
        {escritos.map((e) => {
          const href =
            locale === 'en' ? `/en/escritos/${e.slug}` : `/escritos/${e.slug}`;
          return (
            <li key={e.slug}>
              <Link href={href} className="block group no-underline">
                <p className="text-[0.7rem] tracking-[0.24em] uppercase text-ocre/70 mb-2">
                  {formatarData(e.data, locale)}
                </p>
                <h3 className="font-serif font-light text-creme text-[clamp(1.3rem,3.4vw,1.65rem)] leading-[1.2] mb-2 group-hover:text-ambar transition-colors">
                  {e.titulo}
                </h3>
                <p className="text-creme-2 text-[0.98rem] leading-[1.6]">
                  {e.resumo}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-10">
        <Link
          href={todosHref}
          className="text-ocre no-underline border-b border-ocre/40 hover:border-ambar hover:text-ambar transition-colors text-[0.88rem] tracking-[0.06em] pb-0.5"
        >
          {t('verTodos')} →
        </Link>
      </div>
    </section>
  );
}
