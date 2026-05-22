import { useTranslations } from 'next-intl';
import {
  VivianneMark,
  InfonteMark,
  SyncHimMark,
  EscolaMark,
  LoranneMark,
} from '../icons/SocialMarks';

type Social = {
  href: string;
  handle: string;
  Mark: () => React.JSX.Element;
};

const socials: Social[] = [
  { href: 'https://instagram.com/vivianne.dos.santos', handle: '@vivianne.dos.santos', Mark: VivianneMark },
  { href: 'https://instagram.com/infonte.app', handle: '@infonte.app', Mark: InfonteMark },
  { href: 'https://instagram.com/synchim.app', handle: '@synchim.app', Mark: SyncHimMark },
  { href: 'https://instagram.com/escola_dos_veus', handle: '@escola_dos_veus', Mark: EscolaMark },
  { href: 'https://instagram.com/loranne_music', handle: '@loranne_music', Mark: LoranneMark },
];

export function Footer() {
  const t = useTranslations('footer');
  const ano = new Date().getFullYear();
  return (
    <footer className="text-center pt-[70px] pb-[50px] text-creme/50 text-[0.85rem]">
      <div className="flex gap-[22px] justify-center mb-6 flex-wrap">
        {socials.map((s) => (
          <a
            key={s.href}
            href={s.href}
            className="text-creme-2 no-underline text-[0.9rem] tracking-[0.04em] inline-flex items-center gap-[7px] hover:text-ambar transition-colors"
          >
            <s.Mark />
            {s.handle}
          </a>
        ))}
      </div>
      <p>
        © <span>{ano}</span> {t('copyright')} ·{' '}
        <a href="https://seteecos.com" className="text-ocre no-underline">
          {t('ligacao')}
        </a>
      </p>
    </footer>
  );
}
