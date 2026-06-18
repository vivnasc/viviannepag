import { setRequestLocale } from 'next-intl/server';
import { RomancePreview, type RomanceMeta } from '@/components/romance/RomancePreview';
import { AMOSTRA_A_SENTINELA } from '@/lib/amostras/a-sentinela';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// classes de cor literais (estante I · bordeaux-claro) — app/** é lido pelo JIT do Tailwind
const META: RomanceMeta = {
  slug: 'a-sentinela',
  romano: 'I',
  serieLabel: {
    pt: 'Biblioteca de Véspera · o nono romance',
    en: 'The Véspera Library · novel nine',
  },
  tituloPt: 'A Sentinela',
  tituloEn: 'The Sentinel',
  pitchPt: 'Numa noite de febre, com os filhos pequenos, Custódia aprendeu que velar salva e que dormir mata, e nunca mais baixou a guarda. Os filhos cresceram, ficaram a salvo e foram viver longe — e ela ficou no posto, de vigia a uma casa que não dorme, a guardar quartos vazios à espera de um perigo que passou há trinta anos. É a história de uma mãe que confundiu amar com não largar, e que só aprende a descer da guarda — a dormir, a confiar, a viver — quando uma queda no escuro, sem ninguém que a veja, lhe mostra a solidão da sentinela que velou todos e que ninguém vela. A frase do fim: eles estão a salvo, e eu também posso descansar.',
  pitchEn: 'On a night of fever, with her children small, Custódia learned that keeping watch saves and that sleep kills, and she never lowered her guard again. The children grew, came safely through, and went to live far away — and she stayed at her post, keeping watch over a house that does not sleep, guarding empty rooms against a danger that passed thirty years ago. It is the story of a mother who confused loving with never letting go, and who only learns to stand down — to sleep, to trust, to live — when a fall in the dark, with no one to see her, shows her the loneliness of the sentinel who watched over everyone and whom no one watches. The words at the end: they are safe, and I too can rest.',
  corTexto: 'text-bordeaux-claro',
  corBorda: 'border-bordeaux-claro/40',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'The Sentinel · a novel of Véspera' : 'A Sentinela · um romance de Véspera',
    description: isEn ? META.pitchEn : META.pitchPt,
  };
}

export default async function SentinelaLanding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RomancePreview meta={META} amostra={AMOSTRA_A_SENTINELA} locale={locale} />;
}
