import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { listarLivros } from '@/lib/editora';

type SeedProduto = {
  slug: string; titulo: string; subtitulo: string; descricao: string;
  preco: string; preco_original: string | null; capa: string | null;
  badge: string; destaque: boolean; publicado: boolean; ordem: number;
  ficheiro_path?: string;
};

const PRODUTOS: SeedProduto[] = [
  {
    slug: 'os-7-sinais',
    titulo: 'Os 7 Sinais de Desencaixe',
    subtitulo: 'O equilíbrio entre pertença e autenticidade',
    descricao: `**Livro · ~50.000 palavras · PDF imediato**

O livro irmão de Os Sete Véus. Sobre o momento, calado e difícil de confessar, em que deixas de caber num lugar que foi bom, sem que nada nele tenha mudado, e sem que ninguém tenha feito nada de errado.

**Os sete sinais:**
1. Estás presente mas não te sentes pertencente.
2. Começas a diminuir-te para caber.
3. Sentes saudades de algo que nunca viveste.
4. Oscilas entre hiper-adaptação e isolamento.
5. O teu sistema nervoso começa a rejeitar certos ambientes.
6. Começas a confundir paz com ausência de pessoas.
7. Percebes que o problema nunca foi pertencer, mas o preço da pertença.

Cada sinal em três movimentos: reconhecimento, aprofundamento e a viragem mais pequena e verdadeira. No fim, o véu do horizonte: não há um lugar de chegada, há uma forma de permanecer.

Não é um livro sobre aprender a encaixar. É sobre pertencer sem precisares de te diminuíres.

Por Vivianne dos Santos.`,
    preco: '€14',
    preco_original: '€19',
    capa: '/produtos/os-7-sinais-capa.png',
    ficheiro_path: 'produtos/os-7-sinais.pdf',
    badge: 'livro · novo',
    destaque: true,
    publicado: true,
    ordem: 0,
  },
  {
    slug: 'os-7-veus',
    titulo: 'Os Sete Véus',
    subtitulo: 'Vê o que te prende. Solta o que te faz repetir.',
    descricao: `**Livro · ~22.000 palavras · PDF imediato**

O livro-pilar do Método VS. Uma travessia pelos sete véus que se põem entre ti e quem és, e o caminho simples para os erguer: ver o que te prende, soltar o que te faz repetir.

**Os sete véus:**
1. A Permanência, defenderes quem já não és.
2. A Memória, viveres preso à tua história.
3. O Turbilhão, afogares-te na própria cabeça.
4. O Esforço, esforçares-te para seres amada.
5. A Desolação, o medo do vazio.
6. O Horizonte, viver à espera de um quando.
7. A Dualidade, a separação que está na raiz de todos.

Cada véu com a sua raiz (infância, heranças, constelação familiar), o que muda quando se ergue, e uma prática. No fim, um caderno de oito semanas para levares o método à tua vida.

Por Vivianne dos Santos, do caminho da psicologia transpessoal e da constelação familiar sistémica.`,
    preco: '€19',
    preco_original: null,
    capa: `${(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '')}/storage/v1/object/public/viviannepag-assets/livro-pilar/os-7-veus/capa-composta.png`,
    badge: 'livro · pilar',
    destaque: false,
    publicado: false,
    ordem: 0,
  },
  {
    slug: 'ver-soltar',
    titulo: 'ver.soltar',
    subtitulo: 'a consciência: sair de dentro da tempestade',
    descricao: `**Método-filho · ~12.000 palavras · PDF imediato**

O primeiro movimento do Método VS: ver. Um método para saíres de dentro da cabeça (o turbilhão e a memória) e veres a tempestade passar de terra. Com o seu protocolo de 5 passos, práticas e um caminho de sete dias.

**Inclui o rascunho de bolso (bónus)**, para teres o método por perto.

Por Vivianne dos Santos, do caminho da psicologia transpessoal e da constelação familiar sistémica.`,
    preco: '€9',
    preco_original: null,
    capa: `${(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '')}/storage/v1/object/public/viviannepag-assets/livro-pilar/ver-soltar/capa-composta.png`,
    ficheiro_path: 'produtos/ver-soltar.pdf',
    badge: 'método · filho',
    destaque: false,
    publicado: false,
    ordem: 0,
  },
  {
    slug: 'vir-soltar',
    titulo: 'vir.soltar',
    subtitulo: 'o regresso: voltar a ti',
    descricao: `**Método-filho · ~11.000 palavras · PDF imediato**

O segundo movimento do Método VS: vir. Um método para parares de empurrar e regressares a ti (o esforço e a desolação), e te deixares, enfim, segurar. Com o seu protocolo de 5 passos, práticas e um caminho de sete dias.

**Inclui o rascunho de bolso (bónus)**, para teres o método por perto.

Por Vivianne dos Santos, do caminho da psicologia transpessoal e da constelação familiar sistémica.`,
    preco: '€9',
    preco_original: null,
    capa: `${(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '')}/storage/v1/object/public/viviannepag-assets/livro-pilar/vir-soltar/capa-composta.png`,
    ficheiro_path: 'produtos/vir-soltar.pdf',
    badge: 'método · filho',
    destaque: false,
    publicado: false,
    ordem: 0,
  },
  {
    slug: 'viver-soltar',
    titulo: 'viver.soltar',
    subtitulo: 'a integração: entrar na tua vida',
    descricao: `**Método-filho · ~12.000 palavras · PDF imediato**

O terceiro movimento do Método VS: viver. Um método para saíres da sala de espera e tirares a armadura dos papéis (o horizonte e a permanência), e entrares na tua própria vida, agora. Com o seu protocolo de 5 passos, práticas e um caminho de sete dias.

**Inclui o rascunho de bolso (bónus)**, para teres o método por perto.

Por Vivianne dos Santos, do caminho da psicologia transpessoal e da constelação familiar sistémica.`,
    preco: '€9',
    preco_original: null,
    capa: `${(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '')}/storage/v1/object/public/viviannepag-assets/livro-pilar/viver-soltar/capa-composta.png`,
    ficheiro_path: 'produtos/viver-soltar.pdf',
    badge: 'método · filho',
    destaque: false,
    publicado: false,
    ordem: 0,
  },
  {
    slug: 'ebook-01-culpa',
    titulo: 'A culpa não é boa conselheira',
    subtitulo: 'Porque te sentes sempre em falta com os teus filhos, e o que essa culpa te está a impedir de fazer.',
    descricao: `**Ebook · 9033 palavras · ~50 páginas · PDF imediato**

Um ebook para mães que vivem com culpa. Não a culpa óbvia, mas a que aparece quando te deitas e a casa está em silêncio. A que te diz que devias ter feito mais, melhor, diferente. Este livro mostra-te de onde vem essa culpa, porque não prova que falhaste, e o que ela te impede de ver.

**O que vais encontrar:**
1. A coisa que sentes e nunca disseste
2. Ninguém fala da culpa da mãe
3. Sentir culpa não te torna má mãe
4. O que a culpa te faz fazer
5. De onde vem a tua culpa
6. Culpa não é responsabilidade
7. Há um caminho de volta
8. A travessia

**Amostra:**
> *Tu sabes do que estou a falar. Aquela sensação que aparece quando te deitas e a casa finalmente está em silêncio. Quando o mais novo adormeceu, quando os pratos estão lavados, quando já não há mais nada para fazer a não ser ficar contigo mesma. E ela aparece. A culpa.*

Baseado nos princípios da Constelação Familiar Sistémica. Liga ao FreeMe.`,
    preco: '€7',
    preco_original: '€29',
    capa: '/produtos/ebook-01-culpa-capa.png',
    badge: 'ebook',
    destaque: true,
    publicado: true,
    ordem: 1,
  },
  {
    slug: 'ebook-02-herdaste',
    titulo: 'O que herdaste sem saber',
    subtitulo: 'As lealdades invisíveis: porque repetes o que juraste nunca repetir.',
    descricao: `**Ebook · 9685 palavras · 8 capítulos · PDF imediato**

Porque é que fazes exactamente aquilo que juraste nunca fazer? Porque é que a frase da tua mãe sai da tua boca? Este ebook explica as lealdades invisíveis, as ordens do amor, e o mecanismo por trás da repetição de padrões familiares.

**O que vais encontrar:**
1. "Nunca serei como a minha mãe"
2. O que são lealdades invisíveis
3. As ordens do amor
4. Porque repetimos o que combatemos
5. O que se herda sem palavras
6. Ver não é culpar
7. Honrar sem repetir
8. A travessia

**Amostra:**
> *São sete e meia da noite. O jantar ainda não está pronto, a roupa ficou esquecida na máquina. E então acontece. O mais velho responde-te de um jeito que te faz perder a paciência. Abres a boca e sai aquela frase. Com aquele tom. É a voz da tua mãe.*

Baseado nos princípios da Constelação Familiar Sistémica. Liga ao FreeMe.`,
    preco: '€7',
    preco_original: '€29',
    capa: '/produtos/ebook-02-herdaste-capa.png',
    badge: 'ebook',
    destaque: true,
    publicado: true,
    ordem: 2,
  },
  {
    slug: 'guia-01-meu',
    titulo: 'O que é meu, o que não é meu',
    subtitulo: 'Um exercício para parares de carregar o que nunca foi teu.',
    descricao: 'Guia prático · 3620 palavras · ~23 páginas\n\nUm exercício simples e poderoso: duas colunas onde separas o que é genuinamente teu do que carregas por outros. Com exemplos concretos e perguntas orientadoras.',
    preco: '€5',
    preco_original: '€15',
    capa: '/produtos/guia-01-meu-capa.png',
    badge: 'guia',
    destaque: false,
    publicado: true,
    ordem: 3,
  },
  {
    slug: 'guia-02-frases',
    titulo: '7 frases para dizer não sem culpa',
    subtitulo: 'Como pôr limites ao teu filho com amor e firmeza, sem te sentires má mãe.',
    descricao: 'Guia prático · 3068 palavras\n\n7 frases prontas a usar quando o teu filho insiste, chora, ou testa os limites. Cada frase com a situação concreta e a explicação de porque funciona.',
    preco: '€5',
    preco_original: '€15',
    capa: '/produtos/guia-02-frases-capa.png',
    badge: 'guia',
    destaque: false,
    publicado: true,
    ordem: 4,
  },
  {
    slug: 'ebook-03-quemes',
    titulo: 'Quem és para além do que fazes',
    subtitulo: 'A diferença entre a tua identidade e os teus papéis, e porque te perdeste pelo caminho.',
    descricao: 'Ebook · 9096 palavras · 7 capítulos\n\nPara a mulher que se perdeu nos papéis de mãe, esposa, profissional. Que não sabe quem é quando não está a funcionar. Psicologia transpessoal aplicada à identidade.',
    preco: '€7',
    preco_original: '€29',
    capa: '/produtos/ebook-03-quemes-capa.png',
    badge: 'ebook',
    destaque: false,
    publicado: true,
    ordem: 5,
  },
  {
    slug: 'ebook-04-sentido',
    titulo: 'O sentido que procuras',
    subtitulo: 'Porque o sucesso não preenche, e o que fazer com o vazio que fica.',
    descricao: 'Ebook · 9062 palavras · 6 capítulos\n\nTens tudo e sentes que falta. Este ebook explora o vazio existencial, a psicologia do sentido, e as quatro fontes de sentido que podem preencher o que nenhuma conquista consegue.',
    preco: '€7',
    preco_original: '€29',
    capa: '/produtos/ebook-04-sentido-capa.png',
    badge: 'ebook',
    destaque: false,
    publicado: true,
    ordem: 6,
  },
  {
    slug: 'ebook-05-escuro',
    titulo: 'Atravessar o escuro',
    subtitulo: 'As crises não são só doença. Às vezes são passagem.',
    descricao: 'Ebook · 8062 palavras · 6 capítulos\n\nPara quem está no fundo e não sabe se sai. Duas leituras da crise (doença e passagem), o que a psicologia transpessoal vê nas crises, e o que ajuda a atravessar. Com nota ética reforçada.',
    preco: '€7',
    preco_original: '€29',
    capa: '/produtos/ebook-05-escuro-capa.png',
    badge: 'ebook',
    destaque: false,
    publicado: true,
    ordem: 7,
  },
  {
    slug: 'ebook-06-no-casal',
    titulo: 'O nó invisível do casal',
    subtitulo: 'O que está por baixo das discussões que se repetem sempre.',
    descricao: 'Ebook · 8277 palavras · 6 capítulos\n\nA mesma discussão, sempre. Este ebook revela o que está por baixo: dois sistemas familiares a encontrarem-se, dinâmicas herdadas, e o equilíbrio invisível do dar e receber.',
    preco: '€7',
    preco_original: '€29',
    capa: '/produtos/ebook-06-no-casal-capa.png',
    badge: 'ebook',
    destaque: false,
    publicado: true,
    ordem: 8,
  },
  {
    slug: 'ebook-07-sonho',
    titulo: 'Nem todo o sonho que carregas nasceu em ti',
    subtitulo: 'Porque alcanças o que querias e continuas a sentir que falta.',
    descricao: `**Ebook · 8009 palavras · 8 capítulos · PDF imediato**

Fizeste tudo certo e continuas perdida. Este ebook revela o mecanismo da substituição: não queres a meta, queres o que ela promete. E mostra-te de quem são os sonhos que carregas.

**O que vais encontrar:**
1. Fizeste tudo certo, e continuas perdida
2. Alcançar e sentir pouco
3. Não queres a meta, queres o que ela promete
4. Perseguir o futuro para reparar o passado
5. De quem são os sonhos que carregas
6. Largar não é desistir
7. A pergunta que muda tudo
8. Ponte para o Infonte

**Amostra:**
> *Tu fizeste tudo certo. Estudaste. Trabalhaste. Esforçaste-te mais do que a maioria. E conseguiste coisas. Mas não sentes. Sentes um vazio estranho, que não combina com a tua vida. Fizeste tudo certo e, mesmo assim, alguma coisa fundamental ficou por fazer.*

Baseado na tese Infonte: substituição, sonhos herdados, exaustão sem chegada.`,
    preco: '€7',
    preco_original: '€29',
    capa: '/produtos/ebook-07-sonho-capa.png',
    badge: 'ebook · novo',
    destaque: true,
    publicado: true,
    ordem: 9,
  },
  {
    slug: 'ebook-08-voz',
    titulo: 'De quem é esta voz?',
    subtitulo: 'Quem decidiu, na tua vida, o que conta como sucesso?',
    descricao: `**Ebook · 8917 palavras · 7 capítulos · PDF imediato**

Medes-te por uma régua que nunca escolheste. Este ebook mapeia as vozes herdadas e emprestadas que dirigem as tuas escolhas sem tu saberes.

**O que vais encontrar:**
1. A régua que nunca escolheste
2. Quem definiu o teu sucesso
3. As vozes que carregamos
4. A lealdade invisível às ambições da família
5. Quando a voz emprestada cala a tua
6. Distinguir a tua voz das outras
7. Ponte para o Infonte

**Amostra:**
> *Há uma régua na tua vida. Está lá desde que te lembras. Mede tudo o que fazes, tudo o que és, tudo o que conquistas. E nunca, nunca é suficiente. A régua diz-te: mais. Melhor. Mais rápido. Mais perfeito. E tu obedeces.*

Baseado na tese Infonte: vozes herdadas, régua emprestada, lealdade às ambições familiares.`,
    preco: '€7',
    preco_original: '€29',
    capa: '/produtos/ebook-08-voz-capa.png',
    badge: 'ebook · novo',
    destaque: true,
    publicado: true,
    ordem: 10,
  },
  {
    slug: 'guia-03-presenca',
    titulo: 'Práticas de presença para o dia a dia',
    subtitulo: 'Pequenas pausas que te trazem de volta a ti, no meio do caos.',
    descricao: 'Guia prático · 2962 palavras\n\n7 micro-práticas de presença que cabem no teu dia sem mudares nada na rotina. Nenhuma demora mais de um minuto.',
    preco: '€5',
    preco_original: '€15',
    capa: '/produtos/guia-03-presenca-capa.png',
    badge: 'guia',
    destaque: false,
    publicado: true,
    ordem: 11,
  },
  {
    slug: 'guia-04-mente',
    titulo: 'Esvaziar a mente em 3 passos',
    subtitulo: 'Um método rápido para parar a roda de pensamentos e voltar ao foco.',
    descricao: 'Guia prático · 2810 palavras\n\nDespejar, separar, escolher. Um método em 3 passos para sair da ruminação e recuperar o controlo dos teus pensamentos.',
    preco: '€5',
    preco_original: '€15',
    capa: '/produtos/guia-04-mente-capa.png',
    badge: 'guia',
    destaque: false,
    publicado: true,
    ordem: 12,
  },
  {
    slug: 'guia-05-luto',
    titulo: 'Ritual para o luto que ninguém vê',
    subtitulo: 'Para as perdas que não tiveram funeral: um sonho, uma fase, uma versão de ti.',
    descricao: 'Guia prático · 2666 palavras\n\nUm ritual em 3 partes (nomear, honrar, largar) para as perdas invisíveis que carregas sem permissão para as sentir.',
    preco: '€5',
    preco_original: '€15',
    capa: '/produtos/guia-05-luto-capa.png',
    badge: 'guia',
    destaque: false,
    publicado: true,
    ordem: 13,
  },
  {
    slug: 'guia-06-perguntas',
    titulo: 'As 5 perguntas antes de uma discussão',
    subtitulo: 'O que te perguntar antes de reagir, para não repetires a mesma briga.',
    descricao: 'Guia prático · 2757 palavras\n\n5 perguntas para fazeres no espaço entre o estímulo e a reação. Para quando sentires o impulso de reagir como sempre.',
    preco: '€5',
    preco_original: '€15',
    capa: '/produtos/guia-06-perguntas-capa.png',
    badge: 'guia',
    destaque: false,
    publicado: true,
    ordem: 14,
  },
  {
    slug: 'guia-07-teu',
    titulo: 'O que é mesmo teu',
    subtitulo: 'Um exercício para separar o que persegues por ti do que persegues por herança.',
    descricao: 'Guia prático · 4176 palavras\n\nO irmão do Guia 1. Lá separas o que carregas. Aqui separas o que persegues. Lista os teus objetivos e marca a origem de cada um: verdade, herança, comparação ou compensação.',
    preco: '€5',
    preco_original: '€15',
    capa: '/produtos/guia-07-teu-capa.png',
    badge: 'guia · novo',
    destaque: false,
    publicado: true,
    ordem: 15,
  },
  {
    slug: 'guia-08-culpa',
    titulo: "A culpa que não tem origem",
    subtitulo: "Encontrar a culpa que sentes mas não cometeste, e devolvê-la.",
    descricao: "Guia prático · 3402 palavras\\n\\nReconhecer a culpa herdada ou absorvida, traçar a sua origem, e um exercício para a devolveres a quem pertence.",
    preco: '€5',
    preco_original: '€15',
    capa: '/produtos/guia-08-culpa-capa.png',
    badge: 'guia · novo',
    destaque: false,
    publicado: true,
    ordem: 16,
  },
  {
    slug: 'guia-09-meta',
    titulo: "De quem é esta meta?",
    subtitulo: "Parar a corrida do nunca-é-suficiente.",
    descricao: "Guia prático · 3281 palavras\\n\\nVer as metas que persegues que nunca foram tuas, e um teste para saberes de quem são.",
    preco: '€5',
    preco_original: '€15',
    capa: '/produtos/guia-09-meta-capa.png',
    badge: 'guia · novo',
    destaque: false,
    publicado: true,
    ordem: 17,
  },
  {
    slug: 'guia-10-receber',
    titulo: "Aprender a receber",
    subtitulo: "5 práticas para deixares entrar o que já é teu.",
    descricao: "Guia prático · 3423 palavras\\n\\nPorque custa receber, o reflexo de devolver, e cinco práticas concretas para receberes.",
    preco: '€5',
    preco_original: '€15',
    capa: '/produtos/guia-10-receber-capa.png',
    badge: 'guia · novo',
    destaque: false,
    publicado: true,
    ordem: 18,
  },
  {
    slug: 'guia-11-intensidade',
    titulo: "Amor ou intensidade?",
    subtitulo: "Um teste honesto antes de te entregares.",
    descricao: "Guia prático · 3107 palavras\\n\\nDistinguir o amor que faz bem do que só arde, com sinais de alerta de controlo e abuso.",
    preco: '€5',
    preco_original: '€15',
    capa: '/produtos/guia-11-intensidade-capa.png',
    badge: 'guia · novo',
    destaque: false,
    publicado: true,
    ordem: 19,
  },
  {
    slug: 'guia-12-lugar',
    titulo: "O teu lugar à mesa",
    subtitulo: "Ocupar o que é teu sem pedir licença.",
    descricao: "Guia prático · 3041 palavras\\n\\nA cadeira a que não te sentas, e um exercício para ocupares o teu lugar por inteiro.",
    preco: '€5',
    preco_original: '€15',
    capa: '/produtos/guia-12-lugar-capa.png',
    badge: 'guia · novo',
    destaque: false,
    publicado: true,
    ordem: 20,
  },
  {
    slug: 'guia-13-guarda',
    titulo: "Baixar a guarda em segurança",
    subtitulo: "Pequenos gestos para quem não pode falhar.",
    descricao: "Guia prático · 2858 palavras\\n\\nA armadura que já não precisas, e gestos pequenos e seguros para a pousares.",
    preco: '€5',
    preco_original: '€15',
    capa: '/produtos/guia-13-guarda-capa.png',
    badge: 'guia · novo',
    destaque: false,
    publicado: true,
    ordem: 21,
  },
  {
    slug: 'guia-14-parar',
    titulo: "Quem és quando paras",
    subtitulo: "Separar o teu valor do que produzes.",
    descricao: "Guia prático · 3089 palavras\\n\\nO valor preso ao fazer, quem és sem a tarefa, e um exercício para parares.",
    preco: '€5',
    preco_original: '€15',
    capa: '/produtos/guia-14-parar-capa.png',
    badge: 'guia · novo',
    destaque: false,
    publicado: true,
    ordem: 22,
  },
];

// ─── Livros profundos (mae-*, inf-*, pros-*, syn-*, per-*, for-*, tra-*) ───
// Gerados a partir do markdown em content/produtos via listarLivros(), em vez
// de escritos a mao. Cada um e um ebook publicado (€7). Entram automaticamente
// no pack do seu universo (download-pack filtra por slugToColecao).

const ORDEM_UNIVERSO: Record<string, number> = {
  mae: 1, inf: 2, pros: 3, syn: 4, per: 5, for: 6, tra: 7,
};

function indiceDe(l: { capitulos: { titulo: string }[] }): string {
  return l.capitulos
    .map((c, i) => `${i + 1}. ${c.titulo.replace(/^\d+\.\s*/, '')}`)
    .join('\n');
}

// capasRenderizadas = slugs cujo .jpg ja existe no Storage. So poe capa onde a
// capa editorial ja foi renderizada; os restantes ficam null ('sem capa') ate
// o render do universo correr e preencher produtos.capa.
function livrosProfundos(base: string, capasRenderizadas: Set<string>): SeedProduto[] {
  return listarLivros().map((l) => {
    const pre = l.slug.split('-')[0];
    const num = Number(l.slug.split('-')[1]) || 0;
    const temCapa = base && capasRenderizadas.has(l.slug);
    return {
      slug: l.slug,
      titulo: l.titulo,
      subtitulo: l.subtitulo,
      descricao: `**Ebook · ${l.palavras.toLocaleString('pt-PT')} palavras · ${l.capitulos.length} capítulos · PDF imediato**

${l.subtitulo}

**O que vais encontrar:**
${indiceDe(l)}

Por Vivianne dos Santos.`,
      preco: '€7',
      preco_original: '€29',
      capa: temCapa
        ? `${base}/storage/v1/object/public/viviannepag-assets/produtos/capas/${l.slug}.jpg`
        : null,
      badge: 'ebook',
      destaque: false,
      publicado: true,
      ordem: 100 + (ORDEM_UNIVERSO[pre] ?? 9) * 20 + num,
    };
  });
}

export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const results: { slug: string; status: string }[] = [];

  // Capas ja renderizadas no bucket publico (so poe capa onde o jpg existe).
  const capasRenderizadas = new Set<string>();
  try {
    const { data } = await supabase.storage
      .from('viviannepag-assets')
      .list('produtos/capas', { limit: 1000 });
    for (const f of data ?? []) {
      if (f.name?.endsWith('.jpg')) capasRenderizadas.add(f.name.replace(/\.jpg$/, ''));
    }
  } catch {}

  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
  const todos = [...PRODUTOS, ...livrosProfundos(base, capasRenderizadas)];

  for (const p of todos) {
    const { data: existing } = await supabase
      .from('produtos')
      .select('id')
      .eq('slug', p.slug)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('produtos')
        .update(p)
        .eq('slug', p.slug);
      results.push({ slug: p.slug, status: error ? `erro: ${error.message}` : 'atualizado' });
    } else {
      const { error } = await supabase
        .from('produtos')
        .insert(p);
      results.push({ slug: p.slug, status: error ? `erro: ${error.message}` : 'criado' });
    }
  }

  return NextResponse.json({ total: todos.length, results });
}
