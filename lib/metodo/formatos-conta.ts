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
  /** Carta do baralho "Sou Aquela": a figura É a personagem (em ângulos, feita no
   *  Midjourney) e o texto é a confissão dela na 1.ª pessoa ("sou aquela que…").
   *  Quando true, o motor permite figura/personagem e a 1.ª pessoa da carta. */
  cartaBaralho?: boolean;
}

export const FORMATOS_CONTA: Record<ContaId, Record<TipoPeca, FormatoConta>> = {
  vir: {
    descoberta: {
      nome: 'Faca fragmentada (da dispersão ao centro)',
      beats: 5,
      registo: 'SEM voz, rápido. A faca PARTE-SE em pedaços nos 3 primeiros beats (ex.: "Tens catorze separadores abertos" / "e nem um" / "és tu."). A imagem vai da DISPERSÃO (ex.: separadores que viram estrelas dispersas num céu nocturno) a um FIO DOURADO que se acende e desenha um caminho até um ponto central quieto. Beat final = a palavra "regressar".',
    },
    profundidade: {
      nome: 'Voz-off · a bússola que aponta para dentro',
      beats: 5,
      registo: 'VOZ-OFF contínua (o texto de cada beat é a voz-off). A imagem TRANSFORMA-SE: uma bússola antiga a girar sem parar (cobre) → a agulha abranda e aponta para dentro, ao fundo aves migratórias → um rio de luz dourado atravessa o céu nocturno e as aves seguem-no → as aves pousam, o rio aquieta. Inclui a RAIZ com herança ("talvez nem seja só teu: vens de mulheres que também andaram perdidas a cuidar de tudo") e a VOLTA ("regressar não é parar de andar, é deixar de te dispersares"). Beat final = "regressar".',
    },
  },
  ver: {
    descoberta: {
      nome: 'Espelho · 2000 vs 2026',
      beats: 5,
      registo: 'SEM voz, texto palavra-a-palavra. Um PRISMA divide a luz em dois tempos: à esquerda 2000 (o mesmo padrão na forma antiga), à direita 2026 (a forma de hoje, carga mental). Mostra que mudou tudo MENOS uma coisa (a lealdade/o padrão por baixo). No fim, um véu translúcido ergue-se e por baixo está a mesma silhueta: "Não é a época. É a lealdade." Veste: prismas, espelhos, geometrias sagradas, véus (azul profundo, prata, violeta).',
    },
    profundidade: {
      nome: 'Reconhecimento interativo (5 frases · comenta o número)',
      beats: 6,
      registo: 'SEM voz, gera comentários/DM. Beat 1: um espelho infinito, "Cinco frases. Para na que te apertar o peito." Beats 2-6: CINCO frases numeradas (1..5), cada uma um comportamento concreto e específico DESTE véu, cada uma sobre um cristal/geometria diferente. Beat final: "A que te apertou tem nome. E vê-se." ENVIO: "Comenta o número que te parou." Veste: espelhos infinitos, cristais, geometrias (azul profundo, prata, violeta).',
    },
  },
  viver: {
    descoberta: {
      nome: 'Microdrama de objetos (o "quando")',
      beats: 5,
      registo: 'SEM voz, texto + som. Microdrama SEM rosto, só objetos, sobre adiar a vida ("quando acabar isto / quando emagrecer / quando tiver tempo"). Ex.: uma mala feita à porta (aurora) → uma semente na palha nunca plantada → um jardim verde-esmeralda visto através de um vidro fechado, ela do lado de dentro → a mão abre-se, a semente cai na terra e uma flor impossível começa a abrir → "Não há comboio a partir sem ti. A estreia é hoje." Beat final = "encarnar". Veste: sementes, jardins, flores impossíveis, auroras (verde esmeralda, ouro vivo, coral).',
    },
    profundidade: {
      nome: 'O gesto / exercício do dia',
      beats: 5,
      registo: 'Voz-off suave OU texto. É um EXERCÍCIO concreto, não uma frase. "O exercício de hoje:" → uma micro-prática presente e pequena (ex.: o calor da chávena nas mãos, três respirações, reparar que já cá estás) → "Participar não é uma meta. É este instante." Mãos na terra, uma semente a ser plantada devagar, uma flor a abrir / roda solar. ENVIO: "Guarda este. É o teu lembrete para os dias de quando." Veste: mãos que criam, sementes, frutos, rodas solares (verde esmeralda, ouro vivo, coral).',
    },
  },
  mae: {
    descoberta: {
      nome: 'Carta do baralho · Sou Aquela',
      beats: 5,
      cartaBaralho: true,
      registo: 'É uma CARTA do baralho "Sou Aquela" (a FRENTE da carta), não um reel comum. A FIGURA é a PERSONAGEM do dia, em ângulos diferentes de carta para carta (rosto sereno, silhueta, de costas, o símbolo do seu padrão); a Vivianne gera a imagem no Midjourney, aqui dás só a indicação da figura. O TEXTO é a confissão da personagem na PRIMEIRA pessoa, no ritmo das cartas: abre com uma anáfora forte ou "Sou aquela que…" e FECHA com "Não porque [o juízo fácil]. Porque [o motivo digno, a lealdade]." MODELO (carta A Leal): "Fiquei mais tempo do que devia. Aguentei mais do que devia. Esperei mais do que devia. Não porque fosse fraca. Porque fui leal." Nomeia a personagem com dignidade, NUNCA a julgues. É uma FACA: poucas linhas, e a mulher diz "sou eu". Cada beat = a figura num ângulo + a linha da confissão que aparece.',
    },
    profundidade: {
      nome: 'A voz · confissão e direção',
      beats: 5,
      registo: 'Voz-off contínua, 1.ª pessoa, contemplativa (o registo "Hoje em mim"): nomeia o padrão, mostra a raiz/herança sem culpa, e a volta com agradecimento (honra a estratégia, e solta). Termina numa direção concreta. Veste: velas, constelações vivas, manuscritos (âmbar, ouro velho, negro estrelado).',
    },
  },
};

export const getFormatoConta = (conta: ContaId, tipo: TipoPeca): FormatoConta => FORMATOS_CONTA[conta][tipo];
