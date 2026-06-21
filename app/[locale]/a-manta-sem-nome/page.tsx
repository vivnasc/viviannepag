import { setRequestLocale } from 'next-intl/server';
import { RomancePreview, type RomanceMeta } from '@/components/romance/RomancePreview';
import { AMOSTRA_A_MANTA_SEM_NOME } from '@/lib/amostras/a-manta-sem-nome';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// classes de cor literais (estante VII · ocre) — app/** é lido pelo JIT do Tailwind
const META: RomanceMeta = {
  slug: 'a-manta-sem-nome',
  romano: 'VII',
  serieLabel: {
    pt: 'Biblioteca de Véspera · o vigésimo segundo romance',
    en: 'The Véspera Library · novel twenty-two',
  },
  tituloPt: 'A Manta Sem Nome',
  tituloEn: 'The Unsigned Blanket',
  pitchPt: 'Velada tece as mantas mais belas da região, e meia vila dorme aquecida pelo trabalho dela sem o saber: vende por interposta pessoa, recusa as feiras, não assina. Quando alguém elogia uma manta diante dela, muda de assunto com o coração aos saltos. A única vez que se mostrou, em nova, com um trabalho premiado, a inveja que se seguiu custou-lhe a única amiga, e ela aprendeu que ser vista era perder. Este é o ano em que aprende a mostrar-se sem se perder: a primeira manta assinada, o nome bordado pequenino no canto, e depois menos pequenino, e a descoberta de que o que ela cria merece chegar ao mundo com ela presa ao nome.',
  pitchEn: 'Velada weaves the most beautiful blankets of the region, and half the village sleeps warm by her work without knowing it: she sells through an intermediary, refuses the fairs, does not sign. When someone praises a blanket before her, she changes the subject with her heart racing. The only time she showed herself, when young, with a prize-winning work, the envy that followed cost her her only friend, and she learned that to be seen was to lose. This is the year she learns to show herself without losing herself: the first signed blanket, the name embroidered tiny in the corner, then less tiny, and the discovery that what she creates deserves to reach the world with her attached to the name.',
  corTexto: 'text-ocre',
  corBorda: 'border-ocre/40',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'The Unsigned Blanket · a novel of Véspera' : 'A Manta Sem Nome · um romance de Véspera',
    description: isEn ? META.pitchEn : META.pitchPt,
  };
}

export default async function MantaLanding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RomancePreview meta={META} amostra={AMOSTRA_A_MANTA_SEM_NOME} locale={locale} />;
}
