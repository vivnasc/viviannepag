// Método VS · CAMADA 1 — os MOTORES EDITORIAIS (os "8 formatos" da tarde).
//
// DECISÃO de arquitetura (validada em equipa): isto NÃO são formatos de Instagram.
// São MOTORES editoriais — a parte difícil, que gera conteúdo infinito coerente
// com os véus. Cada motor é uma ESTRUTURA RETÓRICA (uma sequência de beats) +
// a DIMENSÃO do SABER que o alimenta. NÃO sabe o que é um slide, reel ou carrossel.
//
// O motor produz BEATS (unidades de texto, por ordem). O RECIPIENTE (Camada 2:
// motion, reel narrado, vídeo IA, imagem, carrossel) veste os beats — e troca-se
// sem tocar aqui. Esta camada é para CONGELAR.
//
// Princípio inviolável (igual ao resto do método): NÃO é didática (isso é a
// veu.a.veu). Revela a DOR e aponta uma DIREÇÃO, na linguagem das dores da vida.
// O SABER e as referências dão profundidade SÓ por baixo; nunca jargão/autores.
// O ÚLTIMO beat é sempre a saída/direção, não uma lição.

import type { DimensaoVeu } from './veu-faces';

export type FormatoId = 'mecanismo' | 'origem' | 'erro' | 'custo' | 'mapa' | 'cena' | 'mito' | 'veude';

export interface BeatSpec {
  /** o papel deste beat na estrutura (rótulo curto, para o admin/depuração). */
  papel: string;
  /** o que a IA deve escrever neste beat. */
  instrucao: string;
}

export interface Formato {
  id: FormatoId;
  nome: string;
  /** a dimensão do SABER que alimenta este motor (matéria-prima por véu). */
  dimensao: DimensaoVeu;
  /** o que este motor faz (uma linha). */
  proposito: string;
  /** a estrutura retórica: os beats, por ordem. É o coração do motor. */
  beats: BeatSpec[];
  /** instrução global de registo para a IA (o tom deste motor). */
  guia: string;
}

export const FORMATOS: Formato[] = [
  {
    id: 'mecanismo',
    nome: 'O Mecanismo Invisível',
    dimensao: 'mecanismos',
    proposito: 'Explica COMO o véu funciona por dentro (o que parece um defeito é um mecanismo).',
    guia: 'Começa por um comportamento que a pessoa reconhece, e revela o mecanismo escondido por trás. Surpreende: a causa não é a óbvia.',
    beats: [
      { papel: 'gancho', instrucao: 'Um comportamento observável do dia a dia, em pergunta ou afirmação ("Porque fazes X?" / "Fazes X.").' },
      { papel: 'viragem', instrucao: 'A explicação inesperada: não é o que a pessoa pensa que é.' },
      { papel: 'mecanismo', instrucao: 'O que o padrão faz por dentro (como se mantém, o que está a tentar resolver).' },
      { papel: 'direção', instrucao: 'A saída concreta: o que muda quando vês o mecanismo. Não é lição, é um passo.' },
    ],
  },
  {
    id: 'origem',
    nome: 'A Origem',
    dimensao: 'origens',
    proposito: 'Mostra de onde o padrão veio (foi aprendido, não é defeito) — sem culpa.',
    guia: 'Liga o comportamento de hoje a uma função protetora antiga. Tom de alívio, nunca de acusação. Nada começou na pessoa.',
    beats: [
      { papel: 'gancho', instrucao: 'O comportamento de hoje, concreto.' },
      { papel: 'raiz', instrucao: 'A função protetora antiga: o que isto te protegeu quando eras pequena (sem culpar ninguém).' },
      { papel: 'hoje', instrucao: 'Porque continua hoje, mesmo já não sendo preciso.' },
      { papel: 'direção', instrucao: 'A saída: podes pousar/devolver o que já não é teu.' },
    ],
  },
  {
    id: 'erro',
    nome: 'O Erro de Interpretação',
    dimensao: 'crencas',
    proposito: 'Desmonta uma crença que prende ("pensas que é X, é Y").',
    guia: 'Pega no que a pessoa acredita sobre si e vira-o. O alívio está em descobrir que a leitura estava errada.',
    beats: [
      { papel: 'mito', instrucao: 'O que a pessoa pensa que é ("Pensas que és/é X").' },
      { papel: 'verdade', instrucao: 'O que é na verdade ("Na verdade é Y").' },
      { papel: 'explicação', instrucao: 'Porquê: o que o padrão fez para a fazer acreditar no erro.' },
      { papel: 'direção', instrucao: 'A saída: o que muda quando trocas a leitura.' },
    ],
  },
  {
    id: 'custo',
    nome: 'O Custo Escondido',
    dimensao: 'custos',
    proposito: 'Cria consciência do preço invisível que o padrão cobra.',
    guia: 'O padrão tem um benefício aparente; mostra o custo que não se soma. Termina sem moralizar, com um gesto pequeno e real.',
    beats: [
      { papel: 'benefício', instrucao: 'O benefício aparente do padrão (o que parece que te dá).' },
      { papel: 'cena', instrucao: 'Uma cena concreta onde o custo aparece, sem o nomear ainda.' },
      { papel: 'custo', instrucao: 'O preço invisível: o que isto te tira por dentro.' },
      { papel: 'verdade', instrucao: 'A verdade dura, dita com cuidado.' },
      { papel: 'direção', instrucao: 'Um gesto pequeno e concreto para hoje (não um conselho genérico).' },
    ],
  },
  {
    id: 'mapa',
    nome: 'O Mapa do Véu',
    dimensao: 'mapa',
    proposito: 'Diagnóstico replicável: pensas / sentes / fazes / pagas.',
    guia: 'O formato mais forte e claro. Cada beat é uma das quatro camadas do padrão, na 1.ª pessoa, curtas e exatas.',
    beats: [
      { papel: 'pensas', instrucao: 'O pensamento típico de quem está neste véu ("Pensas: ...").' },
      { papel: 'sentes', instrucao: 'A sensação no corpo/emoção ("Sentes: ...").' },
      { papel: 'fazes', instrucao: 'O que a pessoa faz por causa disso ("Fazes: ...").' },
      { papel: 'pagas', instrucao: 'O preço que paga ("Pagas: ...").' },
      { papel: 'direção', instrucao: 'A saída: o primeiro lugar onde se quebra o mapa.' },
    ],
  },
  {
    id: 'cena',
    nome: 'Cena do dia a dia',
    dimensao: 'cenas',
    proposito: 'Reconhecimento profundo a partir de uma cena pequena e sensorial.',
    guia: 'Abre com uma cena tão concreta que a pessoa se vê nela. Depois lê o que essa cena revela do padrão.',
    beats: [
      { papel: 'cena', instrucao: 'Uma cena concreta e sensorial de um dia normal (objetos, gestos, horas).' },
      { papel: 'comportamento', instrucao: 'O que a pessoa faz nessa cena, sem ainda explicar.' },
      { papel: 'leitura', instrucao: 'O que essa cena revela do padrão (a dor por baixo).' },
      { papel: 'direção', instrucao: 'A saída: o que seria diferente se visses isto.' },
    ],
  },
  {
    id: 'mito',
    nome: 'Mito vs Verdade',
    dimensao: 'crencas',
    proposito: 'Autoridade: corrige uma ideia comum sobre o padrão.',
    guia: 'Dois beats em espelho (mito vs verdade), depois a explicação. Direto, com peso.',
    beats: [
      { papel: 'mito', instrucao: 'A ideia comum/errada ("Mito: ...").' },
      { papel: 'verdade', instrucao: 'A correção ("Verdade: ...").' },
      { papel: 'explicação', instrucao: 'Porque a verdade liberta (sem jargão).' },
      { papel: 'direção', instrucao: 'A saída concreta.' },
    ],
  },
  {
    id: 'veude',
    nome: 'O Véu de…',
    dimensao: 'subtipos',
    proposito: 'Alcance: identificação rápida ("isto sou eu").',
    guia: 'Mais leve e de alcance. Nomeia um tipo reconhecível e descreve-o em traços curtos, com afeto.',
    beats: [
      { papel: 'nome', instrucao: 'O nome do tipo ("O Véu da ..."), reconhecível e digno.' },
      { papel: 'traço', instrucao: 'Um traço concreto de quem é assim.' },
      { papel: 'traço', instrucao: 'Outro traço, diferente do primeiro.' },
      { papel: 'direção', instrucao: 'A saída: o que esta pessoa precisa de ouvir/fazer.' },
    ],
  },
];

export const getFormato = (id: string): Formato | undefined => FORMATOS.find((f) => f.id === id);
