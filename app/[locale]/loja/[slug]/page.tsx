import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { LangToggle } from '@/components/LangToggle';
import { TopNav } from '@/components/TopNav';
import { BotaoCompra } from '@/components/BotaoCompra';
import { GotaMini } from '@/components/icons/GotaAssina';
import { PartilhaProduto } from '@/components/PartilhaProduto';
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

const DESCRICOES: Record<string, string> = {
  'ebook-01-culpa': '**Ebook · ~50 páginas · PDF imediato**\n\nUm ebook para mães que vivem com culpa. Mostra-te de onde vem, porque não prova que falhaste, e o que te impede de ver.\n\n**Capítulos:** A coisa que sentes e nunca disseste · Ninguém fala da culpa da mãe · Sentir culpa não te torna má mãe · O que a culpa te faz fazer · De onde vem a tua culpa · Culpa não é responsabilidade · Há um caminho de volta · A travessia\n\n> *Tu sabes do que estou a falar. Aquela sensação que aparece quando te deitas e a casa finalmente está em silêncio.*',
  'ebook-02-herdaste': '**Ebook · 8 capítulos · PDF imediato**\n\nPorque repetes o que juraste nunca repetir? As lealdades invisíveis e as ordens do amor.\n\n> *Abres a boca e sai aquela frase. Com aquele tom. É a voz da tua mãe.*',
  'ebook-07-sonho': '**Ebook · 8 capítulos · PDF imediato**\n\nFizeste tudo certo e continuas perdida. O mecanismo da substituição.\n\n> *Tu fizeste tudo certo. Estudaste. Trabalhaste. E conseguiste coisas. Mas não sentes.*',
  'ebook-08-voz': '**Ebook · 7 capítulos · PDF imediato**\n\nMedes-te por uma régua que nunca escolheste.\n\n> *Há uma régua na tua vida. Mede tudo o que fazes. E nunca é suficiente.*',
};

const FALLBACK: Record<string, Produto> = {
  'ebook-01-culpa': { id: '1', slug: 'ebook-01-culpa', titulo: 'A culpa não é boa conselheira', subtitulo: 'Porque te sentes sempre em falta com os teus filhos.', descricao: DESCRICOES['ebook-01-culpa'], preco: '$7', preco_original: '$29', capa: '/produtos/ebook-01-culpa-capa.png', checkout_url: null, badge: 'ebook' },
  'ebook-02-herdaste': { id: '2', slug: 'ebook-02-herdaste', titulo: 'O que herdaste sem saber', subtitulo: 'As lealdades invisíveis: porque repetes o que juraste nunca repetir.', descricao: DESCRICOES['ebook-02-herdaste'], preco: '$7', preco_original: '$29', capa: '/produtos/ebook-02-herdaste-capa.png', checkout_url: null, badge: 'ebook' },
  'guia-01-meu': { id: '3', slug: 'guia-01-meu', titulo: 'O que é meu, o que não é meu', subtitulo: 'Um exercício para parares de carregar o que nunca foi teu.', descricao: '**Guia prático · PDF imediato**\n\nExercício de duas colunas: o que é teu vs. o que carregas por outros.', preco: '$5', preco_original: '$15', capa: '/produtos/guia-01-meu-capa.png', checkout_url: null, badge: 'guia' },
  'guia-02-frases': { id: '4', slug: 'guia-02-frases', titulo: '7 frases para dizer não sem culpa', subtitulo: 'Limites com amor e firmeza.', descricao: '**Guia prático · PDF imediato**\n\n7 frases prontas para quando o teu filho testa os limites.', preco: '$5', preco_original: '$15', capa: '/produtos/guia-02-frases-capa.png', checkout_url: null, badge: 'guia' },
  'ebook-03-quemes': { id: '5', slug: 'ebook-03-quemes', titulo: 'Quem és para além do que fazes', subtitulo: 'A diferença entre identidade e papéis.', descricao: '**Ebook · 7 capítulos · PDF imediato**\n\n> *Houve um momento em que deixaste de saber quem és.*', preco: '$7', preco_original: '$29', capa: '/produtos/ebook-03-quemes-capa.png', checkout_url: null, badge: 'ebook' },
  'ebook-04-sentido': { id: '6', slug: 'ebook-04-sentido', titulo: 'O sentido que procuras', subtitulo: 'Porque o sucesso não preenche.', descricao: '**Ebook · 6 capítulos · PDF imediato**\n\nTens tudo e sentes que falta. O vazio existencial.', preco: '$7', preco_original: '$29', capa: '/produtos/ebook-04-sentido-capa.png', checkout_url: null, badge: 'ebook' },
  'ebook-05-escuro': { id: '7', slug: 'ebook-05-escuro', titulo: 'Atravessar o escuro', subtitulo: 'As crises como passagem.', descricao: '**Ebook · 6 capítulos · PDF imediato**\n\n> *Há um lugar para onde ninguém quer ir.*', preco: '$7', preco_original: '$29', capa: '/produtos/ebook-05-escuro-capa.png', checkout_url: null, badge: 'ebook' },
  'ebook-06-no-casal': { id: '8', slug: 'ebook-06-no-casal', titulo: 'O nó invisível do casal', subtitulo: 'O que está por baixo das discussões.', descricao: '**Ebook · 6 capítulos · PDF imediato**\n\n> *Tu sabes qual é. A mesma discussão, sempre.*', preco: '$7', preco_original: '$29', capa: '/produtos/ebook-06-no-casal-capa.png', checkout_url: null, badge: 'ebook' },
  'ebook-07-sonho': { id: '9', slug: 'ebook-07-sonho', titulo: 'Nem todo o sonho que carregas nasceu em ti', subtitulo: 'Porque alcanças e continuas a sentir que falta.', descricao: DESCRICOES['ebook-07-sonho'], preco: '$7', preco_original: '$29', capa: '/produtos/ebook-07-sonho-capa.png', checkout_url: null, badge: 'ebook · novo' },
  'ebook-08-voz': { id: '10', slug: 'ebook-08-voz', titulo: 'De quem é esta voz?', subtitulo: 'Quem decidiu o que conta como sucesso?', descricao: DESCRICOES['ebook-08-voz'], preco: '$7', preco_original: '$29', capa: '/produtos/ebook-08-voz-capa.png', checkout_url: null, badge: 'ebook · novo' },
  'guia-03-presenca': { id: '11', slug: 'guia-03-presenca', titulo: 'Práticas de presença para o dia a dia', subtitulo: 'Pequenas pausas que te trazem de volta a ti.', descricao: '**Guia · PDF imediato**\n\n7 micro-práticas de presença.', preco: '$5', preco_original: '$15', capa: '/produtos/guia-03-presenca-capa.png', checkout_url: null, badge: 'guia' },
  'guia-04-mente': { id: '12', slug: 'guia-04-mente', titulo: 'Esvaziar a mente em 3 passos', subtitulo: 'Parar a roda de pensamentos.', descricao: '**Guia · PDF imediato**\n\nDespejar, separar, escolher.', preco: '$5', preco_original: '$15', capa: '/produtos/guia-04-mente-capa.png', checkout_url: null, badge: 'guia' },
  'guia-05-luto': { id: '13', slug: 'guia-05-luto', titulo: 'Ritual para o luto que ninguém vê', subtitulo: 'Para as perdas sem funeral.', descricao: '**Guia · PDF imediato**\n\nNomear, honrar, largar.', preco: '$5', preco_original: '$15', capa: '/produtos/guia-05-luto-capa.png', checkout_url: null, badge: 'guia' },
  'guia-06-perguntas': { id: '14', slug: 'guia-06-perguntas', titulo: 'As 5 perguntas antes de uma discussão', subtitulo: 'Antes de reagir.', descricao: '**Guia · PDF imediato**\n\n5 perguntas para o espaço entre estímulo e reação.', preco: '$5', preco_original: '$15', capa: '/produtos/guia-06-perguntas-capa.png', checkout_url: null, badge: 'guia' },
  'guia-07-teu': { id: '15', slug: 'guia-07-teu', titulo: 'O que é mesmo teu', subtitulo: 'Separar o que persegues por ti do que persegues por herança.', descricao: '**Guia · PDF imediato**\n\nVerdade, herança, comparação, compensação.', preco: '$5', preco_original: '$15', capa: '/produtos/guia-07-teu-capa.png', checkout_url: null, badge: 'guia · novo' },
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
    return (data as Produto | null) ?? FALLBACK[slug] ?? null;
  } catch {
    return FALLBACK[slug] ?? null;
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

          <div className="mt-10">
            <PartilhaProduto
              url={`https://viviannedossantos.com${locale === 'en' ? '/en' : ''}/loja/${slug}`}
              titulo={p.titulo}
              subtitulo={p.subtitulo}
              locale={locale}
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
