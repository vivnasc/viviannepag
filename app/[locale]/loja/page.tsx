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

const PRODUTOS_STATIC: Produto[] = [
  { id: '1', slug: 'ebook-01-culpa', titulo: 'A culpa não é boa conselheira', subtitulo: 'Porque te sentes sempre em falta com os teus filhos, e o que essa culpa te está a impedir de fazer.', preco: '$7', preco_original: '$29', capa: '/produtos/ebook-01-culpa-capa.png', badge: 'ebook', destaque: true },
  { id: '2', slug: 'ebook-02-herdaste', titulo: 'O que herdaste sem saber', subtitulo: 'As lealdades invisíveis: porque repetes o que juraste nunca repetir.', preco: '$7', preco_original: '$29', capa: '/produtos/ebook-02-herdaste-capa.png', badge: 'ebook', destaque: true },
  { id: '3', slug: 'guia-01-meu', titulo: 'O que é meu, o que não é meu', subtitulo: 'Um exercício para parares de carregar o que nunca foi teu.', preco: '$5', preco_original: '$15', capa: '/produtos/guia-01-meu-capa.png', badge: 'guia', destaque: false },
  { id: '4', slug: 'guia-02-frases', titulo: '7 frases para dizer não sem culpa', subtitulo: 'Como pôr limites ao teu filho com amor e firmeza.', preco: '$5', preco_original: '$15', capa: '/produtos/guia-02-frases-capa.png', badge: 'guia', destaque: false },
  { id: '5', slug: 'ebook-03-quemes', titulo: 'Quem és para além do que fazes', subtitulo: 'A diferença entre a tua identidade e os teus papéis.', preco: '$7', preco_original: '$29', capa: '/produtos/ebook-03-quemes-capa.png', badge: 'ebook', destaque: false },
  { id: '6', slug: 'ebook-04-sentido', titulo: 'O sentido que procuras', subtitulo: 'Porque o sucesso não preenche, e o que fazer com o vazio que fica.', preco: '$7', preco_original: '$29', capa: '/produtos/ebook-04-sentido-capa.png', badge: 'ebook', destaque: false },
  { id: '7', slug: 'ebook-05-escuro', titulo: 'Atravessar o escuro', subtitulo: 'As crises não são só doença. Às vezes são passagem.', preco: '$7', preco_original: '$29', capa: '/produtos/ebook-05-escuro-capa.png', badge: 'ebook', destaque: false },
  { id: '8', slug: 'ebook-06-no-casal', titulo: 'O nó invisível do casal', subtitulo: 'O que está por baixo das discussões que se repetem sempre.', preco: '$7', preco_original: '$29', capa: '/produtos/ebook-06-no-casal-capa.png', badge: 'ebook', destaque: false },
  { id: '9', slug: 'ebook-07-sonho', titulo: 'Nem todo o sonho que carregas nasceu em ti', subtitulo: 'Porque alcanças o que querias e continuas a sentir que falta.', preco: '$7', preco_original: '$29', capa: '/produtos/ebook-07-sonho-capa.png', badge: 'ebook · novo', destaque: true },
  { id: '10', slug: 'ebook-08-voz', titulo: 'De quem é esta voz?', subtitulo: 'Quem decidiu, na tua vida, o que conta como sucesso?', preco: '$7', preco_original: '$29', capa: '/produtos/ebook-08-voz-capa.png', badge: 'ebook · novo', destaque: true },
  { id: '11', slug: 'guia-03-presenca', titulo: 'Práticas de presença para o dia a dia', subtitulo: 'Pequenas pausas que te trazem de volta a ti.', preco: '$5', preco_original: '$15', capa: '/produtos/guia-03-presenca-capa.png', badge: 'guia', destaque: false },
  { id: '12', slug: 'guia-04-mente', titulo: 'Esvaziar a mente em 3 passos', subtitulo: 'Um método rápido para parar a roda de pensamentos.', preco: '$5', preco_original: '$15', capa: '/produtos/guia-04-mente-capa.png', badge: 'guia', destaque: false },
  { id: '13', slug: 'guia-05-luto', titulo: 'Ritual para o luto que ninguém vê', subtitulo: 'Para as perdas que não tiveram funeral.', preco: '$5', preco_original: '$15', capa: '/produtos/guia-05-luto-capa.png', badge: 'guia', destaque: false },
  { id: '14', slug: 'guia-06-perguntas', titulo: 'As 5 perguntas antes de uma discussão', subtitulo: 'O que te perguntar antes de reagir.', preco: '$5', preco_original: '$15', capa: '/produtos/guia-06-perguntas-capa.png', badge: 'guia', destaque: false },
  { id: '15', slug: 'guia-07-teu', titulo: 'O que é mesmo teu', subtitulo: 'Separar o que persegues por ti do que persegues por herança.', preco: '$5', preco_original: '$15', capa: '/produtos/guia-07-teu-capa.png', badge: 'guia · novo', destaque: false },
];

async function listarProdutos(): Promise<Produto[]> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('produtos')
      .select('id, slug, titulo, subtitulo, preco, preco_original, capa, badge, destaque')
      .eq('publicado', true)
      .order('ordem', { ascending: true });
    const list = (data as Produto[]) ?? [];
    return list.length > 0 ? list : PRODUTOS_STATIC;
  } catch {
    return PRODUTOS_STATIC;
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
  const produtos = await listarProdutos();
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {produtos.map((p) => {
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
            })}
          </div>
        )}
      </main>
    </>
  );
}
