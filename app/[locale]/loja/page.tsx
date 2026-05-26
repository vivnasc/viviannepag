import Link from 'next/link';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LangToggle } from '@/components/LangToggle';
import { TopNav } from '@/components/TopNav';
import { getSupabase } from '@/lib/supabase';
import { GotaMini } from '@/components/icons/GotaAssina';
import type { Metadata } from 'next';

type Produto = {
  id: string;
  slug: string;
  titulo: string;
  subtitulo: string;
  preco: string;
  preco_original: string | null;
  capa: string | null;
  badge: string | null;
  destaque: boolean;
};

type ProdutoI18n = Produto & { titulo_en: string; subtitulo_en: string };

const CATALOGO: ProdutoI18n[] = [
  { id: '1', slug: 'ebook-01-culpa', titulo: 'A culpa não é boa conselheira', titulo_en: 'Guilt Is Not a Good Advisor', subtitulo: 'Porque te sentes sempre em falta com os teus filhos.', subtitulo_en: 'Why you always feel like you\'re falling short with your kids.', preco: '€7', preco_original: '€29', capa: '/produtos/ebook-01-culpa-capa.png', badge: 'ebook', destaque: true },
  { id: '2', slug: 'ebook-02-herdaste', titulo: 'O que herdaste sem saber', titulo_en: 'What You Inherited Without Knowing', subtitulo: 'As lealdades invisíveis: porque repetes o que juraste nunca repetir.', subtitulo_en: 'Invisible loyalties: why you repeat what you swore you\'d never repeat.', preco: '€7', preco_original: '€29', capa: '/produtos/ebook-02-herdaste-capa.png', badge: 'ebook', destaque: true },
  { id: '3', slug: 'guia-01-meu', titulo: 'O que é meu, o que não é meu', titulo_en: 'What Is Mine, What Is Not Mine', subtitulo: 'Um exercício para parares de carregar o que nunca foi teu.', subtitulo_en: 'An exercise to stop carrying what was never yours.', preco: '€5', preco_original: '€15', capa: '/produtos/guia-01-meu-capa.png', badge: 'guia', destaque: false },
  { id: '4', slug: 'guia-02-frases', titulo: '7 frases para dizer não sem culpa', titulo_en: '7 Phrases to Say No Without Guilt', subtitulo: 'Limites com amor e firmeza.', subtitulo_en: 'Boundaries with love and firmness.', preco: '€5', preco_original: '€15', capa: '/produtos/guia-02-frases-capa.png', badge: 'guia', destaque: false },
  { id: '5', slug: 'ebook-03-quemes', titulo: 'Quem és para além do que fazes', titulo_en: 'Who You Are Beyond What You Do', subtitulo: 'A diferença entre identidade e papéis.', subtitulo_en: 'The difference between identity and roles.', preco: '€7', preco_original: '€29', capa: '/produtos/ebook-03-quemes-capa.png', badge: 'ebook', destaque: false },
  { id: '6', slug: 'ebook-04-sentido', titulo: 'O sentido que procuras', titulo_en: 'The Meaning You Are Looking For', subtitulo: 'Porque o sucesso não preenche.', subtitulo_en: 'Why success doesn\'t fill the void.', preco: '€7', preco_original: '€29', capa: '/produtos/ebook-04-sentido-capa.png', badge: 'ebook', destaque: false },
  { id: '7', slug: 'ebook-05-escuro', titulo: 'Atravessar o escuro', titulo_en: 'Crossing the Dark', subtitulo: 'As crises como passagem.', subtitulo_en: 'Crises as passage.', preco: '€7', preco_original: '€29', capa: '/produtos/ebook-05-escuro-capa.png', badge: 'ebook', destaque: false },
  { id: '8', slug: 'ebook-06-no-casal', titulo: 'O nó invisível do casal', titulo_en: 'The Invisible Knot in the Couple', subtitulo: 'O que está por baixo das discussões.', subtitulo_en: 'What lies beneath the arguments that keep repeating.', preco: '€7', preco_original: '€29', capa: '/produtos/ebook-06-no-casal-capa.png', badge: 'ebook', destaque: false },
  { id: '9', slug: 'ebook-07-sonho', titulo: 'Nem todo o sonho que carregas nasceu em ti', titulo_en: 'Not Every Dream You Carry Was Born in You', subtitulo: 'Porque alcanças e continuas a sentir que falta.', subtitulo_en: 'Why you achieve what you wanted and still feel something is missing.', preco: '€7', preco_original: '€29', capa: '/produtos/ebook-07-sonho-capa.png', badge: 'ebook · novo', destaque: true },
  { id: '10', slug: 'ebook-08-voz', titulo: 'De quem é esta voz?', titulo_en: 'Whose Voice Is This?', subtitulo: 'Quem decidiu o que conta como sucesso?', subtitulo_en: 'Who decided what counts as success in your life?', preco: '€7', preco_original: '€29', capa: '/produtos/ebook-08-voz-capa.png', badge: 'ebook · novo', destaque: true },
  { id: '11', slug: 'guia-03-presenca', titulo: 'Práticas de presença para o dia a dia', titulo_en: 'Presence Practices for Everyday Life', subtitulo: 'Pequenas pausas que te trazem de volta.', subtitulo_en: 'Small pauses that bring you back to yourself.', preco: '€5', preco_original: '€15', capa: '/produtos/guia-03-presenca-capa.png', badge: 'guia', destaque: false },
  { id: '12', slug: 'guia-04-mente', titulo: 'Esvaziar a mente em 3 passos', titulo_en: 'Empty Your Mind in 3 Steps', subtitulo: 'Parar a roda de pensamentos.', subtitulo_en: 'Stop the thought wheel and return to focus.', preco: '€5', preco_original: '€15', capa: '/produtos/guia-04-mente-capa.png', badge: 'guia', destaque: false },
  { id: '13', slug: 'guia-05-luto', titulo: 'Ritual para o luto que ninguém vê', titulo_en: 'A Ritual for the Grief Nobody Sees', subtitulo: 'Para as perdas sem funeral.', subtitulo_en: 'For the losses that had no funeral.', preco: '€5', preco_original: '€15', capa: '/produtos/guia-05-luto-capa.png', badge: 'guia', destaque: false },
  { id: '14', slug: 'guia-06-perguntas', titulo: 'As 5 perguntas antes de uma discussão', titulo_en: '5 Questions Before an Argument', subtitulo: 'Antes de reagir.', subtitulo_en: 'What to ask yourself before reacting.', preco: '€5', preco_original: '€15', capa: '/produtos/guia-06-perguntas-capa.png', badge: 'guia', destaque: false },
  { id: '15', slug: 'guia-07-teu', titulo: 'O que é mesmo teu', titulo_en: 'What Is Truly Yours', subtitulo: 'Separar o que persegues por herança.', subtitulo_en: 'Separating what you pursue for yourself from what you pursue by inheritance.', preco: '€5', preco_original: '€15', capa: '/produtos/guia-07-teu-capa.png', badge: 'guia · novo', destaque: false },
];

function getStaticProducts(locale: string): Produto[] {
  return CATALOGO.map(p => ({
    ...p,
    titulo: locale === 'en' ? p.titulo_en : p.titulo,
    subtitulo: locale === 'en' ? p.subtitulo_en : p.subtitulo,
  }));
}

async function listarProdutos(locale: string): Promise<Produto[]> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('produtos')
      .select('id, slug, titulo, subtitulo, preco, preco_original, capa, badge, destaque')
      .eq('publicado', true)
      .order('ordem', { ascending: true });
    const list = (data as Produto[]) ?? [];
    return list.length > 0 ? list : getStaticProducts(locale);
  } catch {
    return getStaticProducts(locale);
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://viviannedossantos.com';
  const title = locale === 'en' ? 'Shop' : 'Loja';
  const desc = locale === 'en'
    ? 'Ebooks, guides, and therapeutic resources by Vivianne dos Santos.'
    : 'Ebooks, guias e recursos terapêuticos por Vivianne dos Santos.';
  return {
    title: `${title} · Vivianne dos Santos`,
    description: desc,
    alternates: {
      canonical: `${url}${locale === 'en' ? '/en' : ''}/loja`,
      languages: { pt: `${url}/loja`, en: `${url}/en/loja` },
    },
  };
}

export default async function LojaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const produtos = await listarProdutos(locale);
  const isPt = locale === 'pt';

  return (
    <>
      <TopNav />
      <LangToggle />
      <main className="relative z-[2] max-w-[1060px] mx-auto px-7 pt-24 pb-20">
        <header className="text-center mb-14">
          <p className="text-[0.78rem] tracking-[0.32em] uppercase text-ocre mb-4">
            {isPt ? 'recursos' : 'resources'}
          </p>
          <h1 className="font-serif font-light text-creme text-[clamp(2.4rem,7vw,3.8rem)] leading-[1.05] tracking-[-0.01em] mb-5">
            {isPt ? 'Loja' : 'Shop'}
          </h1>
          <p className="font-serif italic text-creme-2 text-[clamp(1rem,3vw,1.18rem)] max-w-[520px] mx-auto">
            {isPt
              ? 'Guias, ebooks e travessias para fazeres por dentro, ao teu ritmo.'
              : 'Guides, ebooks and crossings to do from within, at your own pace.'}
          </p>
          <GotaMini className="w-[28px] h-[28px] mx-auto mt-7 opacity-60 block" />
        </header>

        {produtos.length === 0 ? (
          <p className="text-center text-creme-2/70 italic font-serif">
            {isPt ? 'Em breve.' : 'Coming soon.'}
          </p>
        ) : (() => {
          const ebooks = produtos.filter(p => p.badge?.toLowerCase().includes('ebook'));
          const guias = produtos.filter(p => p.badge?.toLowerCase().includes('guia') || (!p.badge?.toLowerCase().includes('ebook')));
          const filteredGuias = guias.filter(g => !ebooks.some(e => e.id === g.id));

          const renderCard = (p: Produto) => {
              const href = `${locale === 'en' ? '/en' : ''}/loja/${p.slug}`;
              return (
                <Link key={p.id} href={href} className="group block no-underline">
                  <div className={`overflow-hidden rounded-[18px] border transition-colors ${p.destaque ? 'border-ambar/50 group-hover:border-ambar' : 'border-ocre/25 group-hover:border-ambar/40'}`}>
                    {p.capa ? (
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <Image
                          src={p.capa}
                          alt={p.titulo}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          unoptimized={p.capa.endsWith('.svg')}
                        />
                        {p.badge && (
                          <span className="absolute top-4 left-4 bg-ambar text-terra text-[0.68rem] tracking-[0.12em] uppercase font-medium px-3 py-1.5 rounded-full">
                            {p.badge}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-[3/4] bg-terra-2/60 flex items-center justify-center">
                        <span className="text-creme-2/30 italic text-sm">sem capa</span>
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-serif font-light text-creme text-[1.25rem] leading-[1.2] mb-1.5 group-hover:text-ambar transition-colors">
                        {p.titulo}
                      </h3>
                      <p className="text-creme-2/70 text-[0.88rem] leading-[1.5] mb-4 line-clamp-2">
                        {p.subtitulo}
                      </p>
                      <div className="flex items-baseline gap-3">
                        <span className="text-ambar font-serif text-[1.15rem]">
                          {p.preco}
                        </span>
                        {p.preco_original && (
                          <span className="text-creme-2/50 text-[0.85rem] line-through">
                            {p.preco_original}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
          };

          return (
            <>
              {/* EBOOKS */}
              <section className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="font-serif font-light text-creme text-[1.6rem]">
                    {isPt ? 'Ebooks' : 'Ebooks'}
                  </h2>
                  <div className="flex-1 h-px bg-ocre/15" />
                  <span className="text-[0.72rem] tracking-[0.18em] uppercase text-ocre/50">
                    {ebooks.length} {isPt ? 'títulos' : 'titles'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                  {ebooks.map(renderCard)}
                </div>
              </section>

              {/* GUIAS */}
              {filteredGuias.length > 0 && (
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <h2 className="font-serif font-light text-creme text-[1.6rem]">
                      {isPt ? 'Guias práticos' : 'Practical Guides'}
                    </h2>
                    <div className="flex-1 h-px bg-ocre/15" />
                    <span className="text-[0.72rem] tracking-[0.18em] uppercase text-ocre/50">
                      {filteredGuias.length} {isPt ? 'títulos' : 'titles'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                    {filteredGuias.map(renderCard)}
                  </div>
                </section>
              )}

              {/* TRAVESSIAS */}
              <section className="mt-16">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="font-serif font-light text-creme text-[1.6rem]">
                    {isPt ? 'Travessias' : 'Crossings'}
                  </h2>
                  <div className="flex-1 h-px bg-ocre/15" />
                  <span className="text-[0.72rem] tracking-[0.18em] uppercase text-ocre/50">
                    {isPt ? 'programas guiados' : 'guided programs'}
                  </span>
                </div>
                <p className="text-creme-2/70 text-[0.92rem] leading-[1.6] mb-8 max-w-[600px]">
                  {isPt
                    ? 'Os ebooks e guias dão-te o mapa. As travessias são o caminho, com acompanhamento.'
                    : 'The ebooks and guides give you the map. The crossings are the path, with guidance.'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { key: 'freeme', href: 'https://freeme.viviannedossantos.com', badge: isPt ? 'a travessia da mãe' : 'the mother\'s crossing', titulo: 'FreeMe', texto: isPt ? 'Pousa o que não era teu para carregar. Uma travessia terapêutica guiada para mães que vivem com culpa, lealdades invisíveis e o peso de gerações.' : 'Put down what was never yours to carry. A guided therapeutic crossing for mothers living with guilt, invisible loyalties, and generational weight.', accent: 'border-bordeaux/40 hover:border-bordeaux' },
                    { key: 'infonte', href: 'https://infonte.viviannedossantos.com', badge: isPt ? 'a fonte interior' : 'the inner source', titulo: 'Infonte', texto: isPt ? 'Distingue o que realmente procuras. Para a mulher que faz demais, tem talento a mais e clareza a menos. Pára de perseguir o que não é teu.' : 'Distinguish what you truly seek. For the woman who does too much, has too much talent and too little clarity. Stop chasing what isn\'t yours.', accent: 'border-ocre/40 hover:border-ambar' },
                    { key: 'synchim', href: 'https://synchim.viviannedossantos.com', badge: isPt ? 'o amor que dessincronizou' : 'the love that fell out of sync', titulo: 'SyncHim', texto: isPt ? 'Vê o nó invisível do casal. Para casais que repetem a mesma discussão e querem ir para além da superfície.' : 'See the invisible knot in the couple. For couples who keep repeating the same argument and want to go beyond the surface.', accent: 'border-rosa/40 hover:border-rosa' },
                    { key: 'escola', href: 'https://escoladosveus.space', badge: isPt ? 'a escola' : 'the school', titulo: 'Escola dos Véus', texto: isPt ? 'Os cursos de transformação. Atravessa cada véu que te separa de quem és.' : 'The courses of transformation. Cross each veil that separates you from who you are.', accent: 'border-lila/40 hover:border-lila' },
                  ].map(t => (
                    <a
                      key={t.key}
                      href={t.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group block no-underline rounded-[18px] border ${t.accent} p-6 transition-all hover:-translate-y-0.5`}
                      style={{ background: 'linear-gradient(160deg, rgba(58,40,24,0.7), rgba(42,28,18,0.4))' }}
                    >
                      <span className="block text-[0.68rem] tracking-[0.2em] uppercase text-ocre/70 mb-2">
                        {t.badge}
                      </span>
                      <h3 className="font-serif font-normal text-creme text-[1.4rem] mb-2 group-hover:text-ambar transition-colors">
                        {t.titulo}
                      </h3>
                      <p className="text-creme-2/70 text-[0.85rem] leading-[1.55]">
                        {t.texto}
                      </p>
                      <span className="block mt-4 text-ocre/60 text-[0.78rem] group-hover:text-ambar transition-colors">
                        {isPt ? 'saber mais →' : 'learn more →'}
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            </>
          );
        })()}
      </main>
    </>
  );
}
