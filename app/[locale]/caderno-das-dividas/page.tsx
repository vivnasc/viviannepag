import { setRequestLocale } from 'next-intl/server';
import { RomancePreview, type RomanceMeta } from '@/components/romance/RomancePreview';
import { AMOSTRA_CADERNO_DAS_DIVIDAS } from '@/lib/amostras/caderno-das-dividas';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// classes de cor literais (estante III · ouro) — app/** é lido pelo JIT do Tailwind
const META: RomanceMeta = {
  slug: 'caderno-das-dividas',
  romano: 'III',
  serieLabel: {
    pt: 'Biblioteca de Véspera · o terceiro romance',
    en: 'The Véspera Library · novel three',
  },
  tituloPt: 'O Caderno das Dívidas',
  tituloEn: 'The Ledger of Debts',
  pitchPt: 'Benvinda herdou a Mercearia e o caderno onde está fiada a vila inteira. Sabe de cor o que todos lhe devem e nunca cobrou nada a ninguém. Este é o ano em que aprende, tarde e com a voz a tremer, a diferença entre ser boa e ser justa.',
  pitchEn: 'Benvinda inherited the shop and the ledger where the whole village is in debt to her. She knows by heart what everyone owes and has never charged a soul. This is the year she learns, late and with a trembling voice, the difference between being kind and being fair.',
  corTexto: 'text-ouro',
  corBorda: 'border-ouro/40',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'The Ledger of Debts · a novel of Véspera' : 'O Caderno das Dívidas · um romance de Véspera',
    description: isEn ? META.pitchEn : META.pitchPt,
  };
}

export default async function CadernoLanding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RomancePreview meta={META} amostra={AMOSTRA_CADERNO_DAS_DIVIDAS} locale={locale} />;
}
