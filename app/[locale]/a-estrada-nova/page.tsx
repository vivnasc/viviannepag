import { setRequestLocale } from 'next-intl/server';
import { RomancePreview, type RomanceMeta } from '@/components/romance/RomancePreview';
import { AMOSTRA_A_ESTRADA_NOVA } from '@/lib/amostras/a-estrada-nova';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// classes de cor literais (estante II · ambar) — app/** é lido pelo JIT do Tailwind
const META: RomanceMeta = {
  slug: 'a-estrada-nova',
  romano: 'II',
  serieLabel: {
    pt: 'Biblioteca de Véspera · o décimo primeiro romance',
    en: 'The Véspera Library · novel eleven',
  },
  tituloPt: 'A Estrada Nova',
  tituloEn: 'The New Road',
  pitchPt: 'Aurora foi a primeira em tudo e nunca se sentiu chegada: cada vitória vira logo o degrau da seguinte, e a linha de chegada recua sempre. Levou uma vida a correr atrás de uma chegada que não existe ao fim da subida — porque a meta nunca foi dela, foi do pai, do «e agora?» que ele nunca calava. É a história de uma mulher que confundiu subir com chegar, e que só aprende, ao alcançar o maior dos cumes e encontrá-lo vazio, que a chegada não é um sítio que se alcança subindo: é uma decisão de parar e de estar onde se está. A frase do fim, numa manhã sem nada de especial: cheguei. Estou aqui. E aqui é suficiente.',
  pitchEn: 'Aurora was first at everything and never felt she had arrived: each victory becomes the step to the next, and the finish line keeps receding. She spent a life chasing an arrival that does not exist at the top of the climb — because the goal was never hers, it was her father’s, the “and now?” he never let fall silent. It is the story of a woman who confused climbing with arriving, and who only learns, on reaching the highest summit and finding it empty, that arrival is not a place reached by climbing: it is a decision to stop and to be where you are. The words at the end, on a morning with nothing special about it: I have arrived. I am here. And here is enough.',
  corTexto: 'text-ambar',
  corBorda: 'border-ambar/40',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'The New Road · a novel of Véspera' : 'A Estrada Nova · um romance de Véspera',
    description: isEn ? META.pitchEn : META.pitchPt,
  };
}

export default async function EstradaLanding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RomancePreview meta={META} amostra={AMOSTRA_A_ESTRADA_NOVA} locale={locale} />;
}
