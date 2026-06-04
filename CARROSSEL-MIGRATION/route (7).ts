// Conteúdo do Carrossel "A Estação dos Véus". 42 slides (7 dias × 6).
// Espelha carrossel-veus/content.json (versão LUZ, lado luminoso de cada véu).
// Mantêr os dois sincronizados se editares.
// Tipos vêm de @/lib/carousel-types para haver uma única fonte da verdade.

export type {
  Slide,
  SlideCapa,
  SlideConteudo,
  SlideCta,
  Dia,
} from "@/lib/carousel-types";

import type { Dia } from "@/lib/carousel-types";

export const CAMPANHA = "A Estação dos Véus";

export const DIAS: Dia[] = [
  {
    numero: 1,
    veu: "PERMANÊNCIA",
    subtitulo: "Encobre a impermanência da vida.",
    romano: "I / VII",
    slides: [
      { tipo: "capa", linha1: "Maputo está a esfriar.", linha2: "E algo em ti acorda." },
      { tipo: "conteudo", estilo: "poetico", texto: "A estação fria é curta aqui.\nPor isso te lembra depressa:\ntudo floresce de novo." },
      { tipo: "conteudo", estilo: "prosa", texto: "Por baixo do Véu da Permanência mora uma promessa: tu não és uma fotografia. És um rio. O que sentes hoje já está a tornar-se outra coisa." },
      { tipo: "conteudo", estilo: "poetico", texto: "Tudo passa.\n\nE nisso mora a tua liberdade." },
      { tipo: "conteudo", estilo: "prosa", titulo: "Hábito da estação", texto: "Escreve uma frase por dia sobre algo que floresce em ti, mesmo que pareça mínimo." },
      { tipo: "cta", icone: "📖", recurso: "Os 7 Véus do Despertar", descricao: "Pega no primeiro véu. Pelos olhos, pela alma, pelas mãos.", url: "seteveus.space/livro-fisico" },
    ],
  },
  {
    numero: 2,
    veu: "MEMÓRIA",
    subtitulo: "Encobre a liberdade do presente.",
    romano: "II / VII",
    slides: [
      { tipo: "capa", linha1: "Tens uma história.", linha2: "E hoje és nova." },
      { tipo: "conteudo", estilo: "prosa", texto: "O frio que vem aí convida ao recolhimento. E no recolhimento, a memória vem visitar. Não para te prender. Para se despedir com ternura." },
      { tipo: "conteudo", estilo: "prosa", texto: "Por baixo do Véu da Memória há uma escolha nova à tua espera. O passado é só um conselho. Tu não és obrigada a segui-lo." },
      { tipo: "conteudo", estilo: "prosa", titulo: "Hábito da estação", texto: "Identifica uma história antiga sobre ti. Celebra a versão tua que já não cabe nela." },
      { tipo: "conteudo", estilo: "prosa", texto: "A Colecção Espelhos foi escrita para esta passagem. Sete ficções luminosas onde te encontras. Espelho da Ilusão é a primeira porta." },
      { tipo: "cta", icone: "📚", recurso: "Colecção Espelhos", descricao: "7 ficções de luz para te reconheceres. Acesso vitalício.", url: "seteveus.space/comprar/espelhos" },
    ],
  },
  {
    numero: 3,
    veu: "TURBILHÃO",
    subtitulo: "Encobre o silêncio do ser.",
    romano: "III / VII",
    slides: [
      { tipo: "capa", linha1: "A mente não pára.", linha2: "Mas tu és quem a escuta." },
      { tipo: "conteudo", estilo: "prosa", texto: "Quando o frio chegar, há outra opção além de encher. Há um sítio em ti onde o turbilhão não chega. E estás convidada a entrar." },
      { tipo: "conteudo", estilo: "poetico", texto: "O silêncio não é vazio.\nÉ o sítio onde te encontras\ndebaixo do ruído." },
      { tipo: "conteudo", estilo: "prosa", titulo: "Hábito da estação", texto: "10 minutos. Sem telemóvel, sem música. Só tu e o que floresce em silêncio." },
      { tipo: "conteudo", estilo: "prosa", texto: "Quando o silêncio for muito, há som feito pra te acompanhar dentro dele, não pra preencher. Paisagens Interiores, em Music Véus." },
      { tipo: "cta", icone: "🎧", recurso: "Music Véus", descricao: "Banda sonora para escutar dentro. Primeira faixa de cada álbum gratuita.", url: "music.seteveus.space" },
    ],
  },
  {
    numero: 4,
    veu: "ESFORÇO",
    subtitulo: "Encobre o repouso interior.",
    romano: "IV / VII",
    slides: [
      { tipo: "capa", linha1: "Mereces descansar agora.", linha2: "O agora é suficiente." },
      { tipo: "conteudo", estilo: "poetico", texto: "Nunca está tudo feito.\n\nE ainda bem." },
      { tipo: "conteudo", estilo: "prosa", texto: "Por baixo do Véu do Esforço, o teu corpo já sabe. Esta estação vai pedir-te calma. E isso, por si, é uma forma de chegada." },
      { tipo: "conteudo", estilo: "prosa", texto: "A estação fria em Maputo é breve. Usa-a pra parar, não pra acelerar. E pra cuidar do corpo com calma. Sem dieta, sem culpa." },
      { tipo: "conteudo", estilo: "prosa", titulo: "Hábito da estação", texto: "VITALIS é reeducação alimentar com comida nossa: xima, matapa, caril. Plano personalizado, check-in de 30 segundos por dia." },
      { tipo: "cta", icone: "🌿", recurso: "VITALIS", descricao: "Plano alimentar moçambicano. Sem balança, sem extremos.", url: "app.seteecos.com/vitalis" },
    ],
  },
  {
    numero: 5,
    veu: "DESOLAÇÃO",
    subtitulo: "Encobre a fertilidade do vazio.",
    romano: "V / VII",
    slides: [
      { tipo: "capa", linha1: "Sentes um espaço em ti.", linha2: "E nele cabe tudo o que vem aí." },
      { tipo: "conteudo", estilo: "prosa", texto: "O frio mostra o que o calor disfarça. Espaço. Escuta. A vontade de recomeçar. Chegam." },
      { tipo: "conteudo", estilo: "poetico", texto: "O vazio que sentes\nnão é abandono.\nÉ terra preparada." },
      { tipo: "conteudo", estilo: "prosa", titulo: "Hábito da estação", texto: "Senta-te com o espaço cinco minutos. Sem resolver, sem encher. Só recebê-lo." },
      { tipo: "conteudo", estilo: "prosa", texto: "Há um diagnóstico gratuito que ilumina onde estás agora: corpo, mente, emoção. Sete perguntas, dois minutos. Chama-se LUMINA." },
      { tipo: "cta", icone: "✨", recurso: "LUMINA · Diagnóstico", descricao: "Gratuito. 2 minutos. Mostra o que estava à espera de luz.", url: "app.seteecos.com/lumina" },
    ],
  },
  {
    numero: 6,
    veu: "HORIZONTE",
    subtitulo: "Encobre a infinitude da consciência.",
    romano: "VI / VII",
    slides: [
      { tipo: "capa", linha1: "Achas que vais chegar.", linha2: "Já chegaste." },
      { tipo: "conteudo", estilo: "prosa", texto: "Por baixo do Véu do Horizonte mora um segredo simples: a vida que esperas começar quando emagreceres, quando o livro sair, quando os filhos crescerem. Já começou. Está aqui." },
      { tipo: "conteudo", estilo: "poetico", texto: "A vida não está depois.\nEstá agora.\nE bate à tua porta." },
      { tipo: "conteudo", estilo: "prosa", titulo: "Hábito da estação", texto: "Faz uma coisa que estavas a adiar pra \"quando estivesse pronta\". Pequena. Imperfeita. Agora." },
      { tipo: "conteudo", estilo: "prosa", texto: "Estão a chegar 10 cursos de transformação interior: Ouro Próprio, Limite Sagrado, A Arte da Inteireza, e mais. Manifesta interesse pra seres das primeiras a entrar." },
      { tipo: "cta", icone: "🕯️", recurso: "Escola dos Véus · em breve", descricao: "Manifesta interesse e recebe acesso prioritário.", url: "seteveus.space/cursos" },
    ],
  },
  {
    numero: 7,
    veu: "DUALIDADE",
    subtitulo: "Encobre a unidade do real.",
    romano: "VII / VII",
    slides: [
      { tipo: "capa", linha1: "És tu.", linha2: "E és tudo o que respira contigo." },
      { tipo: "conteudo", estilo: "prosa", texto: "O último véu cai quando lembras: pertences. À tua família. Ao teu corpo. A ti mesma. À vida toda." },
      { tipo: "conteudo", estilo: "poetico", texto: "Estás inteira.\nSempre estiveste." },
      { tipo: "conteudo", estilo: "prosa", texto: "O frio que vem aí é o mesmo que vai arrefecer esta cidade inteira. O cansaço que sentes é partilhado. O desejo de recomeçar também." },
      { tipo: "conteudo", estilo: "prosa", texto: "Os Ecos são onde isto se torna visível: comunidade anónima, partilha sem máscara, reconhecimento mútuo. Incluído em qualquer experiência." },
      { tipo: "cta", icone: "🌀", recurso: "Começa onde sentires", descricao: "Livro · Espelhos · Music Véus · Vitalis · Lumina · Ecos", url: "seteveus.space + app.seteecos.com" },
    ],
  },
];
