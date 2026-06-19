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
}

export const FORMATOS_CONTA: Record<ContaId, Record<TipoPeca, FormatoConta>> = {
  vir: {
    descoberta: {
      nome: 'A cena primeiro · quando foi que me perdi de mim',
      beats: 3,
      registo: 'A CENA PRIMEIRO (manhã, faca): a cena da DISPERSÃO ilumina-se, não se explica. Pergunta-espinha (a mulher fá-la a si própria; NUNCA a digas nem nomeies o véu): "Quando foi que me perdi de mim?". TRÊS TEMPOS: (1) a CENA concreta do dia a dia que fura no 1.º segundo, (2) a cena ADENSA-SE, (3) a ASSINATURA "regressar" sozinha + o ENVIO que aponta para UMA pessoa ("Marca a que…" / "Envia a quem…"). MODELO (copia a FORMA, não o tema): "Entraste na cozinha para beber água. / Respondeste a uma mensagem. / Arrumaste uma gaveta. / E esqueceste-te da água. / regressar" + envio "Marca a que entra num sítio e já não sabe a que ia." SEM voz. Veste: bússolas, fios dourados, aves migratórias, rios de luz, constelações-guia (dourado, âmbar, azul nocturno, cobre); a imagem é o chamado, a cena é a dispersão.',
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
      nome: 'A cena primeiro · porque faço isto sem reparar',
      beats: 3,
      registo: 'A CENA PRIMEIRO (manhã, faca): a cena ilumina-se, não se explica. Pergunta-espinha (a mulher fá-la a si própria; NUNCA a digas nem nomeies o véu): "Porque faço isto sem reparar?". TRÊS TEMPOS: (1) a CENA concreta do mecanismo invisível que fura no 1.º segundo, (2) a cena ADENSA-SE, (3) a ASSINATURA "revelar" sozinha + o ENVIO que aponta para UMA pessoa ("Marca quem…" / "Manda à amiga que…"). MODELO (copia a FORMA, não o tema): "O teu marido chega vinte minutos atrasado. / Na tua cabeça já houve uma discussão inteira. / revelar" + envio "Marca quem ensaia conversas que ainda não aconteceram." SEM voz. Veste: prismas, espelhos, véus translúcidos, geometrias (azul profundo, prata, violeta, branco lunar); a imagem revela, a cena é dita em texto.',
    },
    profundidade: {
      nome: 'A tarde · o porquê em voz baixa (a raiz, sem julgar)',
      beats: 5,
      registo: 'TARDE, colo: a mesma cena-tema da manhã, registo oposto. Voz-off OU texto lento, imagem contemplativa e lenta. Mostra a RAIZ sem julgar e HONRA a estratégia (foi inteligente, foi proteção), devolvendo segurança ao presente. MOLDE (do prisma): "Não estás louca." → a origem na infância sem culpa ("aos seis anos aprendeste a ver o perigo antes de ele chegar, porque alguém em casa mudava de humor sem aviso") → "ensaiar o pior foi como nunca foste apanhada de surpresa, foi proteção" → "hoje já não precisas de adivinhar tempestades para estares segura" → assinatura "revelar". ENVIO: "Manda a quem vive em alerta e não sabe porquê." Veste: prisma no escuro, a luz que assenta e se unifica num feixe sereno (violeta, prata, branco lunar).',
    },
  },
  viver: {
    descoberta: {
      nome: 'A cena primeiro · o que estou à espera para começar',
      beats: 3,
      registo: 'A CENA PRIMEIRO (manhã, faca): a cena da VIDA GUARDADA ilumina-se, não se explica. Pergunta-espinha (a mulher fá-la a si própria; NUNCA a digas nem nomeies o véu): "O que estou à espera para começar?". TRÊS TEMPOS: (1) a CENA concreta de algo guardado para depois que fura no 1.º segundo, (2) a cena ADENSA-SE, (3) a ASSINATURA "encarnar" sozinha + o ENVIO que aponta para UMA pessoa ("Marca quem…" / "Manda a quem…"). MODELO (copia a FORMA, não o tema): "Guardaste a loiça boa para uma ocasião especial. / A ocasião especial nunca chegou. / encarnar" + envio "Marca quem tem a loiça boa a ganhar pó." SEM voz. Veste: sementes, jardins, flores impossíveis, auroras, frutos dourados (verde esmeralda, ouro vivo, coral, branco solar); a imagem é a vida que espera, a cena é o que está guardado.',
    },
    profundidade: {
      nome: 'A tarde · o gesto de hoje',
      beats: 5,
      registo: 'TARDE, colo: voz-off suave OU texto. É um EXERCÍCIO concreto, não uma frase. "O exercício de hoje:" → uma micro-prática presente e pequena (o calor da chávena nas mãos, três respirações, reparar que já cá estás) → "Participar não é uma meta. É este instante." Assinatura "encarnar". ENVIO: "Guarda este. É o teu lembrete para os dias de quando." Veste: mãos que criam, sementes, frutos, rodas solares, uma flor a abrir (verde esmeralda, ouro vivo, coral).',
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
