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
import { packBySlug, isPackSlug, packIncluiProduto, PACKS } from '@/lib/packs';
import { semTravessoes } from '@/lib/escritos-sanitize';
import { slugToColecao } from '@/lib/colecoes';
import { AdicionarCarrinho } from '@/components/AdicionarCarrinho';
import { BarraCompraMobile } from '@/components/BarraCompraMobile';
import { PRODUTOS_EN, type ProdutoEN } from '@/lib/produtos-en';
import { getRomance } from '@/lib/romances';
import {
  isRomanceSlug,
  romanceProdutoEn,
  romanceSubtituloPt,
  romanceDescricaoPt,
  PRECO_ROMANCE,
  ROMANCE_BADGE,
} from '@/lib/romance-produto';
import { romancePdfPronto, romanceCapaUrl } from '@/lib/romance-loja';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
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

type FallbackItem = { titulo: string; titulo_en: string; subtitulo: string; subtitulo_en: string; descricao: string; descricao_en: string; preco: string; preco_original: string; capa: string; badge: string };

const CATALOGO: Record<string, FallbackItem> = {
  'ebook-01-culpa': { titulo: 'A culpa não é boa conselheira', titulo_en: 'Guilt Is Not a Good Advisor', subtitulo: 'Porque te sentes sempre em falta com os teus filhos.', subtitulo_en: 'Why you always feel like you\'re falling short with your kids.', descricao: '**Ebook · ~50 páginas · PDF imediato**\n\n**Capítulos:** A coisa que sentes e nunca disseste · Ninguém fala da culpa da mãe · Sentir culpa não te torna má mãe · O que a culpa te faz fazer · De onde vem a tua culpa · Culpa não é responsabilidade · Há um caminho de volta · A travessia\n\n> *Tu sabes do que estou a falar. Aquela sensação que aparece quando te deitas e a casa finalmente está em silêncio.*', descricao_en: '**Ebook · ~50 pages · Immediate PDF**\n\n**Chapters:** The thing you feel and never said · Nobody talks about mother\'s guilt · Feeling guilt doesn\'t make you a bad mother · What guilt makes you do · Where your guilt comes from · Guilt is not responsibility · There is a way back · The crossing\n\n> *You know what I\'m talking about. That feeling that shows up when you lie down and the house is finally quiet.*', preco: '€7', preco_original: '€29', capa: '/produtos/ebook-01-culpa-capa.png', badge: 'ebook' },
  'ebook-02-herdaste': { titulo: 'O que herdaste sem saber', titulo_en: 'What You Inherited Without Knowing', subtitulo: 'As lealdades invisíveis: porque repetes o que juraste nunca repetir.', subtitulo_en: 'Invisible loyalties: why you repeat what you swore you\'d never repeat.', descricao: '**Ebook · 8 capítulos · PDF imediato**\n\n> *Abres a boca e sai aquela frase. Com aquele tom. É a voz da tua mãe.*', descricao_en: '**Ebook · 8 chapters · Immediate PDF**\n\n> *You open your mouth and that phrase comes out. With that tone. It\'s your mother\'s voice.*', preco: '€7', preco_original: '€29', capa: '/produtos/ebook-02-herdaste-capa.png', badge: 'ebook' },
  'guia-01-meu': { titulo: 'O que é meu, o que não é meu', titulo_en: 'What Is Mine, What Is Not Mine', subtitulo: 'Um exercício para parares de carregar o que nunca foi teu.', subtitulo_en: 'An exercise to stop carrying what was never yours.', descricao: '**Guia prático · PDF imediato**\n\nExercício de duas colunas: o que é teu vs. o que carregas por outros.', descricao_en: '**Practical guide · Immediate PDF**\n\nTwo-column exercise: what is yours vs. what you carry for others.', preco: '€5', preco_original: '€15', capa: '/produtos/guia-01-meu-capa.png', badge: 'guia' },
  'guia-02-frases': { titulo: '7 frases para dizer não sem culpa', titulo_en: '7 Phrases to Say No Without Guilt', subtitulo: 'Limites com amor e firmeza.', subtitulo_en: 'Boundaries with love and firmness.', descricao: '**Guia prático · PDF imediato**\n\n7 frases prontas para quando o teu filho testa os limites.', descricao_en: '**Practical guide · Immediate PDF**\n\n7 ready-to-use phrases for when your child tests boundaries.', preco: '€5', preco_original: '€15', capa: '/produtos/guia-02-frases-capa.png', badge: 'guia' },
  'ebook-03-quemes': { titulo: 'Quem és para além do que fazes', titulo_en: 'Who You Are Beyond What You Do', subtitulo: 'A diferença entre identidade e papéis.', subtitulo_en: 'The difference between identity and roles.', descricao: '**Ebook · 7 capítulos · PDF imediato**\n\n> *Houve um momento em que deixaste de saber quem és.*', descricao_en: '**Ebook · 7 chapters · Immediate PDF**\n\n> *There was a moment when you stopped knowing who you are.*', preco: '€7', preco_original: '€29', capa: '/produtos/ebook-03-quemes-capa.png', badge: 'ebook' },
  'ebook-04-sentido': { titulo: 'O sentido que procuras', titulo_en: 'The Meaning You Are Looking For', subtitulo: 'Porque o sucesso não preenche.', subtitulo_en: 'Why success doesn\'t fill the void.', descricao: '**Ebook · 6 capítulos · PDF imediato**\n\nTens tudo e sentes que falta.', descricao_en: '**Ebook · 6 chapters · Immediate PDF**\n\nYou have everything and still feel something is missing.', preco: '€7', preco_original: '€29', capa: '/produtos/ebook-04-sentido-capa.png', badge: 'ebook' },
  'ebook-05-escuro': { titulo: 'Atravessar o escuro', titulo_en: 'Crossing the Dark', subtitulo: 'As crises como passagem.', subtitulo_en: 'Crises as passage.', descricao: '**Ebook · 6 capítulos · PDF imediato**\n\n> *Há um lugar para onde ninguém quer ir.*', descricao_en: '**Ebook · 6 chapters · Immediate PDF**\n\n> *There is a place nobody wants to go.*', preco: '€7', preco_original: '€29', capa: '/produtos/ebook-05-escuro-capa.png', badge: 'ebook' },
  'ebook-06-no-casal': { titulo: 'O nó invisível do casal', titulo_en: 'The Invisible Knot in the Couple', subtitulo: 'O que está por baixo das discussões.', subtitulo_en: 'What lies beneath the arguments that keep repeating.', descricao: '**Ebook · 6 capítulos · PDF imediato**\n\n> *Tu sabes qual é. A mesma discussão, sempre.*', descricao_en: '**Ebook · 6 chapters · Immediate PDF**\n\n> *You know which one. The same argument, always.*', preco: '€7', preco_original: '€29', capa: '/produtos/ebook-06-no-casal-capa.png', badge: 'ebook' },
  'ebook-07-sonho': { titulo: 'Nem todo o sonho que carregas nasceu em ti', titulo_en: 'Not Every Dream You Carry Was Born in You', subtitulo: 'Porque alcanças e continuas a sentir que falta.', subtitulo_en: 'Why you achieve what you wanted and still feel something is missing.', descricao: '**Ebook · 8 capítulos · PDF imediato**\n\n> *Tu fizeste tudo certo. Estudaste. Trabalhaste. E conseguiste coisas. Mas não sentes.*', descricao_en: '**Ebook · 8 chapters · Immediate PDF**\n\n> *You did everything right. You studied. You worked. And you achieved things. But you don\'t feel.*', preco: '€7', preco_original: '€29', capa: '/produtos/ebook-07-sonho-capa.png', badge: 'ebook · novo' },
  'ebook-08-voz': { titulo: 'De quem é esta voz?', titulo_en: 'Whose Voice Is This?', subtitulo: 'Quem decidiu o que conta como sucesso?', subtitulo_en: 'Who decided what counts as success in your life?', descricao: '**Ebook · 7 capítulos · PDF imediato**\n\n> *Há uma régua na tua vida. Mede tudo o que fazes. E nunca é suficiente.*', descricao_en: '**Ebook · 7 chapters · Immediate PDF**\n\n> *There is a ruler in your life. It measures everything you do. And it is never enough.*', preco: '€7', preco_original: '€29', capa: '/produtos/ebook-08-voz-capa.png', badge: 'ebook · novo' },
  'guia-03-presenca': { titulo: 'Práticas de presença para o dia a dia', titulo_en: 'Presence Practices for Everyday Life', subtitulo: 'Pequenas pausas que te trazem de volta.', subtitulo_en: 'Small pauses that bring you back to yourself.', descricao: '**Guia · PDF imediato**\n\n7 micro-práticas de presença.', descricao_en: '**Guide · Immediate PDF**\n\n7 micro-practices of presence.', preco: '€5', preco_original: '€15', capa: '/produtos/guia-03-presenca-capa.png', badge: 'guia' },
  'guia-04-mente': { titulo: 'Esvaziar a mente em 3 passos', titulo_en: 'Empty Your Mind in 3 Steps', subtitulo: 'Parar a roda de pensamentos.', subtitulo_en: 'Stop the thought wheel and return to focus.', descricao: '**Guia · PDF imediato**\n\nDespejar, separar, escolher.', descricao_en: '**Guide · Immediate PDF**\n\nDump, separate, choose.', preco: '€5', preco_original: '€15', capa: '/produtos/guia-04-mente-capa.png', badge: 'guia' },
  'guia-05-luto': { titulo: 'Ritual para o luto que ninguém vê', titulo_en: 'A Ritual for the Grief Nobody Sees', subtitulo: 'Para as perdas sem funeral.', subtitulo_en: 'For the losses that had no funeral.', descricao: '**Guia · PDF imediato**\n\nNomear, honrar, largar.', descricao_en: '**Guide · Immediate PDF**\n\nName, honor, release.', preco: '€5', preco_original: '€15', capa: '/produtos/guia-05-luto-capa.png', badge: 'guia' },
  'guia-06-perguntas': { titulo: 'As 5 perguntas antes de uma discussão', titulo_en: '5 Questions Before an Argument', subtitulo: 'Antes de reagir.', subtitulo_en: 'What to ask yourself before reacting.', descricao: '**Guia · PDF imediato**\n\n5 perguntas para o espaço entre estímulo e reação.', descricao_en: '**Guide · Immediate PDF**\n\n5 questions for the space between stimulus and reaction.', preco: '€5', preco_original: '€15', capa: '/produtos/guia-06-perguntas-capa.png', badge: 'guia' },
  'guia-07-teu': { titulo: 'O que é mesmo teu', titulo_en: 'What Is Truly Yours', subtitulo: 'Separar o que persegues por herança.', subtitulo_en: 'Separating what you pursue for yourself from inheritance.', descricao: '**Guia · PDF imediato**\n\nVerdade, herança, comparação, compensação.', descricao_en: '**Guide · Immediate PDF**\n\nTruth, inheritance, comparison, compensation.', preco: '€5', preco_original: '€15', capa: '/produtos/guia-07-teu-capa.png', badge: 'guia · novo' },
  'guia-08-culpa': { titulo: "A culpa que não tem origem", titulo_en: "The Guilt That Has No Origin", subtitulo: "Encontrar a culpa que sentes mas não cometeste, e devolvê-la.", subtitulo_en: "Find the guilt you feel but never earned, and give it back.", descricao: "**Guia · PDF imediato**\\n\\nReconhecer a culpa herdada ou absorvida, traçar a sua origem, e um exercício para a devolveres a quem pertence.", descricao_en: "**Guide · Immediate PDF**\\n\\nRecognise inherited or absorbed guilt, trace its origin, and an exercise to give it back to whom it belongs.", preco: '€5', preco_original: '€15', capa: '/produtos/guia-08-culpa-capa.png', badge: 'guia · novo' },
  'guia-09-meta': { titulo: "De quem é esta meta?", titulo_en: "Whose Goal Is This?", subtitulo: "Parar a corrida do nunca-é-suficiente.", subtitulo_en: "Stop the race of never-enough.", descricao: "**Guia · PDF imediato**\\n\\nVer as metas que persegues que nunca foram tuas, e um teste para saberes de quem são.", descricao_en: "**Guide · Immediate PDF**\\n\\nSee the goals you chase that were never yours, and a test to tell whose they are.", preco: '€5', preco_original: '€15', capa: '/produtos/guia-09-meta-capa.png', badge: 'guia · novo' },
  'guia-10-receber': { titulo: "Aprender a receber", titulo_en: "Learning to Receive", subtitulo: "5 práticas para deixares entrar o que já é teu.", subtitulo_en: "5 practices to let in what is already yours.", descricao: "**Guia · PDF imediato**\\n\\nPorque custa receber, o reflexo de devolver, e cinco práticas concretas para receberes.", descricao_en: "**Guide · Immediate PDF**\\n\\nWhy receiving costs you, the reflex to give back, and five concrete practices to receive.", preco: '€5', preco_original: '€15', capa: '/produtos/guia-10-receber-capa.png', badge: 'guia · novo' },
  'guia-11-intensidade': { titulo: "Amor ou intensidade?", titulo_en: "Love or Intensity?", subtitulo: "Um teste honesto antes de te entregares.", subtitulo_en: "An honest test before you give yourself.", descricao: "**Guia · PDF imediato**\\n\\nDistinguir o amor que faz bem do que só arde, com sinais de alerta de controlo e abuso.", descricao_en: "**Guide · Immediate PDF**\\n\\nTell love that does you good from love that only burns, with control and abuse red flags.", preco: '€5', preco_original: '€15', capa: '/produtos/guia-11-intensidade-capa.png', badge: 'guia · novo' },
  'guia-12-lugar': { titulo: "O teu lugar à mesa", titulo_en: "Your Place at the Table", subtitulo: "Ocupar o que é teu sem pedir licença.", subtitulo_en: "Take your place without asking permission.", descricao: "**Guia · PDF imediato**\\n\\nA cadeira a que não te sentas, e um exercício para ocupares o teu lugar por inteiro.", descricao_en: "**Guide · Immediate PDF**\\n\\nThe chair you don't sit in, and an exercise to take your place fully.", preco: '€5', preco_original: '€15', capa: '/produtos/guia-12-lugar-capa.png', badge: 'guia · novo' },
  'guia-13-guarda': { titulo: "Baixar a guarda em segurança", titulo_en: "Lowering Your Guard Safely", subtitulo: "Pequenos gestos para quem não pode falhar.", subtitulo_en: "Small gestures for those who cannot fail.", descricao: "**Guia · PDF imediato**\\n\\nA armadura que já não precisas, e gestos pequenos e seguros para a pousares.", descricao_en: "**Guide · Immediate PDF**\\n\\nThe armour you no longer need, and small safe gestures to set it down.", preco: '€5', preco_original: '€15', capa: '/produtos/guia-13-guarda-capa.png', badge: 'guia · novo' },
  'guia-14-parar': { titulo: "Quem és quando paras", titulo_en: "Who You Are When You Stop", subtitulo: "Separar o teu valor do que produzes.", subtitulo_en: "Separate your worth from what you produce.", descricao: "**Guia · PDF imediato**\\n\\nO valor preso ao fazer, quem és sem a tarefa, e um exercício para parares.", descricao_en: "**Guide · Immediate PDF**\\n\\nWorth chained to doing, who you are without the task, and an exercise to stop.", preco: '€5', preco_original: '€15', capa: '/produtos/guia-14-parar-capa.png', badge: 'guia · novo' },
};

function getFallback(slug: string, locale: string): Produto | null {
  const c = CATALOGO[slug];
  if (!c) return null;
  const isEn = locale === 'en';
  return {
    id: slug,
    slug,
    titulo: isEn ? c.titulo_en : c.titulo,
    subtitulo: isEn ? c.subtitulo_en : c.subtitulo,
    descricao: isEn ? c.descricao_en : c.descricao,
    preco: c.preco,
    preco_original: c.preco_original,
    capa: c.capa,
    checkout_url: null,
    badge: c.badge,
  };
}

function getPack(slug: string, locale: string): Produto | null {
  const pk = packBySlug(slug);
  if (!pk) return null;
  const isEn = locale === 'en';
  return {
    id: pk.slug,
    slug: pk.slug,
    titulo: isEn ? pk.titulo_en : pk.titulo,
    subtitulo: isEn ? pk.subtitulo_en : pk.subtitulo,
    descricao: isEn ? pk.descricao_en : pk.descricao,
    preco: pk.preco,
    preco_original: pk.preco_original,
    capa: pk.capa,
    checkout_url: null,
    badge: pk.badge,
  };
}

// Produtos incluidos num pack (publicados), com capa + subtitulo, para mostrar
// a colecao inteira na pagina do pack (ebooks primeiro). Aplica EN.
type ItemPack = { slug: string; titulo: string; subtitulo: string; capa: string | null; badge: string | null };
async function getPackConteudo(slug: string, locale: string): Promise<ItemPack[]> {
  const pk = packBySlug(slug);
  if (!pk) return [];
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('produtos')
      .select('slug, titulo, subtitulo, capa, badge')
      .eq('publicado', true);
    const isEn = locale === 'en';
    return ((data as ItemPack[] | null) ?? [])
      .filter((p) => packIncluiProduto(pk, p.slug))
      .map((p) => {
        if (!isEn) return p;
        const en = PRODUTOS_EN[p.slug];
        return { slug: p.slug, titulo: en?.titulo ?? p.titulo, subtitulo: en?.subtitulo ?? p.subtitulo, capa: p.capa, badge: p.badge };
      })
      .sort((a, b) => {
        const ae = a.badge?.toLowerCase().includes('ebook') ? 0 : 1;
        const be = b.badge?.toLowerCase().includes('ebook') ? 0 : 1;
        if (ae !== be) return ae - be;
        return a.slug.localeCompare(b.slug);
      });
  } catch {
    return [];
  }
}

// Romances de Véspera: produto montado a partir do Storage, sem linha na DB.
// Só existe (e só se vende) quando o miolo já está renderizado. Caso contrário
// devolve null → a página dá 404 e a landing continua a mostrar "chega em breve".
async function getRomanceProduto(slug: string, locale: string): Promise<Produto | null> {
  const r = getRomance(slug);
  if (!r) return null;
  if (!(await romancePdfPronto(slug))) return null;
  const isEn = locale === 'en';
  return {
    id: slug,
    slug,
    titulo: isEn ? r.tituloEn : r.titulo,
    subtitulo: isEn ? romanceProdutoEn(r).subtitulo : romanceSubtituloPt(r),
    descricao: isEn ? romanceProdutoEn(r).descricao : romanceDescricaoPt(r),
    preco: PRECO_ROMANCE,
    preco_original: null,
    capa: romanceCapaUrl(slug, isEn ? 'en' : 'pt'),
    checkout_url: null,
    badge: ROMANCE_BADGE,
  };
}

// Livros do Método VS (pilar + irmão + manuais): a capa vem da imagem da
// Vivianne no Supabase (livro-pilar/<slug>/capa-composta.png), a mesma da home;
// e NÃO pertencem ao pack FreeMe Mãe (não mostram banner de coleção).
const LIVROS_METODO = ['os-7-sinais', 'os-7-veus', 'ver-soltar', 'vir-soltar', 'viver-soltar'];
const SUPA_LOJA = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
// A capa segue o idioma (capa-composta-en.png em EN) e leva quebra de cache: a
// Vivianne carrega a capa nova no mesmo URL e o CDN do Supabase serve a antiga
// (~1h). Esta pagina e force-dynamic, por isso o ?v muda a cada pedido e a capa
// nova aparece logo. (Ver nota do cache no CLAUDE.md.)
const capaLivroMetodo = (slug: string, locale: string): string | null =>
  LIVROS_METODO.includes(slug) && SUPA_LOJA
    ? `${SUPA_LOJA}/storage/v1/object/public/viviannepag-assets/livro-pilar/${slug}/capa-composta${locale === 'en' ? '-en' : ''}.png?v=${Date.now()}`
    : null;

// Texto EN dos livros do Metodo VS (a DB so guarda PT). Sem isto, a pagina EN
// mostrava titulo/subtitulo/descricao em portugues. Voz da Vivianne: sem
// travessoes, sem abrir frases com "And".
const LIVROS_METODO_EN: Record<string, ProdutoEN> = {
  'os-7-sinais': {
    titulo: 'The Seven Signs of Not Belonging',
    subtitulo: 'On belonging without making yourself smaller',
    descricao: `**Book · ~50,000 words · Immediate PDF**

The companion book to The Seven Veils. About the quiet moment, hard to confess, when you stop fitting a place that was good, without anything in it having changed, and without anyone having done anything wrong.

**The seven signs:**
1. You are present but you do not feel you belong.
2. You begin to make yourself smaller in order to fit.
3. You miss something you never lived.
4. You swing between over-adapting and isolating.
5. Your nervous system begins to reject certain places.
6. You start to mistake peace for the absence of people.
7. You realize the problem was never belonging, but the price of belonging.

Each sign in three movements: recognition, deepening, and the smallest, truest turn. At the end, the veil of the horizon: there is no place of arrival, there is a way of staying.

It is not a book about learning to fit in. It is about belonging without needing to make yourself smaller.

By Vivianne dos Santos.`,
  },
  'os-7-veus': {
    titulo: 'The Seven Veils',
    subtitulo: 'See what binds you. Release what makes you repeat.',
    descricao: `**Book · ~22,000 words · Immediate PDF**

The pillar book of Method VS. A crossing through the seven veils that stand between you and who you are, and the simple way to lift them: see what binds you, release what makes you repeat.

**The seven veils:**
1. Permanence, defending who you no longer are.
2. Memory, living bound to your story.
3. The Whirlwind, drowning inside your own head.
4. Effort, striving to be loved.
5. Desolation, the fear of the void.
6. The Horizon, living in wait for a someday.
7. Duality, the separation at the root of them all.

Each veil with its root (childhood, inheritances, family constellation), what changes when it lifts, and a practice. At the end, an eight-week workbook to bring the method into your life.

By Vivianne dos Santos, from the path of transpersonal psychology and systemic family constellation.`,
  },
  'ver-soltar': {
    titulo: 'ver.soltar',
    subtitulo: 'awareness: stepping out of the storm',
    descricao: `**Method child · ~12,000 words · Immediate PDF**

The first movement of Method VS: to see. A method for stepping out of your own head (the whirlwind and memory) and watching the storm pass from solid ground. With its 5-step protocol, practices, and a seven-day path.

**Includes the pocket draft (bonus)**, to keep the method close.

By Vivianne dos Santos, from the path of transpersonal psychology and systemic family constellation.`,
  },
  'vir-soltar': {
    titulo: 'vir.soltar',
    subtitulo: 'the return: coming back to yourself',
    descricao: `**Method child · ~11,000 words · Immediate PDF**

The second movement of Method VS: to come. A method for stopping the pushing and coming back to yourself (effort and desolation), and letting yourself, at last, be held. With its 5-step protocol, practices, and a seven-day path.

**Includes the pocket draft (bonus)**, to keep the method close.

By Vivianne dos Santos, from the path of transpersonal psychology and systemic family constellation.`,
  },
  'viver-soltar': {
    titulo: 'viver.soltar',
    subtitulo: 'integration: stepping into your life',
    descricao: `**Method child · ~12,000 words · Immediate PDF**

The third movement of Method VS: to live. A method for leaving the waiting room and taking off the armor of your roles (the horizon and permanence), and stepping into your own life, now. With its 5-step protocol, practices, and a seven-day path.

**Includes the pocket draft (bonus)**, to keep the method close.

By Vivianne dos Santos, from the path of transpersonal psychology and systemic family constellation.`,
  },
};

async function getProduto(slug: string, locale: string): Promise<Produto | null> {
  if (isPackSlug(slug)) return getPack(slug, locale);
  if (isRomanceSlug(slug)) return getRomanceProduto(slug, locale);
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('produtos')
      .select('*')
      .eq('slug', slug)
      .eq('publicado', true)
      .single();
    const row = data as Produto | null;
    if (!row) return getFallback(slug, locale);
    // A DB so guarda PT. Em EN, sobrepoe so o texto. A capa e a mesma (so foto).
    if (locale === 'en') {
      const metodo = LIVROS_METODO_EN[slug];
      if (metodo) return { ...row, titulo: metodo.titulo, subtitulo: metodo.subtitulo, descricao: metodo.descricao };
      const en = PRODUTOS_EN[slug];
      if (en) return { ...row, titulo: en.titulo, subtitulo: en.subtitulo, descricao: en.descricao };
      const c = CATALOGO[slug];
      if (c) return { ...row, titulo: c.titulo_en, subtitulo: c.subtitulo_en, descricao: c.descricao_en };
    }
    return row;
  } catch {
    return getFallback(slug, locale);
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = await getProduto(slug, locale);
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
  const p = await getProduto(slug, locale);
  if (!p) notFound();
  // Regra de zero travessoes em todo o site, qualquer que seja a fonte (DB incluida).
  p.titulo = semTravessoes(p.titulo);
  p.subtitulo = semTravessoes(p.subtitulo);
  p.descricao = semTravessoes(p.descricao);
  const isPt = locale === 'pt';
  const descHtml = p.descricao ? await marked.parse(p.descricao, { async: true }) : '';
  const isEbook = p.badge?.toLowerCase().includes('ebook');
  const isPack = isPackSlug(slug);
  const conteudoPack = isPack ? await getPackConteudo(slug, locale) : [];
  // Cross-sell: pack do universo deste produto (para sugerir levar tudo).
  // Os romances da Biblioteca de Véspera NÃO pertencem a nenhum pack: vendem-se
  // sempre avulso, por isso nunca mostram o banner de coleção.
  const packDoUniverso = (!isPack && !isRomanceSlug(slug) && !LIVROS_METODO.includes(slug))
    ? PACKS.find((pk) => pk.colecao !== 'all' && pk.colecao === slugToColecao(slug))
    : undefined;
  // Pack: mosaico das capas reais dos livros (ate 4) para o hero.
  const mosaicoPack = isPack
    ? conteudoPack.map((i) => i.capa).filter((c): c is string => Boolean(c)).slice(0, 4)
    : [];
  const capaExibida = capaLivroMetodo(slug, locale) ?? mosaicoPack[0] ?? p.capa;
  // Os livros do Metodo VS tem capa em formato de livro (5:8); os ebooks/guias
  // tem capa ~quadrada (3:4). A moldura segue o formato real, senao a capa de
  // livro era esmagada/cortada na caixa quadrada (mesmo problema da home).
  const aspectCapa = LIVROS_METODO.includes(slug) ? 'aspect-[5/8]' : 'aspect-[3/4]';
  // Poupanca (preco original riscado vs preco).
  const precoN = (s: string | null) => parseFloat((s ?? '').replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
  const poupanca = p.preco_original ? Math.round(precoN(p.preco_original) - precoN(p.preco)) : 0;
  const poupancaPct = p.preco_original && precoN(p.preco_original) > 0
    ? Math.round((1 - precoN(p.preco) / precoN(p.preco_original)) * 100)
    : 0;

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
              {isPack && mosaicoPack.length > 1 ? (
                <div className="relative aspect-[3/4] rounded-[20px] overflow-hidden border border-ocre/20 shadow-2xl shadow-black/30">
                  <div className="grid grid-cols-2 grid-rows-2 gap-[2px] w-full h-full">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="relative overflow-hidden">
                        <Image src={mosaicoPack[i % mosaicoPack.length]} alt="" fill className="object-cover" unoptimized />
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-terra/70 via-transparent to-transparent" />
                  {p.badge && (
                    <span className="absolute top-4 left-4 bg-ambar text-terra text-[0.65rem] tracking-[0.14em] uppercase font-medium px-3 py-1.5 rounded-full">
                      {p.badge}
                    </span>
                  )}
                </div>
              ) : capaExibida ? (
                <div className={`relative ${aspectCapa} rounded-[20px] overflow-hidden border border-ocre/20 shadow-2xl shadow-black/30`}>
                  <Image
                    src={capaExibida}
                    alt={p.titulo}
                    fill
                    priority
                    className="object-cover"
                    unoptimized
                  />
                  {p.badge && (
                    <span className="absolute top-4 left-4 bg-ambar text-terra text-[0.65rem] tracking-[0.14em] uppercase font-medium px-3 py-1.5 rounded-full">
                      {p.badge}
                    </span>
                  )}
                </div>
              ) : (
                <div className={`${aspectCapa} rounded-[20px] bg-terra-2/60 border border-ocre/20 flex items-center justify-center`}>
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
              <div className="flex items-baseline gap-4 mb-2 flex-wrap">
                <span className="text-ambar font-serif text-[2.2rem] leading-none">{p.preco}</span>
                {p.preco_original && (
                  <span className="text-creme-2/40 text-[1.15rem] line-through">{p.preco_original}</span>
                )}
                {poupanca > 0 && (
                  <span className="bg-ouro/20 text-ouro border border-ouro/40 rounded-full px-3 py-1 text-[0.72rem] font-semibold tracking-[0.04em]">
                    {isPt ? `Poupas €${poupanca}` : `Save €${poupanca}`}{poupancaPct > 0 ? ` · -${poupancaPct}%` : ''}
                  </span>
                )}
              </div>
              {p.preco_original && (
                <p className="text-[0.78rem] text-ocre/70 mb-5">
                  {isPack
                    ? (isPt
                        ? `Avulso daria ${p.preco_original}. Em pack, ${p.preco}, levas os ${conteudoPack.length} títulos.`
                        : `Separately it would be ${p.preco_original}. As a bundle, ${p.preco}, you get all ${conteudoPack.length} titles.`)
                    : (isPt
                        ? `Valor real: ${p.preco_original}. Preço de lançamento.`
                        : `Real value: ${p.preco_original}. Launch price.`)}
                </p>
              )}
              <div className="mb-4 max-w-[360px]">
                <BotaoCompra
                  slug={slug}
                  locale={locale}
                  titulo={p.titulo}
                  preco={p.preco}
                  checkoutUrl={p.checkout_url}
                  pack={isPack}
                />
              </div>
              {!p.checkout_url && (
                <div className="mb-4">
                  <AdicionarCarrinho variante="inline" item={{ slug, titulo: p.titulo, preco: p.preco, capa: capaExibida, badge: p.badge }} />
                </div>
              )}
              {/* Selo de garantia 7 dias */}
              <div className="flex items-center gap-3 mb-3 rounded-[12px] border border-salvia/40 bg-salvia/10 px-4 py-3">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-salvia shrink-0"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>
                <p className="text-creme-2/90 text-[0.82rem] leading-snug">
                  <span className="text-salvia font-medium">{isPt ? 'Garantia de 7 dias.' : '7-day guarantee.'}</span>{' '}
                  {isPt ? 'Se não for para ti, escreves-me e devolvo o valor. Sem complicações.' : 'If it is not for you, message me and I refund you. No fuss.'}
                </p>
              </div>
              {/* Bloco de confiança */}
              <ul className="flex flex-wrap gap-x-5 gap-y-1.5 mb-3 text-[0.75rem] text-creme-2/70">
                <li className="flex items-center gap-1.5"><span className="text-ambar">↓</span> {isPt ? 'Entrega imediata' : 'Instant delivery'}</li>
                <li className="flex items-center gap-1.5"><span className="text-ambar">▢</span> {isPt ? 'PDF (telemóvel, PC, imprimir)' : 'PDF (phone, PC, print)'}</li>
                <li className="flex items-center gap-1.5"><span className="text-ambar">∞</span> {isPt ? 'É teu para sempre' : 'Yours forever'}</li>
                <li className="flex items-center gap-1.5"><span className="text-ambar">✓</span> {isPt ? 'Pagamento seguro' : 'Secure payment'}</li>
              </ul>
              {/* Cross-sell do pack do universo */}
              {packDoUniverso && (
                <a
                  href={`${locale === 'en' ? '/en' : ''}/loja/${packDoUniverso.slug}`}
                  className="block mt-2 rounded-[12px] border border-ouro/40 bg-ouro/10 px-4 py-3 no-underline hover:bg-ouro/20 transition-colors"
                >
                  <span className="block text-ambar text-[0.84rem] font-medium">
                    {isPt
                      ? `Faz parte do pack ${packDoUniverso.titulo} · ${packDoUniverso.preco}`
                      : `Part of the ${packDoUniverso.titulo_en} pack · ${packDoUniverso.preco}`}
                  </span>
                  <span className="block text-creme-2/70 text-[0.74rem] mt-0.5">
                    {isPt
                      ? `Leva o universo completo em vez de ${p.preco} avulso, poupa face a ${packDoUniverso.preco_original}. →`
                      : `Get the whole world instead of ${p.preco} apiece, save vs ${packDoUniverso.preco_original}. →`}
                  </span>
                </a>
              )}
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

      {/* CONTEUDO DO PACK — a colecao inteira, com capa + descricao de cada livro */}
      {isPack && conteudoPack.length > 0 && (
        <section className="relative z-[2] py-12 px-7">
          <div className="max-w-[1060px] mx-auto">
            <div className="flex items-center gap-4 mb-3">
              <h2 className="font-serif font-light text-creme text-[1.7rem]">
                {isPt ? `O que levas · ${conteudoPack.length} títulos` : `What you get · ${conteudoPack.length} titles`}
              </h2>
              <div className="flex-1 h-px bg-ocre/25" />
              <span className="text-[0.72rem] tracking-[0.18em] uppercase text-ocre">
                {isPt ? 'tudo incluído' : 'all included'}
              </span>
            </div>
            <p className="text-creme-2/70 text-[0.95rem] leading-[1.6] mb-8 max-w-[640px]">
              {isPt
                ? `Não é uma lista, é a coleção inteira, cada livro com a sua travessia. ${poupanca > 0 ? `Avulso seria ${p.preco_original}; aqui levas tudo por ${p.preco}.` : ''}`
                : `Not a list, the whole collection, each book with its own crossing. ${poupanca > 0 ? `Separately it would be ${p.preco_original}; here you get it all for ${p.preco}.` : ''}`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {conteudoPack.map((item) => (
                <Link
                  key={item.slug}
                  href={`${locale === 'en' ? '/en' : ''}/loja/${item.slug}`}
                  className="group flex gap-4 rounded-[16px] border border-ocre/20 p-4 no-underline hover:border-ambar/50 hover:bg-terra-2/30 transition-colors"
                >
                  <div className="relative w-[72px] shrink-0 aspect-[3/4] rounded-[10px] overflow-hidden border border-ocre/25 bg-terra-2/60">
                    {item.capa && (
                      <Image src={item.capa} alt={item.titulo} fill className="object-cover" unoptimized />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[0.6rem] tracking-[0.16em] uppercase text-ocre/70 mb-1">
                      {item.badge?.toLowerCase().includes('ebook') ? 'ebook' : (isPt ? 'guia' : 'guide')}
                    </span>
                    <h3 className="font-serif text-creme text-[1.02rem] leading-tight mb-1 group-hover:text-ambar transition-colors">
                      {item.titulo}
                    </h3>
                    <p className="text-creme-2/70 text-[0.8rem] leading-[1.45] line-clamp-3">
                      {item.subtitulo}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AUTORA — foto real + nota genuina (nao e testemunho inventado).
          Usa gratidao-venda.jpg (gerada no MJ) se existir; senao a foto atual. */}
      <section className="relative z-[2] py-12 px-7 border-t border-ocre/10">
        <div className="max-w-[760px] mx-auto flex flex-col sm:flex-row items-center gap-8">
          <div className="relative w-[140px] h-[140px] shrink-0 rounded-full overflow-hidden border border-ocre/30 shadow-xl shadow-black/30">
            <Image src="/gratidao-venda.png" alt="Vivianne dos Santos" fill className="object-cover" unoptimized />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[0.7rem] tracking-[0.2em] uppercase text-ocre/80 mb-2">
              {isPt ? 'quem escreve' : 'who writes this'}
            </p>
            <h2 className="font-serif font-light text-creme text-[1.5rem] mb-3">Vivianne dos Santos</h2>
            <p className="text-creme-2/85 text-[0.92rem] leading-[1.7] mb-2">
              {isPt
                ? 'Escritora, mãe de três, em formação avançada em Psicologia Transpessoal, Psicologia e Espiritualidade, e Constelação Familiar Sistémica. Não escrevo de fora, escrevo de dentro da mesma travessia.'
                : 'Writer, mother of three, in advanced training in Transpersonal Psychology, Psychology and Spirituality, and Systemic Family Constellation Therapy. I do not write from the outside, I write from inside the same crossing.'}
            </p>
            <p className="text-creme-2/70 text-[0.86rem] italic font-serif">
              {isPt
                ? 'Cada livro nasceu de uma ferida real e do caminho de volta a partir dela.'
                : 'Each book was born from a real wound and the way back from it.'}
            </p>
          </div>
        </div>
      </section>

      {/* CONFIANCA + FAQ */}
      <section className="relative z-[2] py-12 px-7 border-t border-ocre/10">
        <div className="max-w-[860px] mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {[
              { t: isPt ? 'Entrega imediata' : 'Instant delivery', d: isPt ? 'Acesso logo após o pagamento' : 'Access right after payment' },
              { t: isPt ? 'Formato PDF' : 'PDF format', d: isPt ? 'Telemóvel, computador ou imprimir' : 'Phone, computer or print' },
              { t: isPt ? 'É teu para sempre' : 'Yours forever', d: isPt ? 'Descarregas as vezes que precisares' : 'Download it whenever you need' },
              { t: isPt ? 'Pagamento seguro' : 'Secure payment', d: isPt ? 'PayPal e cartão · não guardamos dados' : 'PayPal & card · we store no card data' },
            ].map((b) => (
              <div key={b.t} className="text-center px-2">
                <GotaMini className="w-[20px] h-[20px] mx-auto opacity-50 mb-2 block" />
                <p className="text-creme text-[0.85rem] font-medium mb-0.5">{b.t}</p>
                <p className="text-creme-2/60 text-[0.74rem] leading-snug">{b.d}</p>
              </div>
            ))}
          </div>

          <h2 className="font-serif font-light text-creme text-[1.4rem] mb-6 text-center">
            {isPt ? 'Perguntas frequentes' : 'Frequently asked'}
          </h2>
          <div className="space-y-4 max-w-[640px] mx-auto">
            {(isPt
              ? [
                  { q: 'E se não for para mim?', a: 'Tens garantia de 7 dias. Se sentires que não era para ti, escreves-me e devolvo o valor, sem complicações.' },
                  { q: 'Como recebo o material?', a: 'Assim que o pagamento é confirmado, descarregas aqui mesmo e recebes também o link no teu email. Sem espera.' },
                  { q: 'Em que formato vem?', a: 'PDF, pensado para ler no telemóvel, no computador ou imprimir. Fica contigo para sempre.' },
                  { q: 'Preciso de criar conta?', a: 'Não. Só precisas do teu email para te enviarmos o acesso.' },
                  { q: 'O pagamento é seguro?', a: 'Sim. É processado pelo PayPal (que também aceita cartão). Não guardamos os dados do teu cartão.' },
                  { q: 'E se tiver algum problema com o download?', a: 'Falas comigo diretamente no WhatsApp e resolvo contigo.' },
                ]
              : [
                  { q: 'What if it is not for me?', a: 'You have a 7-day guarantee. If you feel it was not for you, message me and I refund you, no fuss.' },
                  { q: 'How do I receive it?', a: 'As soon as payment is confirmed you download it right here and also get the link by email. No waiting.' },
                  { q: 'What format is it?', a: 'PDF, made to read on your phone, computer or to print. It is yours forever.' },
                  { q: 'Do I need an account?', a: 'No. You only need your email so we can send you access.' },
                  { q: 'Is payment secure?', a: 'Yes. It is handled by PayPal (which also accepts card). We never store your card data.' },
                  { q: 'What if I have a problem downloading?', a: 'Message me directly on WhatsApp and I will sort it out with you.' },
                ]
            ).map((f) => (
              <div key={f.q} className="border border-ocre/15 rounded-[12px] p-4">
                <p className="text-creme font-medium text-[0.92rem] mb-1.5">{f.q}</p>
                <p className="text-creme-2/75 text-[0.86rem] leading-[1.55]">{f.a}</p>
              </div>
            ))}
          </div>
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
              pack={isPack}
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

          <p className="text-[0.78rem] text-creme-2/50 mt-8">
            {isPt ? 'Questoes?' : 'Questions?'}{' '}
            <a href="mailto:ola@viviannedossantos.com" className="text-ocre hover:text-ambar no-underline">ola@viviannedossantos.com</a>
            {' '}{isPt ? 'ou' : 'or'}{' '}
            <a href="https://wa.me/258845243875" className="text-ocre hover:text-ambar no-underline">WhatsApp</a>
          </p>

          <p className="text-[0.72rem] text-creme-2/40 mt-4">
            {isPt
              ? '© 2026 Vivianne dos Santos · viviannedossantos.com'
              : '© 2026 Vivianne dos Santos · viviannedossantos.com'}
          </p>
        </div>
      </section>

      {!p.checkout_url && (
        <>
          <div className="h-20 sm:hidden" />
          <BarraCompraMobile
            item={{ slug, titulo: p.titulo, preco: p.preco, capa: capaExibida, badge: p.badge }}
            precoOriginal={p.preco_original}
          />
        </>
      )}
    </>
  );
}
