import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const PRODUTOS = [
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

export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const results: { slug: string; status: string }[] = [];

  for (const p of PRODUTOS) {
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

  return NextResponse.json({ total: PRODUTOS.length, results });
}
