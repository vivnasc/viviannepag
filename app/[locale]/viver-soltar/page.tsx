import { LivroVenda } from '@/components/LivroVenda';
import { getManual } from '@/lib/livros';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = getManual('viver-soltar')!;
  const isEn = locale === 'en';
  return {
    title: `${m.marca} · Método VS · Vivianne dos Santos`,
    description: isEn ? m.promessaEn : m.promessa,
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LivroVenda slug="viver-soltar" locale={locale} />;
}
