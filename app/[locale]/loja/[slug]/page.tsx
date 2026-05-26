import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { LangToggle } from '@/components/LangToggle';
import { TopNav } from '@/components/TopNav';
import { BotaoCompra } from '@/components/BotaoCompra';
import { GotaMini } from '@/components/icons/GotaAssina';
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
  const isEbook = p.badge?.toLowerCase().includes('ebook');

  return (
    <>
      <TopNav />
      <LangToggle />

      {/* HERO */}
      <section className="relative z-[2] pt-24 pb-16 px-7">
        <div className="max-w-[1060px] mx-auto">
          <nav className="mb-8">
            <Link
              href={`${locale === 'en' ? '/en' : ''}/loja`}
              className="text-ocre/70 no-underline text-[0.78rem] tracking-[0.08em] hover:text-ambar transition-colors"
            >
              ← {isPt ? 'voltar à loja' : 'back to shop'}
            </Link>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-12 items-center">
            {/* CAPA */}
            <div className="mx-auto md:mx-0 w-[280px] md:w-full">
              {p.capa ? (
                <div className="relative aspect-[3/4] rounded-[20px] overflow-hidden border border-ocre/20 shadow-2xl shadow-black/30">
                  <Image
                    src={p.capa}
                    alt={p.titulo}
                    fill
                    priority
                    className="object-cover"
                    unoptimized={p.capa.endsWith('.svg') || p.capa.endsWith('.png')}
                  />
                  {p.badge && (
                    <span className="absolute top-4 left-4 bg-ambar text-terra text-[0.65rem] tracking-[0.14em] uppercase font-medium px-3 py-1.5 rounded-full">
                      {p.badge}
                    </span>
                  )}
                </div>
              ) : (
                <div className="aspect-[3/4] rounded-[20px] bg-terra-2/60 border border-ocre/20 flex items-center justify-center">
                  <span className="text-creme-2/30 italic">sem capa</span>
                </div>
              )}
            </div>

            {/* INFO */}
            <div>
              <h1 className="font-serif font-light text-creme text-[clamp(2.2rem,5vw,3.2rem)] leading-[1.06] tracking-[-0.015em] mb-4">
                {p.titulo}
              </h1>
              <p className="font-serif italic text-creme-2/90 text-[clamp(1.05rem,2.8vw,1.25rem)] leading-[1.55] mb-8 max-w-[540px]">
                {p.subtitulo}
              </p>

              <p className="text-[0.78rem] tracking-[0.18em] uppercase text-ocre/80 mb-2">
                {isPt ? 'por' : 'by'} Vivianne dos Santos
              </p>

              <GotaMini className="w-[24px] h-[24px] opacity-50 mb-8 block" />

              {/* PRECO + CTA */}
              <div className="flex items-baseline gap-4 mb-5">
                <span className="text-ambar font-serif text-[2.2rem] leading-none">{p.preco}</span>
                {p.preco_original && (
                  <span className="text-creme-2/40 text-[1.15rem] line-through">{p.preco_original}</span>
                )}
              </div>
              {p.preco_original && (
                <p className="text-[0.78rem] text-ocre/70 mb-5">
                  {isPt
                    ? `Valor real: ${p.preco_original}. Preço de lançamento.`
                    : `Real value: ${p.preco_original}. Launch price.`}
                </p>
              )}
              <div className="mb-4 max-w-[360px]">
                <BotaoCompra
                  slug={slug}
                  locale={locale}
                  titulo={p.titulo}
                  preco={p.preco}
                  checkoutUrl={p.checkout_url}
                />
              </div>
              <p className="text-[0.72rem] text-creme-2/50">
                {isPt
                  ? 'Download imediato em PDF. Pagamento seguro via PayPal.'
                  : 'Immediate PDF download. Secure payment via PayPal.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEPARADOR */}
      <div className="max-w-[1060px] mx-auto px-7">
        <hr className="border-ocre/10 my-4" />
      </div>

      {/* DESCRICAO / CONTEUDO */}
      <section className="relative z-[2] py-14 px-7">
        <div className="max-w-[720px] mx-auto">
          {descHtml && (
            <article
              className="escrito-prose prose-headings:text-creme prose-headings:font-serif prose-headings:font-light prose-strong:text-ambar prose-blockquote:border-l-ocre/40 prose-blockquote:text-creme-2/80 prose-blockquote:italic prose-ol:text-creme-2/90 prose-li:text-creme-2/90"
              dangerouslySetInnerHTML={{ __html: descHtml }}
            />
          )}
        </div>
      </section>

      {/* GARANTIA + SEGUNDO CTA */}
      <section className="relative z-[2] py-14 px-7">
        <div className="max-w-[600px] mx-auto text-center">
          <GotaMini className="w-[28px] h-[28px] mx-auto opacity-50 mb-6 block" />
          <h2 className="font-serif font-light text-creme text-[1.6rem] leading-[1.2] mb-4">
            {isPt ? 'Este material é teu.' : 'This material is yours.'}
          </h2>
          <p className="text-creme-2/80 text-[0.95rem] leading-[1.7] mb-8">
            {isPt
              ? 'Recebes o PDF imediatamente após o pagamento. Podes ler no telemóvel, no computador, ou imprimir. É teu para sempre.'
              : 'You receive the PDF immediately after payment. Read on your phone, computer, or print it. It\'s yours forever.'}
          </p>

          <div className="flex items-baseline justify-center gap-4 mb-5">
            <span className="text-ambar font-serif text-[2rem]">{p.preco}</span>
            {p.preco_original && (
              <span className="text-creme-2/40 text-[1rem] line-through">{p.preco_original}</span>
            )}
          </div>
          <div className="max-w-[320px] mx-auto mb-6">
            <BotaoCompra
              slug={slug}
              locale={locale}
              titulo={p.titulo}
              preco={p.preco}
              checkoutUrl={p.checkout_url}
            />
          </div>

          <p className="text-[0.72rem] text-creme-2/40 mt-8">
            {isPt
              ? '© 2026 Vivianne dos Santos · viviannedossantos.com'
              : '© 2026 Vivianne dos Santos · viviannedossantos.com'}
          </p>
        </div>
      </section>
    </>
  );
}
