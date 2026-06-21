import { setRequestLocale } from 'next-intl/server';
import { RomancePreview, type RomanceMeta } from '@/components/romance/RomancePreview';
import { AMOSTRA_AS_TRAVESSAS_DEVOLVIDAS } from '@/lib/amostras/as-travessas-devolvidas';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// classes de cor literais (estante VI · lila) — app/** é lido pelo JIT do Tailwind
const META: RomanceMeta = {
  slug: 'as-travessas-devolvidas',
  romano: 'VI',
  serieLabel: {
    pt: 'Biblioteca de Véspera · o vigésimo romance',
    en: 'The Véspera Library · novel twenty',
  },
  tituloPt: 'As Travessas Devolvidas',
  tituloEn: 'The Returned Dishes',
  pitchPt: 'Socorro foi o socorro de todos a vida inteira: a que acode, a que ampara, a que está lá quando alguém precisa. Mas quando adoece, e a vila faz o que a vila faz, travessas de comida à porta, devolve-as cheias, com um bilhete a agradecer, porque contar com alguém, uma vez, no ano em que mais precisou, terminou na porta vazia. Este é o ano em que aprende a coisa mais difícil para quem só sabe dar: aceitar a primeira travessa, comê-la até ao fim, e devolvê-la vazia, que em Véspera é a maior declaração de confiança que há.',
  pitchEn: 'Socorro was everyone’s help her whole life: the one who comes, who shelters, who is there when someone needs. But when she falls ill, and the village does what the village does, dishes of food at the door, she returns them full, with a note of thanks, because to count on someone, once, in the year she most needed, ended at the empty door. This is the year she learns the hardest thing for one who only knows how to give: to accept the first dish, to eat it to the end, and to return it empty, which in Véspera is the greatest declaration of trust there is.',
  corTexto: 'text-lila',
  corBorda: 'border-lila/40',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'The Returned Dishes · a novel of Véspera' : 'As Travessas Devolvidas · um romance de Véspera',
    description: isEn ? META.pitchEn : META.pitchPt,
  };
}

export default async function TravessasLanding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RomancePreview meta={META} amostra={AMOSTRA_AS_TRAVESSAS_DEVOLVIDAS} locale={locale} />;
}
