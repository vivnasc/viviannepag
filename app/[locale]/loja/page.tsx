import Link from 'next/link';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LangToggle } from '@/components/LangToggle';
import { TopNav } from '@/components/TopNav';
import { getSupabase } from '@/lib/supabase';
import { GotaMini } from '@/components/icons/GotaAssina';
import { COLECOES, COLECOES_ORDENADAS, COLECOES_EM_BREVE, ABERTURA_UNIVERSO, slugToColecao, type ColecaoId } from '@/lib/colecoes';
import { LojaSidebar } from '@/components/loja/LojaSidebar';
import { AberturaExpandivel } from '@/components/loja/AberturaExpandivel';
import { AdicionarCarrinho } from '@/components/AdicionarCarrinho';
import { FiltrosLoja } from '@/components/loja/FiltrosLoja';
import { MontaPack } from '@/components/loja/MontaPack';
import { semTravessoes } from '@/lib/escritos-sanitize';
import { PRODUTOS_EN } from '@/lib/produtos-en';
import { PACKS } from '@/lib/packs';
import type { Metadata } from 'next';

// Forca dynamic — quando produtos.capa muda na DB (apos render-ebook),
// a loja vai buscar SEMPRE a versao mais recente, sem cache estatica.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  { id: '16', slug: 'guia-08-culpa', titulo: "A culpa que não tem origem", titulo_en: "The Guilt That Has No Origin", subtitulo: "Encontrar a culpa que sentes mas não cometeste, e devolvê-la.", subtitulo_en: "Find the guilt you feel but never earned, and give it back.", preco: '€5', preco_original: '€15', capa: '/produtos/guia-08-culpa-capa.png', badge: 'guia · novo', destaque: false },
  { id: '17', slug: 'guia-09-meta', titulo: "De quem é esta meta?", titulo_en: "Whose Goal Is This?", subtitulo: "Parar a corrida do nunca-é-suficiente.", subtitulo_en: "Stop the race of never-enough.", preco: '€5', preco_original: '€15', capa: '/produtos/guia-09-meta-capa.png', badge: 'guia · novo', destaque: false },
  { id: '18', slug: 'guia-10-receber', titulo: "Aprender a receber", titulo_en: "Learning to Receive", subtitulo: "5 práticas para deixares entrar o que já é teu.", subtitulo_en: "5 practices to let in what is already yours.", preco: '€5', preco_original: '€15', capa: '/produtos/guia-10-receber-capa.png', badge: 'guia · novo', destaque: false },
  { id: '19', slug: 'guia-11-intensidade', titulo: "Amor ou intensidade?", titulo_en: "Love or Intensity?", subtitulo: "Um teste honesto antes de te entregares.", subtitulo_en: "An honest test before you give yourself.", preco: '€5', preco_original: '€15', capa: '/produtos/guia-11-intensidade-capa.png', badge: 'guia · novo', destaque: false },
  { id: '20', slug: 'guia-12-lugar', titulo: "O teu lugar à mesa", titulo_en: "Your Place at the Table", subtitulo: "Ocupar o que é teu sem pedir licença.", subtitulo_en: "Take your place without asking permission.", preco: '€5', preco_original: '€15', capa: '/produtos/guia-12-lugar-capa.png', badge: 'guia · novo', destaque: false },
  { id: '21', slug: 'guia-13-guarda', titulo: "Baixar a guarda em segurança", titulo_en: "Lowering Your Guard Safely", subtitulo: "Pequenos gestos para quem não pode falhar.", subtitulo_en: "Small gestures for those who cannot fail.", preco: '€5', preco_original: '€15', capa: '/produtos/guia-13-guarda-capa.png', badge: 'guia · novo', destaque: false },
  { id: '22', slug: 'guia-14-parar', titulo: "Quem és quando paras", titulo_en: "Who You Are When You Stop", subtitulo: "Separar o teu valor do que produzes.", subtitulo_en: "Separate your worth from what you produce.", preco: '€5', preco_original: '€15', capa: '/produtos/guia-14-parar-capa.png', badge: 'guia · novo', destaque: false },
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
    if (list.length === 0) return getStaticProducts(locale);
    // A tabela 'produtos' so guarda PT. Em EN, sobrepoe so o texto (titulo/
    // subtitulo). A capa e a mesma — e so a foto, sem texto, igual nos 2 idiomas.
    if (locale === 'en') {
      return list.map((p) => {
        const en = PRODUTOS_EN[p.slug];
        return en ? { ...p, titulo: en.titulo, subtitulo: en.subtitulo } : p;
      });
    }
    return list;
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
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tipo?: string; ordenar?: string }>;
}) {
  const { locale } = await params;
  const { tipo, ordenar } = await searchParams;
  setRequestLocale(locale);
  // Regra de zero travessoes em todo o site: limpa titulo/subtitulo seja qual for a fonte.
  const todosProdutos = (await listarProdutos(locale)).map((p) => ({
    ...p,
    titulo: semTravessoes(p.titulo),
    subtitulo: semTravessoes(p.subtitulo),
  }));
  // Filtro por tipo (ebook/guia) via badge. 'todos' ou ausente = sem filtro.
  const produtos = (tipo === 'ebook' || tipo === 'guia')
    ? todosProdutos.filter(p => p.badge?.toLowerCase().includes(tipo))
    : todosProdutos;
  const isPt = locale === 'pt';

  return (
    <>
      <TopNav />
      <LangToggle />
      <main className="relative z-[2] max-w-[1280px] mx-auto px-7 pt-24 pb-20 lg:flex lg:gap-10">
        <LojaSidebar
          locale={locale}
          produtos={todosProdutos.map(p => ({ slug: p.slug, titulo: p.titulo, subtitulo: p.subtitulo, badge: p.badge }))}
          itens={COLECOES_ORDENADAS.map(c => {
            const count = todosProdutos.filter(p => slugToColecao(p.slug) === c.id).length;
            return { id: c.id, romano: c.romano, nome: isPt ? c.nome : c.nome_en, count, ativo: c.estado !== 'em-breve' || count > 0 };
          })}
        />
        <div className="flex-1 min-w-0">
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

        <FiltrosLoja locale={locale} />

        {produtos.length === 0 ? (
          <p className="text-center text-creme-2/70 italic font-serif">
            {isPt ? 'Nada com este filtro.' : 'Nothing with this filter.'}
          </p>
        ) : (() => {
          // Agrupa produtos por colecao
          const porColecao = new Map<ColecaoId, typeof produtos>();
          for (const p of produtos) {
            const id = slugToColecao(p.slug);
            const lista = porColecao.get(id) ?? [];
            lista.push(p);
            porColecao.set(id, lista);
          }
          // Ordenacao dentro de cada colecao. Por preco quando pedido; senao
          // ebooks primeiro, depois guias, por destaque + slug.
          const precoN = (s: string | null) => parseFloat((s ?? '').replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
          for (const [id, lista] of porColecao) {
            lista.sort((a, b) => {
              if (ordenar === 'preco-asc') return precoN(a.preco) - precoN(b.preco);
              if (ordenar === 'preco-desc') return precoN(b.preco) - precoN(a.preco);
              const aEb = a.badge?.toLowerCase().includes('ebook') ? 0 : 1;
              const bEb = b.badge?.toLowerCase().includes('ebook') ? 0 : 1;
              if (aEb !== bEb) return aEb - bEb;
              if (a.destaque !== b.destaque) return a.destaque ? -1 : 1;
              return a.slug.localeCompare(b.slug);
            });
            porColecao.set(id, lista);
          }

          const renderCard = (p: Produto) => {
              const href = `${locale === 'en' ? '/en' : ''}/loja/${p.slug}`;
              return (
                <div key={p.id} className="relative">
                <AdicionarCarrinho variante="overlay" item={{ slug: p.slug, titulo: p.titulo, preco: p.preco, capa: p.capa, badge: p.badge }} />
                <Link href={href} className="group block no-underline">
                  <div className={`overflow-hidden rounded-[18px] border transition-colors ${p.destaque ? 'border-ambar/50 group-hover:border-ambar' : 'border-ocre/25 group-hover:border-ambar/40'}`}>
                    {p.capa ? (
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <Image
                          src={p.capa}
                          alt={p.titulo}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          unoptimized
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
                </div>
              );
          };

          // Capas do pack = mosaico das capas reais (foto) dos livros do universo
          // (ate 4). Para 'all', uma de cada universo, para variedade.
          const capasPack = (colecao: ColecaoId | 'all'): string[] => {
            if (colecao === 'all') {
              return COLECOES_ORDENADAS
                .map(c => todosProdutos.find(p => slugToColecao(p.slug) === c.id && p.capa)?.capa)
                .filter((u): u is string => Boolean(u))
                .slice(0, 4);
            }
            return todosProdutos
              .filter(p => slugToColecao(p.slug) === colecao && p.capa)
              .map(p => p.capa as string)
              .slice(0, 4);
          };

          // Card de pack com mosaico 2x2 + poupanca. Mesma moldura/overlay do renderCard.
          const precoNumLoja = (s: string | null) => parseFloat((s ?? '').replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
          const renderPackCard = (pk: typeof PACKS[number]) => {
            const titulo = isPt ? pk.titulo : pk.titulo_en;
            const subtitulo = isPt ? pk.subtitulo : pk.subtitulo_en;
            const href = `${locale === 'en' ? '/en' : ''}/loja/${pk.slug}`;
            const mosaico = capasPack(pk.colecao);
            const poup = pk.preco_original ? Math.round(precoNumLoja(pk.preco_original) - precoNumLoja(pk.preco)) : 0;
            const ehTudo = pk.colecao === 'all';
            return (
              <div key={pk.slug} className="relative">
                <AdicionarCarrinho variante="overlay" item={{ slug: pk.slug, titulo, preco: pk.preco, capa: mosaico[0] ?? null, badge: pk.badge }} />
                <Link href={href} className="group block no-underline">
                  <div className={`overflow-hidden rounded-[18px] border transition-colors ${ehTudo ? 'border-ambar/50 group-hover:border-ambar' : 'border-ocre/25 group-hover:border-ambar/40'}`}>
                    <div className="relative aspect-[3/4] overflow-hidden bg-terra-2/60">
                      <div className="grid grid-cols-2 grid-rows-2 gap-[2px] w-full h-full">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="relative overflow-hidden">
                            {mosaico[i % (mosaico.length || 1)] && (
                              <Image src={mosaico[i % mosaico.length]} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" unoptimized />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-terra/80 via-transparent to-transparent" />
                      <span className="absolute top-4 left-4 bg-ambar text-terra text-[0.68rem] tracking-[0.12em] uppercase font-medium px-3 py-1.5 rounded-full">
                        {pk.badge}
                      </span>
                      <span className="absolute bottom-4 left-4 right-4 font-serif text-creme text-[1.05rem] leading-tight drop-shadow">
                        {titulo}
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="text-creme-2/70 text-[0.88rem] leading-[1.5] mb-4 line-clamp-2">{subtitulo}</p>
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-ambar font-serif text-[1.15rem]">{pk.preco}</span>
                        {pk.preco_original && <span className="text-creme-2/50 text-[0.85rem] line-through">{pk.preco_original}</span>}
                        {poup > 0 && <span className="text-ouro text-[0.72rem] font-semibold">{isPt ? `poupas €${poup}` : `save €${poup}`}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          };

          // 'Em breve' = so colecoes sem produtos publicados (as que ja tem
          // produtos passam a aparecer como bloco normal acima).
          const emBreveSemProdutos = COLECOES_EM_BREVE.filter(
            c => (porColecao.get(c.id)?.length ?? 0) === 0,
          );

          return (
            <>
              {/* ABERTURA DO UNIVERSO (teaser + ler completa) */}
              {isPt && (
                <section className="mb-14 text-center">
                  <p className="text-[0.72rem] tracking-[0.32em] uppercase text-ouro/80 mb-3">
                    {ABERTURA_UNIVERSO.subtitulo}
                  </p>
                  <h2 className="font-serif font-light text-creme text-[clamp(1.6rem,4vw,2.2rem)] leading-[1.18] mb-6">
                    {ABERTURA_UNIVERSO.titulo}
                  </h2>
                  <AberturaExpandivel
                    teaser={ABERTURA_UNIVERSO.teaser}
                    texto={ABERTURA_UNIVERSO.texto}
                    assinatura={ABERTURA_UNIVERSO.assinatura}
                    align="center"
                  />
                  <div className="mt-8 mx-auto w-[60px] h-px bg-ouro/40" />
                </section>
              )}

              {/* NAV ANCORA DAS COLECOES */}
              <nav className="mb-14 flex flex-wrap justify-center gap-2">
                {COLECOES_ORDENADAS.map(c => {
                  const count = porColecao.get(c.id)?.length ?? 0;
                  const ativo = c.estado !== 'em-breve' || count > 0;
                  return (
                    <a
                      key={c.id}
                      href={`#colecao-${c.id}`}
                      className={`text-[0.74rem] px-3 py-1.5 rounded-full border transition-colors no-underline ${
                        ativo
                          ? 'border-ocre/40 text-creme hover:border-ambar hover:text-ambar'
                          : 'border-creme-2/25 text-creme-2/65'
                      }`}
                    >
                      <span className="opacity-50 mr-1">{c.romano}</span>
                      {isPt ? c.nome : c.nome_en}
                      {count > 0 && <span className="ml-1.5 opacity-50">· {count}</span>}
                    </a>
                  );
                })}
              </nav>

              {/* TRAVESSIAS */}
              <section className="mb-20">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="font-serif font-light text-creme text-[1.6rem]">
                    {isPt ? 'Travessias' : 'Crossings'}
                  </h2>
                  <div className="flex-1 h-px bg-ocre/25" />
                  <span className="text-[0.72rem] tracking-[0.18em] uppercase text-ocre">
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
                      <p className="text-creme-2/85 text-[0.88rem] leading-[1.55]">
                        {t.texto}
                      </p>
                      <span className="block mt-4 text-ambar/90 text-[0.82rem] group-hover:text-ambar transition-colors">
                        {isPt ? 'saber mais →' : 'learn more →'}
                      </span>
                    </a>
                  ))}
                </div>
              </section>

              {/* PACKS — COLECOES COMPLETAS (subido: melhor oferta, ve-se primeiro) */}
              <section id="packs" className="mb-20 scroll-mt-24">
                <div className="flex items-center gap-4 mb-3">
                  <h2 className="font-serif font-light text-creme text-[1.7rem]">
                    {isPt ? 'Coleções completas' : 'Complete collections'}
                  </h2>
                  <div className="flex-1 h-px bg-ocre/25" />
                  <span className="text-[0.72rem] tracking-[0.18em] uppercase text-ocre">
                    {isPt ? 'poupa em pack' : 'save in a bundle'}
                  </span>
                </div>
                <p className="text-creme-2/80 text-[0.95rem] leading-[1.6] mb-8 max-w-[640px]">
                  {isPt
                    ? 'Leva um universo inteiro num só acesso, por uma fração do valor avulso. Ou a biblioteca completa, os sete universos juntos.'
                    : 'Take a whole world in one access, for a fraction of the individual price. Or the complete library, all seven worlds together.'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                  {PACKS.map((pk) => renderPackCard(pk))}
                </div>
              </section>

              {/* MONTA O TEU PACK — a pessoa escolhe so os livros que quer */}
              <MontaPack
                isPt={isPt}
                universos={COLECOES_ORDENADAS
                  .filter((c) => (porColecao.get(c.id)?.length ?? 0) > 0)
                  .map((c) => ({
                    id: c.id,
                    nome: isPt ? c.nome : c.nome_en,
                    livros: (porColecao.get(c.id) ?? []).map((p) => ({ slug: p.slug, titulo: p.titulo, preco: p.preco, capa: p.capa, badge: p.badge })),
                  }))}
              />

              {/* BLOCO POR COLECAO — qualquer universo com produtos publicados
                  aparece (mesmo os marcados 'em-breve' em colecoes.ts). Assim,
                  renderizar um universo basta para ele surgir na loja. */}
              {COLECOES_ORDENADAS.filter(c => (porColecao.get(c.id)?.length ?? 0) > 0).map(c => {
                const lista = porColecao.get(c.id) ?? [];
                if (lista.length === 0) return null;
                return (
                  <section key={c.id} id={`colecao-${c.id}`} className="mb-20 scroll-mt-24">
                    <div className="mb-8">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="font-serif text-ocre text-[1.05rem]">{c.romano}</span>
                        <h2 className="font-serif font-light text-creme text-[1.7rem]">
                          {isPt ? c.nome : c.nome_en}
                        </h2>
                        <div className="flex-1 h-px bg-ocre/25 mx-2" />
                        <span className="text-[0.72rem] tracking-[0.18em] uppercase text-ocre">
                          {lista.length} {isPt ? (lista.length === 1 ? 'título' : 'títulos') : (lista.length === 1 ? 'title' : 'titles')}
                        </span>
                      </div>
                      <p className="text-creme-2/90 text-[0.95rem] leading-[1.6] max-w-[640px]">
                        {isPt ? c.pitch : c.pitch_en}
                      </p>
                      <p className="text-ocre/85 text-[0.78rem] tracking-[0.05em] mt-2">
                        {isPt ? c.feridas : c.feridas_en}
                      </p>
                    </div>

                    {/* Abertura comum da colecao — teaser + ler completa */}
                    {(c.aberturaTeaser || c.abertura) && isPt && (
                      <div className="mb-9 rounded-[14px] border-l-2 border-ambar/40 pl-6 py-1">
                        <AberturaExpandivel
                          titulo={c.aberturaTitulo}
                          teaser={c.aberturaTeaser}
                          texto={c.abertura}
                          assinatura={c.aberturaAssinatura}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                      {lista.map(renderCard)}
                    </div>
                    {c.travessia && (
                      <p className="text-[0.82rem] text-creme-2/80 mt-6">
                        {isPt ? 'Travessia desta coleção: ' : 'Crossing for this collection: '}
                        <a href={c.travessia} target="_blank" rel="noopener noreferrer" className="text-ambar hover:underline font-medium">
                          {c.nome} →
                        </a>
                      </p>
                    )}
                  </section>
                );
              })}

              {/* COLECOES EM BREVE */}
              {emBreveSemProdutos.length > 0 && (
                <section className="mb-20">
                  <div className="flex items-center gap-4 mb-8">
                    <h2 className="font-serif font-light text-creme text-[1.4rem]">
                      {isPt ? 'Em breve' : 'Coming soon'}
                    </h2>
                    <div className="flex-1 h-px bg-ocre/15" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {emBreveSemProdutos.map(c => (
                      <div
                        key={c.id}
                        id={`colecao-${c.id}`}
                        className="rounded-[18px] border border-creme-2/30 p-5 scroll-mt-24"
                      >
                        <div className="flex items-baseline gap-2 mb-1.5">
                          <span className="font-serif text-ocre/80 text-[0.95rem]">{c.romano}</span>
                          <h3 className="font-serif text-creme/90 text-[1.18rem]">
                            {isPt ? c.nome : c.nome_en}
                          </h3>
                        </div>
                        <p className="text-creme-2/80 text-[0.88rem] leading-[1.55]">
                          {isPt ? c.pitch : c.pitch_en}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          );
        })()}
        </div>
      </main>
    </>
  );
}
