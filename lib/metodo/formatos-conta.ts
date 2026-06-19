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
}

export const FORMATOS_CONTA: Record<ContaId, Record<TipoPeca, FormatoConta>> = {
  vir: {
    descoberta: {
      nome: 'A cena primeiro · quando foi que me perdi de mim',
      beats: 3,
      registo: 'A CENA PRIMEIRO (manhã, faca): a cena da DISPERSÃO ilumina-se, não se explica. Pergunta-espinha (a mulher fá-la a si própria; NUNCA a digas nem nomeies o véu): "Quando foi que me perdi de mim?". TRÊS TEMPOS: (1) a CENA concreta do dia a dia que fura no 1.º segundo, (2) a cena ADENSA-SE, (3) a ASSINATURA "regressar" sozinha + o ENVIO que aponta para UMA pessoa ("Marca a que…" / "Envia a quem…"). MODELO (copia a FORMA, não o tema): "Entraste na cozinha para beber água. / Respondeste a uma mensagem. / Arrumaste uma gaveta. / E esqueceste-te da água. / regressar" + envio "Marca a que entra num sítio e já não sabe a que ia." SEM voz. Veste: bússolas, fios dourados, aves migratórias, rios de luz, constelações-guia (dourado, âmbar, azul nocturno, cobre); a imagem é o chamado, a cena é a dispersão.',
    },
    profundidade: {
      nome: 'A tarde · o chamado (voz-off, a bússola para dentro)',
      beats: 5,
      registo: 'TARDE, colo: VOZ-OFF contínua (o texto de cada beat é a voz-off), lento e dourado, a imagem TRANSFORMA-SE. Uma bússola antiga a girar sem parar (cobre) → a agulha abranda e aponta para dentro, ao fundo aves migratórias → um rio de luz dourado atravessa o céu nocturno e as aves seguem-no → as aves pousam, o rio aquieta num ponto central. Inclui a RAIZ com herança sem culpa ("talvez nem seja só teu: vens de mulheres que também se perderam a cuidar de tudo") e a VOLTA ("regressar não é parar de andar, é voltar a saber para onde"). Assinatura "regressar". ENVIO: "Envia a quem orienta toda a gente e perdeu o norte de si."',
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
      registo: 'É um ESPELHO SOCIAL, não fala da pessoa: fala do que a CULTURA tornou normal (a carga mental invisível das mulheres em casa, 2026). NÃO é sobre identidade (isso é a carta da manhã) nem sobre mecanismos (isso são as contas filhas): é sobre o hábito coletivo que toda a gente faz e já ninguém estranha. FORMA: cada beat é "Não normalizes" + UMA cena concreta, específica e observável. MODELOS (copia a FORMA e o grau de concreto, não o tema): "Não normalizes seres a única pessoa da casa que sabe quando vencem os documentos de todos." / "Não normalizes tratares de todos os assuntos da casa enquanto o teu marido vê televisão." / "Não normalizes saberes os medicamentos de todos e não te lembrares dos teus." / "Não normalizes interromperes o teu banho três vezes porque alguém te chamou." Acumula 3 a 4 cenas e FECHA no estalo "Espera. Isto não é normal." REGRAS DE FERRO: cenas concretas; NADA de teoria, mecanismos, diagnósticos, véus ou "porque". A resposta procurada é "espera, isto não é normal", nunca "aprendi algo".',
    },
  },
};

export const getFormatoConta = (conta: ContaId, tipo: TipoPeca): FormatoConta => FORMATOS_CONTA[conta][tipo];
