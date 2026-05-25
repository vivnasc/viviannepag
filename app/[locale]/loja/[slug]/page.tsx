import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { LangToggle } from '@/components/LangToggle';
import { TopNav } from '@/components/TopNav';
import { getSupabase } from '@/lib/supabase';
import { marked } from 'marked';
import type { Metadata } from 'next';

type Produto = {
  id: string;
  slug: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  preco: string;
  preco_original: string | null;
  capa: string | null;
  checkout_url: string | null;
  badge: string | null;
};

async function getProduto(slug: string): Promise<Produto | null> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('produtos')
      .select('*')
      .eq('slug', slug)
      .eq('publicado', true)
      .single();
    return data as Produto | null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = await getProduto(slug);
  if (!p) return {};
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://viviannedossantos.com';
  const path = `${locale === 'en' ? '/en' : ''}/loja/${slug}`;
  return {
    title: `${p.titulo} · Vivianne dos Santos`,
    description: p.subtitulo,
    alternates: { canonical: `${url}${path}` },
    openGraph: {
      type: 'website',
      title: p.titulo,
      description: p.subtitulo,
      url: `${url}${path}`,
      ...(p.capa ? { images: [{ url: p.capa.startsWith('http') ? p.capa : `${url}${p.capa}` }] } : {}),
    },
  };
}

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const p = await getProduto(slug);
  if (!p) notFound();
  const isPt = locale === 'pt';
  const descHtml = p.descricao ? await marked.parse(p.descricao, { async: true }) : '';

  return (
    <>
      <TopNav />
      <LangToggle />
      <main className="relative z-[2] max-w-[960px] mx-auto px-7 pt-20 pb-24">
        <nav className="mb-10">
          <Link
            href={`${locale === 'en' ? '/en' : ''}/loja`}
            className="text-ocre/80 no-underline text-[0.82rem] tracking-[0.08em] hover:text-ambar transition-colors"
          >
            ← {isPt ? 'voltar à loja' : 'back to shop'}
          </Link>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] gap-10 items-start">
          <div className="sticky top-24">
            {p.capa ? (
              <div className="relative aspect-[3/4] rounded-[18px] overflow-hidden border border-ocre/25">
                <Image
                  src={p.capa}
                  alt={p.titulo}
                  fill
                  priority
                  className="object-cover"
                  unoptimized={p.capa.endsWith('.svg')}
                />
                {p.badge && (
                  <span className="absolute top-4 left-4 bg-ambar text-terra text-[0.68rem] tracking-[0.12em] uppercase font-medium px-3 py-1.5 rounded-full">
                    {p.badge}
                  </span>
                )}
              </div>
            ) : (
              <div className="aspect-[3/4] rounded-[18px] bg-terra-2/60 border border-ocre/20 flex items-center justify-center">
                <span className="text-creme-2/30 italic">sem capa</span>
              </div>
            )}
          </div>

          <div>
            <h1 className="font-serif font-light text-creme text-[clamp(2rem,5vw,2.8rem)] leading-[1.1] tracking-[-0.01em] mb-3">
              {p.titulo}
            </h1>
            <p className="font-serif italic text-creme-2 text-[clamp(1.05rem,3vw,1.2rem)] leading-[1.5] mb-8">
              {p.subtitulo}
            </p>

            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-ambar font-serif text-[1.8rem]">{p.preco}</span>
              {p.preco_original && (
                <span className="text-creme-2/50 text-[1.1rem] line-through">{p.preco_original}</span>
              )}
            </div>

            {p.checkout_url && (
              <a
                href={p.checkout_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-ambar text-terra font-sans text-[0.95rem] font-medium tracking-[0.04em] rounded-[14px] px-8 py-4 hover:bg-ocre transition-colors no-underline mb-10"
              >
                {isPt ? 'Começar a travessia' : 'Start the journey'}
              </a>
            )}

            {descHtml && (
              <article
                className="escrito-prose"
                dangerouslySetInnerHTML={{ __html: descHtml }}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
