import { setRequestLocale } from 'next-intl/server';
import { RomancePreview, type RomanceMeta } from '@/components/romance/RomancePreview';
import { AMOSTRA_A_TRADUTORA } from '@/lib/amostras/a-tradutora';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// classes de cor literais (estante I · bordeaux-claro) — app/** é lido pelo JIT do Tailwind
const META: RomanceMeta = {
  slug: 'a-tradutora',
  romano: 'I',
  serieLabel: {
    pt: 'Biblioteca de Véspera · o oitavo romance',
    en: 'The Véspera Library · novel eight',
  },
  tituloPt: 'A Tradutora',
  tituloEn: 'The Translator',
  pitchPt: 'O filho de Eulália veio ao mundo a dizer as coisas de outra maneira, e só ela aprendeu a língua dele. Tornou-se a sua voz para o mundo inteiro — para os médicos, para a escola, para a vila — e nisso se apagou: ao fim de uma vida a falar por ele, já não sabia o que ela própria queria, pensava, sentia. É a história de uma mãe que confundiu amar com desaparecer, e que só aprende a usar a sua própria voz quando se cala o suficiente para o mundo ter de aprender a ouvir o filho. A primeira frase que diz por si, no fim: eu também tenho uma voz.',
  pitchEn: 'Eulália’s son came into the world saying things a different way, and only she learned his language. She became his voice to the whole world — to doctors, to the school, to the village — and in it she vanished: after a lifetime speaking for him, she no longer knew what she herself wanted, thought, felt. It is the story of a mother who confused loving with disappearing, and who only learns to use her own voice when she falls silent enough for the world to have to learn to hear her son. The first sentence she says for herself, at the end: I have a voice too.',
  corTexto: 'text-bordeaux-claro',
  corBorda: 'border-bordeaux-claro/40',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'The Translator · a novel of Véspera' : 'A Tradutora · um romance de Véspera',
    description: isEn ? META.pitchEn : META.pitchPt,
  };
}

export default async function TradutoraLanding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RomancePreview meta={META} amostra={AMOSTRA_A_TRADUTORA} locale={locale} />;
}
