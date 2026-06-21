import { setRequestLocale } from 'next-intl/server';
import { RomancePreview, type RomanceMeta } from '@/components/romance/RomancePreview';
import { AMOSTRA_A_CHAVE_DA_FABRICA } from '@/lib/amostras/a-chave-da-fabrica';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// classes de cor literais (estante VII · ocre) — app/** é lido pelo JIT do Tailwind
const META: RomanceMeta = {
  slug: 'a-chave-da-fabrica',
  romano: 'VII',
  serieLabel: {
    pt: 'Biblioteca de Véspera · o vigésimo primeiro romance',
    en: 'The Véspera Library · novel twenty-one',
  },
  tituloPt: 'A Chave da Fábrica',
  tituloEn: 'The Key to the Mill',
  pitchPt: 'Há trinta anos que a chave da Fiandeira é da Preciosa: abre antes de todos, fecha depois de todos, sabe onde tudo está e como tudo se faz. Nunca gozou férias inteiras; adoecer, para ela, é organizar a doença para não faltar. Se eu parar, tudo cai, é a frase que a sustenta e a cerca. Este é o ano em que entrega a chave, por uma semana, e assiste, com terror e depois com espanto, à fábrica a funcionar sem ela, e descobre o que a frase escondia: não era a fábrica que caía sem ela, era ela que não sabia quem fosse sem a fábrica.',
  pitchEn: 'For thirty years the key to the Spinning Mill has been Preciosa’s: she opens before all, closes after all, knows where everything is and how everything is done. She never took a whole holiday; to fall ill, for her, is to organise the illness so as not to be absent. If I stop, everything falls, is the phrase that sustains her and fences her in. This is the year she hands over the key, for a week, and watches, with terror and then with astonishment, the mill working without her, and discovers what the phrase hid: it was not the mill that fell without her, it was she who did not know who she was without the mill.',
  corTexto: 'text-ocre',
  corBorda: 'border-ocre/40',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'The Key to the Mill · a novel of Véspera' : 'A Chave da Fábrica · um romance de Véspera',
    description: isEn ? META.pitchEn : META.pitchPt,
  };
}

export default async function ChaveLanding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RomancePreview meta={META} amostra={AMOSTRA_A_CHAVE_DA_FABRICA} locale={locale} />;
}
