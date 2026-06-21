// Universo VS · OS FORMATOS PRÓPRIOS DE CADA CONTA (2 por conta: descoberta + profundidade).
//
// É AQUI que as contas se individualizam: a MECÂNICA é igual (faca partida → a
// imagem mexe → raiz → volta → envio), mas cada conta tem um FORMATO próprio (a
// estrutura da peça) + a sua veste. Sem isto, os calendários por conta sairiam
// iguais. Spec da Vivianne (FORMATOS PLANO A PLANO), construída de raiz.
//
// `registo` = a estrutura/mecânica específica desta peça, que guia a geração.

import type { ContaId } from './contas';
import type { TipoPeca } from './storyboard-ia';

export interface FormatoConta {
  nome: string;     // como se chama esta peça
  beats: number;    // quantos beats
  registo: string;  // a estrutura específica (o que a torna esta conta, não outra)
  /** Carta do baralho "Sou Aquela": a figura É a personagem (em ângulos) e o texto
   *  é a confissão dela na 1.ª pessoa ("sou aquela que…"). A imagem da figura é
   *  GERADA na API (Flux/Replicate, gerarImagemFlux) — NUNCA no Midjourney à mão.
   *  Quando true, o motor permite figura/personagem e a 1.ª pessoa da carta. */
  cartaBaralho?: boolean;
  /** "Não normalizes…" (TARDE da mãe): espelho social — não fala da pessoa, fala
   *  do que a CULTURA tornou normal. Cenas concretas, zero teoria/mecanismo/véu;
   *  a resposta procurada é "espera, isto não é normal". */
  naoNormalizes?: boolean;
  /** "Carta de renomear" (TARDE da vir): carta pessoal (2.ª pessoa) que dá um nome
   *  NOVO a uma história antiga. Não consola, não ensina, não diagnostica: renomeia.
   *  Pega num NOME ANTIGO (madura, responsável…) e vira-lhe o significado com uma
   *  FRASE DE VIRAGEM. Quando true, o motor escreve a carta de 5 partes. */
  cartaRenomear?: boolean;
  /** "O Espelho" (TARDE da ver): revela porque é que uma pessoa concreta ficou a
   *  viver na cabeça de quem vê. Abre PARA FORA (uma pessoa real, a faca) e vira
   *  PARA DENTRO (porque a escolheste para espelho). O outro é o vidro, tu o filme. */
  espelho?: boolean;
  /** "Repara" (a VIVER): a imagem manda, a palavra serve (1-2 linhas, nunca mais).
   *  Aponta para o que JÁ está aqui e a que não davas atenção (olha para cá, agora).
   *  Sem moral, sem lição, sem hook agressivo: um sussurro ao lado da imagem. */
  repara?: boolean;
}

export const FORMATOS_CONTA: Record<ContaId, Record<TipoPeca, FormatoConta>> = {
  vir: {
    descoberta: {
      nome: 'Carta de renomear · a abertura (manhã)',
      beats: 4,
      cartaRenomear: true,
      registo: 'CARTA DE RENOMEAR em versão CURTA (manhã, o gancho da conta — NÃO uma "cena" genérica): renomeia uma história antiga em MENOS passos, por esta ordem: (1) CENA concreta que para o scroll (uma fotografia/memória que se VÊ, nunca a identidade nem a tese); (2) o NOME antigo que a pessoa carregou a vida toda (madura, organizada, forte, responsável, prestável, sensata); (3) a RELEITURA, a viragem onde a carta acontece (o nome nunca foi um elogio, era a maneira bonita de dizer "precisávamos de ti"); (4) ABERTURA que não manda, só ABRE ("talvez já possas pousá-la"). É carta pessoal, 2.ª pessoa, íntima. Tipográfica, em papel, NÃO Flux, SEM travessões. A versão completa de 6 passos é a da tarde.',
    },
    profundidade: {
      nome: 'Carta de renomear (dá um nome novo a uma história antiga)',
      beats: 6,
      cartaRenomear: true,
      registo: 'É uma CARTA pessoal (2.ª pessoa, ex.: "À filha mais velha,") que RENOMEIA uma história antiga. NÃO é frase inspiracional, NÃO valida, NÃO aconselha, NÃO é exercício, NÃO explica véus. Se pudesse estar em mil contas de desenvolvimento pessoal, FALHOU. A pessoa passou a vida a explicar-se de UMA maneira; a carta mostra-lhe OUTRA. Não consola, não ensina, não diagnostica: RENOMEIA. PARA O SCROLL no 1.º beat (capa): abre numa CENA concreta (uma fotografia/memória que se VÊ), NÃO na identidade ("para a filha mais velha") nem na tese ("madura ou necessária"); a cena entra antes do conceito, faz VER antes de fazer pensar. Ex.: "Eras criança. Já tomavas conta de todos." A reviravolta vem depois, na viagem. A carta revela-se EM MOVIMENTO, é um reel, NÃO um muro de texto parado. ARQUITETURA (a engenharia própria da vir; é um MOLDE REUTILIZÁVEL, 6 passos por esta ordem, a CAPA é o passo 1): (1) CENA, a fotografia que entra pelo corpo, não pela cabeça; (2) VIDA por trás, a realidade concreta onde ela se reconhece; (3) NOME antigo que carregou a vida toda (madura, organizada, forte, independente, prestável, responsável, sensata); (4) RELEITURA, a viragem onde a CARTA ACONTECE (o nome nunca foi um elogio: "ou só a maneira bonita de dizer: precisávamos de ti"); (5) PREÇO, uma SENSAÇÃO traduzida, não explicada ("ainda hoje descansar sabe a dívida"); (6) ABERTURA, não manda, não ensina, não resolve, só ABRE ("talvez já possas pousá-la"). A carta RESPIRA: não despeja tudo de uma vez. MODELOS (o MESMO molde em nomes diferentes, copia o MOVIMENTO não o tema): [responsável] "Eras criança e já tomavas conta de todos. Chamaram-te madura, responsável, sensata. Mas nenhuma era um elogio, eram a maneira bonita de dizer: precisávamos de ti. Por isso ainda hoje descansar te sabe a dívida. Pediram-te uma força que não era tua para dar, e talvez já possas pousá-la." · [organizada] "Tinhas doze anos e já sabias onde estava tudo. Chamaram-te organizada. Talvez estivesses só sozinha a segurar o que mais ninguém segurava. Ainda hoje só te deixas descansar quando está tudo tratado. Nunca foi tua função segurar o mapa inteiro." · [forte] "Quando todos caíam, eras tu que ficavas de pé. Chamaram-te forte. Ou a única sem autorização para cair. Ainda hoje pedes desculpa quando precisas. Talvez já possas ser amparada." TESTE: a pessoa pensa "nunca tinha visto isto desta maneira", nunca "sinto-me validada" nem "recebi um conselho". FORMA VISUAL (dois registos): a CAPA (1.º beat) PARA O SCROLL com a frase-cena GRANDE a ocupar o ecrã, CONTRASTE a sério (claro sobre escuro quente) e MICRO-MOVIMENTO (a letra a assentar, grão de luz) para ler como REEL; o CORPO da carta é tipográfico em papel envelhecido com timbre da conta (a definir), as palavras a revelarem-se. Evita o sépia-sobre-sépia (confunde-se com mil cartões de citações). NÃO é cena fotográfica nem Flux. SEM travessões.',
    },
  },
  ver: {
    descoberta: {
      nome: 'O Espelho · o gancho (manhã)',
      beats: 3,
      espelho: true,
      registo: 'O ESPELHO em modo GANCHO (manhã, FACA, fura para estranhos — NÃO uma "cena" genérica): a versão curta de O Espelho. (1) ABRE PARA FORA, aponta para uma pessoa concreta que vive na cabeça de quem vê (a colega, a mulher que segue, a cunhada): o murro que para o scroll; (2) o comportamento exato que a faz viver-lhe na cabeça; (3) UMA linha que começa a VIRAR para dentro (o outro mostra-te a ti) + a assinatura "revelar". Não despejes a peça inteira — o virar fundo é a tarde. MECANISMO em linguagem da vida, nunca teoria nem véu. LINHA VERMELHA: o outro mostra-te a ti, NUNCA "analisa os outros". Veste: prismas, espelhos, véus translúcidos (azul profundo, prata, violeta, branco lunar).',
    },
    profundidade: {
      nome: 'O Espelho (quem te vive na cabeça · fora → dentro)',
      beats: 5,
      espelho: true,
      registo: 'O ESPELHO (tarde da ver) = REVELAR. A matéria: quem fica a VIVER DENTRO DA CABEÇA de quem vê (quem admira, inveja, detesta, não esquece, quem a irrita ou intimida). O outro é o VIDRO; ela é o FILME. Não revela quem o outro é, revela PORQUE é que ELA o escolheu para espelho. ESTRUTURA: (1) ABRE PARA FORA, aponta para uma figura concreta da vida de quem vê (a colega, a mulher que segue), o murro que para o scroll; (2) APROFUNDA, o comportamento exato, sobe o reconhecimento; (3) VIRA O VIDRO, de fora para dentro (a alma da peça): porque, entre milhões, esta ficou a viver nela; (4) POUSO, frase curta que liberta, palavra final "revelar" ou nada. MECANISMO (em linguagem da vida, NUNCA teoria nem véu): inveja = a vida que não te deixaste querer; irritação desproporcional = o outro faz o que tu te proíbes; intimidação = a permissão que não te deste; não esquecer = uma frase tua que ficou por dizer. LINHA VERMELHA: sempre "o outro mostra-te a ti", NUNCA "analisa os outros". Liberta, não bisbilhota. MOLDE: "Há uma mulher que segues só para te irritares. Vê-la mais vezes por dia do que vês quem amas. Ela não te irrita por ser falsa, irrita-te porque se permite a coisa que tu te proíbes: ocupar espaço sem pedir desculpa. O outro era só o vidro. O filme eras tu." ENVIO: "Manda a quem tem uma pessoa a viver-lhe na cabeça de borla." Veste: espelhos infinitos, máscaras que se desfazem, fios invisíveis tornados visíveis, prismas, véus translúcidos (azul profundo, prata, violeta, branco lunar). Sem rosto, sem voz, texto + imagem que respira.',
    },
  },
  viver: {
    descoberta: {
      nome: 'Repara · o instante (manhã)',
      beats: 2,
      repara: true,
      registo: 'REPARA em modo manhã (o gancho da conta — NÃO uma "cena" genérica): a imagem manda, a palavra serve (1 a 2 linhas, nunca mais). Aponta para um instante REAL e específico do presente a que não se dá atenção (uma luz a certa hora, um cheiro, um gesto, uma textura). Em 2026 o que se mete entre a pessoa e o instante é muitas vezes o ECRÃ (vive para o post, não para si). UMA linha que aponta + um fio de verdade leve, NUNCA moral, NUNCA lição, NUNCA "e é por isso que…". Assinatura "encarnar" ou nada. Veste: mãos, sementes, frutos dourados, auroras, flores, rodas solares (verde esmeralda, ouro vivo, coral, branco solar).',
    },
    profundidade: {
      nome: 'Repara · um instante, com um fio de verdade',
      beats: 2,
      repara: true,
      registo: 'REPARA, com um FIO DE VERDADE por baixo (sem peso, nunca vazio). A imagem manda, a palavra serve (1 a 2 linhas, nunca mais). Aponta para um instante REAL e específico do presente (lembram-se, não se inventam): uma luz a certa hora, um cheiro, um gesto, uma textura. Em 2026, o que muitas vezes está ENTRE a pessoa e o instante é o ECRÃ (vive para o post, não para si): o Repara é, no fundo, pousar o telemóvel e olhar. Uma linha que aponta + um fio de verdade leve (NUNCA moral, NUNCA lição, NUNCA "e é por isso que…"). Ex.: imagem da luz das cinco da tarde na parede da cozinha + "Estavas à espera de uma vida maior. Era esta." SEM voz dramática, SEM hook agressivo, SEM texto palavra-a-palavra. Assinatura "encarnar" ou nada. Envio suave e opcional. Veste: mãos, sementes, frutos dourados, auroras, flores, rodas solares (verde esmeralda, ouro vivo, coral, branco solar).',
    },
  },
  mae: {
    descoberta: {
      nome: 'Carta do baralho · Sou Aquela',
      beats: 5,
      cartaBaralho: true,
      registo: 'É uma CARTA do baralho "Sou Aquela" (a FRENTE da carta), não um reel comum. A FIGURA é a PERSONAGEM do dia, em ângulos diferentes de carta para carta (rosto sereno, silhueta, de costas, o símbolo do seu padrão); a imagem da figura é GERADA na API (Flux, gerarImagemFlux) — NUNCA no Midjourney. O prompt descreve a personagem como ILUSTRAÇÃO coerente (a mesma mulher dentro da carta, só o ângulo/símbolo muda) na veste da mãe (velas, constelações, manuscritos; âmbar, ouro velho, negro estrelado). O TEXTO é a confissão da personagem na PRIMEIRA pessoa, no ritmo das cartas: abre com uma anáfora forte ou "Sou aquela que…" e FECHA com "Não porque [o juízo fácil]. Porque [o motivo digno, a lealdade]." MODELO (carta A Leal): "Fiquei mais tempo do que devia. Aguentei mais do que devia. Esperei mais do que devia. Não porque fosse fraca. Porque fui leal." Nomeia a personagem com dignidade, NUNCA a julgues. É uma FACA: poucas linhas, e a mulher diz "sou eu". Cada beat = a figura num ângulo + a linha da confissão que aparece.',
    },
    profundidade: {
      nome: 'Não normalizes… (espelho social)',
      beats: 5,
      naoNormalizes: true,
      registo: 'É um ESPELHO SOCIAL, não fala da pessoa: fala do que a CULTURA tornou normal. O TEMA NÃO é "fazer muito"/tarefas (lavar pratos): é a ASSIMETRIA invisível, em duas famílias: (1) RESPONSABILIDADE INVISÍVEL SEM AUTORIDADE EQUIVALENTE (ser responsável por tudo e dona de quase nada; a gestão é obrigação dela e a participação dele é "ajuda"; a lista dela obrigatória e a dele opcional; directora-geral da família sem nunca ter aceite o cargo) e (2) GESTÃO EMOCIONAL (responsável pelas emoções de todos menos as suas; a paz da casa depende do seu estado emocional; engolir o cansaço para não estragar o ambiente). NÃO é sobre identidade (isso é a carta da manhã) nem sobre mecanismos (isso são as filhas). FORMA: cada beat é "Não normalizes" + UMA assimetria concreta e observável de 2026. MODELOS (copia a FORMA e o tipo de assimetria, não o tema à letra): "Não normalizes seres responsável por tudo e dona de quase nada." / "Não normalizes que a gestão da casa seja tua obrigação e a participação dele seja ajuda." / "Não normalizes que a paz da casa dependa do teu estado emocional." / "Não normalizes que a tua irritação seja um problema e a tua exaustão uma expectativa." DUAS PARTES numa só peça: a FACA (os primeiros beats, "Não normalizes" + assimetria; o 1.º é o murro que para o scroll, fúria com dignidade, a frase que se manda à irmã) E a VOLTA (os últimos 1 a 2 beats, a tua teoria: vira para a SOBREVIVÊNCIA sem suavizar, para LIBERTAR). MOLDE da volta: "Aprendeste a gerir tudo quando eras a menina que segurava a casa. Foi como sobreviveste. Mas já não és essa menina, e podes pousar o cargo." A faca corta (partilha), a volta solta (o método). REGRAS DE FERRO: assimetrias concretas; NUNCA véu, jargão, diagnóstico nem "porque" teórico. A faca nomeia a injustiça, a volta liberta na linguagem da vida.',
    },
  },
};

export const getFormatoConta = (conta: ContaId, tipo: TipoPeca): FormatoConta => FORMATOS_CONTA[conta][tipo];
