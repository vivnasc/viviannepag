import { setRequestLocale } from 'next-intl/server';
import { RomancePreview, type RomanceMeta } from '@/components/romance/RomancePreview';
import { AMOSTRA_A_TRAVE_MESTRA } from '@/lib/amostras/a-trave-mestra';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// classes de cor literais (estante V · salvia) — app/** é lido pelo JIT do Tailwind
const META: RomanceMeta = {
  slug: 'a-trave-mestra',
  romano: 'V',
  serieLabel: {
    pt: 'Biblioteca de Véspera · o décimo sétimo romance',
    en: 'The Véspera Library · novel seventeen',
  },
  tituloPt: 'A Trave-Mestra',
  tituloEn: 'The Master Beam',
  pitchPt: 'Perpétua tornou-se a coluna da Casa do Lagar aos catorze anos, quando a mãe morreu, e nunca mais largou o peso: é a ela que se ligam as aflições, a ela que cabem os velhos, as festas, as crises de todos, enquanto os irmãos vivem leves nas suas costas e ninguém pergunta à trave como está. Este é o ano em que o corpo lhe diz basta, e em que ela aprende a coisa mais difícil de uma vida a segurar a casa: que pousar não é deixar cair, é deixar a casa aprender a aguentar-se, e descobrir, do outro lado do peso, quem é Perpétua quando não está a segurar nada.',
  pitchEn: 'Perpétua became the column of the House of the Mill at fourteen, when her mother died, and never again let the weight go: it is she the troubles are brought to, she who is left with the old ones, the feasts, everyone’s crises, while her siblings live light on her back and no one asks the beam how she is. This is the year her body says enough, and she learns the hardest thing of a life spent holding the house: that to set down is not to let fall, it is to let the house learn to hold itself, and to discover, on the far side of the weight, who Perpétua is when she is holding nothing.',
  corTexto: 'text-salvia',
  corBorda: 'border-salvia/40',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'The Master Beam · a novel of Véspera' : 'A Trave-Mestra · um romance de Véspera',
    description: isEn ? META.pitchEn : META.pitchPt,
  };
}

export default async function TraveMestraLanding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RomancePreview meta={META} amostra={AMOSTRA_A_TRAVE_MESTRA} locale={locale} />;
}
