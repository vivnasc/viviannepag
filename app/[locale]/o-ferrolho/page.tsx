import { setRequestLocale } from 'next-intl/server';
import { RomancePreview, type RomanceMeta } from '@/components/romance/RomancePreview';
import { AMOSTRA_O_FERROLHO } from '@/lib/amostras/o-ferrolho';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// classes de cor literais (estante I · bordeaux-claro) — app/** é lido pelo JIT do Tailwind
const META: RomanceMeta = {
  slug: 'o-ferrolho',
  romano: 'I',
  serieLabel: {
    pt: 'Biblioteca de Véspera · o décimo romance',
    en: 'The Véspera Library · novel ten',
  },
  tituloPt: 'O Ferrolho',
  tituloEn: 'The Bolt',
  pitchPt: 'Dores salvou o marido, que bebia, e depois o filho, que herdou a sede do pai. Cobriu, pagou, deu sempre, até ter medo do próprio filho na sua própria casa, e até descobrir que o seu amor sem limite os afundava aos dois. É a história de uma mãe que confundiu amar com salvar, e que só aprende — com uma noite de medo, uma Guardiã e uma vizinha que já fez a travessia — que não é responsável pela doença de quem ama, que não a cura sacrificando-se, e que fechar a porta ao mal não é fechar o coração à pessoa. A frase do fim, ao correr o ferrolho: ao meu filho, quando vier são, está sempre aberta; mas eu não morro mais a salvá-lo.',
  pitchEn: 'Dores saved her husband, who drank, and then her son, who inherited his father’s thirst. She covered for him, paid, always gave, until she feared her own son in her own house, and until she discovered that her boundless love was drowning them both. It is the story of a mother who confused loving with saving, and who only learns — through a night of fear, a Keeper of the Records and a neighbour who has made the crossing — that she is not responsible for the illness of the one she loves, that she does not cure it by destroying herself, and that bolting the door against the harm is not closing the heart to the person. The words at the end, as she draws the bolt: to my son, when he comes sober, it is always open; but I will not die saving him any longer.',
  corTexto: 'text-bordeaux-claro',
  corBorda: 'border-bordeaux-claro/40',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'The Bolt · a novel of Véspera' : 'O Ferrolho · um romance de Véspera',
    description: isEn ? META.pitchEn : META.pitchPt,
  };
}

export default async function FerrolhoLanding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RomancePreview meta={META} amostra={AMOSTRA_O_FERROLHO} locale={locale} />;
}
