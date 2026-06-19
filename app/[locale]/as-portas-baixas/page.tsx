import { setRequestLocale } from 'next-intl/server';
import { RomancePreview, type RomanceMeta } from '@/components/romance/RomancePreview';
import { AMOSTRA_AS_PORTAS_BAIXAS } from '@/lib/amostras/as-portas-baixas';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// classes de cor literais (estante II · ambar) — app/** é lido pelo JIT do Tailwind
const META: RomanceMeta = {
  slug: 'as-portas-baixas',
  romano: 'II',
  serieLabel: {
    pt: 'Biblioteca de Véspera · o décimo segundo romance',
    en: 'The Véspera Library · novel twelve',
  },
  tituloPt: 'As Portas Baixas',
  tituloEn: 'The Low Doors',
  pitchPt: 'Modesta tem a melhor voz do coro da vila e canta-a para dentro, em surdina, deixando os solos aos outros, porque aprendeu em menina, num dia em que brilhar lhe custou caro, que sobressair traz castigo. Passou a vida curvada como quem passa por portas baixas, sem ver que era mais alta do que as portas por onde se baixava, e que o medo que a curvava não era seu, era da mãe. É a história de uma mulher que confundiu humildade com esconder-se, e que só aprende — com uma Guardiã e um velho mestre do coro — que um dom é para se dar e não para se enterrar, e que se pode erguer à sua altura e cantar a plena voz sem deixar de ser humilde. A frase do fim, ao cantar enfim para fora: esta voz é minha, e não ma deram para a calar.',
  pitchEn: 'Modesta has the best voice in the village choir and sings it inward, under her breath, leaving the solos to others, because she learned as a girl, on a day when shining cost her dearly, that standing out brings punishment. She spent her life stooped, as one passes through low doors, never seeing that she was taller than the doors she bowed under, and that the fear bending her was not hers but her mother’s. It is the story of a woman who confused humility with hiding, and who only learns — through a Keeper of the Records and an old choirmaster — that a gift is to be given and not buried, and that one can stand to one’s full height and sing at full voice without ceasing to be humble. The words at the end, as she finally sings out: this voice is mine, and it was not given to me to silence.',
  corTexto: 'text-ambar',
  corBorda: 'border-ambar/40',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'The Low Doors · a novel of Véspera' : 'As Portas Baixas · um romance de Véspera',
    description: isEn ? META.pitchEn : META.pitchPt,
  };
}

export default async function PortasLanding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RomancePreview meta={META} amostra={AMOSTRA_AS_PORTAS_BAIXAS} locale={locale} />;
}
