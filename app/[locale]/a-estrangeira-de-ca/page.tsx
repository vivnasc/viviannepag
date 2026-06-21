import { setRequestLocale } from 'next-intl/server';
import { RomancePreview, type RomanceMeta } from '@/components/romance/RomancePreview';
import { AMOSTRA_A_ESTRANGEIRA_DE_CA } from '@/lib/amostras/a-estrangeira-de-ca';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// classes de cor literais (estante V · salvia) — app/** é lido pelo JIT do Tailwind
const META: RomanceMeta = {
  slug: 'a-estrangeira-de-ca',
  romano: 'V',
  serieLabel: {
    pt: 'Biblioteca de Véspera · o décimo oitavo romance',
    en: 'The Véspera Library · novel eighteen',
  },
  tituloPt: 'A Estrangeira de Cá',
  tituloEn: 'The Foreigner from Here',
  pitchPt: 'Peregrina é filha da emigração: lá fora foi sempre a portuguesa, a de cá; voltou de vez à vila dos pais e descobriu que cá é a de fora, a turista, a que fala diferente. Tem duas casas e nenhuma, duas línguas e nenhuma inteira, e a mãe, que nunca voltou, não entende quem volta. Este é o ano em que aprende que a pertença não se herda, escolhe-se, e que a casa que procurava lá fora se constrói primeiro dentro, e depois, tijolo a tijolo, numa rua de Véspera onde decide, enfim, enraizar.',
  pitchEn: 'Peregrina is a child of emigration: abroad she was always the Portuguese one, the one from here; she returned for good to her parents’ village and discovered that here she is the one from away, the tourist, the one who speaks differently. She has two homes and none, two tongues and neither one whole, and her mother, who never returned, does not understand those who return. This is the year she learns that belonging is not inherited, it is chosen, and that the home she sought abroad is built first within, and then, brick by brick, in a street of Véspera where she decides, at last, to take root.',
  corTexto: 'text-salvia',
  corBorda: 'border-salvia/40',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'The Foreigner from Here · a novel of Véspera' : 'A Estrangeira de Cá · um romance de Véspera',
    description: isEn ? META.pitchEn : META.pitchPt,
  };
}

export default async function EstrangeiraLanding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RomancePreview meta={META} amostra={AMOSTRA_A_ESTRANGEIRA_DE_CA} locale={locale} />;
}
