// Método VS · as 3 contas (portas): canon
//
// Pipeline NOVO e SEPARADO da veu.a.veu. Não toca em lib/veu/*.
// Eixo descoberto (não inventado) dentro do próprio método: Ver, Vir, Viver.
//   Ver   = consciência (sair de dentro da tempestade e ver).
//   Vir   = regresso (parar de empurrar e regressar a si).
//   Viver = integração (entrar na própria vida, encarná-la).
//
// VS = Ver e Soltar = Vivianne Saraiva. SV = Sete Véus = Soltar o Véu.
//
// Regras de voz (invioláveis, ver CONTINUIDADE-METODO-VS.md):
//  - Travessões BANIDOS (—, –). Vírgulas, dois pontos, parênteses, ponto final.
//  - Português europeu, sereno, literário, sem hype, sem urgência artificial.
//  - Autoridade do caminho ("reconheci primeiro em mim"). Nunca inventar biografia.
//
// Identidade visual (família das capas, ver COVER-PROMPTS-METODO-VS.md):
//   base indigo-profundo e beringela, luz de ouro quente, textura renascentista
//   pintada, sfumato, contemplativo e intemporal. Sem pessoas, sem texto.
//   Cada conta tem o SEU símbolo: a margem · o colo · descalça.

export type ContaId = 'ver' | 'vir' | 'viver';
export type VeuNome =
  | 'Turbilhão'
  | 'Memória'
  | 'Esforço'
  | 'Desolação'
  | 'Horizonte'
  | 'Permanência';

export interface Conta {
  id: ContaId;
  /** Movimento (canon): Ver · Vir · Viver. */
  movimento: 'Ver' | 'Vir' | 'Viver';
  /** Handle de Instagram (a fechar, ver CONTAS-METODO-VS.md). */
  handle: string;
  /** marca = id da conta no enum partilhado (lib/instagram/contas.ts). */
  marca: string;
  /** Essência do movimento numa palavra/sintagma. */
  essencia: string;
  /** O que a pessoa é depois (a transformação). */
  depois: string;
  /** Os dois véus que este movimento recolhe (o cacho). */
  veus: VeuNome[];
  /** Símbolo visual desta conta (família das capas). */
  simbolo: string;
  /** Prompt-base do fundo dos reels (família comum + símbolo da conta). */
  fundoBase: string;
  /** Cor de acento para o admin (= paleta.accent). */
  cor: string;
  /** Paleta PRÓPRIA da conta (identidade distinta, não a da veu.a.veu). */
  paleta: { bg1: string; bg2: string; accent: string };
  /** Linha de manifesto (declarativa, curta): o 10% manifesto. */
  manifestoLinha: string;
  emoji: string;
  /** Bios canónicas (CONTAS-METODO-VS.md). */
  bioPT: string;
  bioEN: string;
  /** Palavra do CTA por comentário. */
  comentaPalavra: string;
  ctaPT: string;
  /** Produto que esta porta vende. */
  manualNome: string;
  manualPrecoEur: number;
  /** Ficheiro-fonte do manual (para garimpo e citações). */
  manualFonte: string;
}

// A família comum a todas as capas/fundos (o que faz a coleção ser coleção).
export const FUNDO_FAMILIA =
  'fine-art painterly background, deep indigo and aubergine night, warm gold ' +
  'light, renaissance sfumato texture, contemplative and timeless, generous ' +
  'calm space, NO people, NO faces, NO figures, NO hands, NO text, NO letters, ' +
  'NO watermark, vertical 9:16';

export const CONTAS: Record<ContaId, Conta> = {
  ver: {
    id: 'ver',
    movimento: 'Ver',
    handle: 'ver.soltar',
    marca: 'versoltar',
    essencia: 'a consciência',
    depois: 'Sai de dentro da cabeça e vê a tempestade passar de terra.',
    veus: ['Turbilhão', 'Memória'],
    simbolo: 'a margem',
    fundoBase:
      'a calm still expanse of dark water with a single thin line of warm ' +
      'light on the far horizon, seen from the near shore, serene, room to breathe',
    cor: '#9cc1ee',
    paleta: { bg1: '#16263f', bg2: '#0a0f1a', accent: '#9cc1ee' }, // azul frio (a margem, água, noite)
    manifestoLinha: 'Nem tudo o que passa pela tua cabeça merece um lugar na tua vida.',
    emoji: '🕯️',
    bioPT:
      'Não consegues desligar a cabeça? Aprende a criar distância dos ' +
      'pensamentos sem lutares contra eles. Método VS · Ver e Soltar 🕯️ ↓',
    bioEN:
      'Can’t switch your head off? Learn to create distance from your ' +
      'thoughts without fighting them. Method VS · See and Release 🕯️ ↓',
    comentaPalavra: 'VER',
    ctaPT: 'Comenta VER e envio-te o primeiro passo, de graça.',
    manualNome: 'ver.soltar',
    manualPrecoEur: 9,
    manualFonte: 'VER-SOLTAR-PT.md',
  },
  vir: {
    id: 'vir',
    movimento: 'Vir',
    handle: 'vir.soltar',
    marca: 'virsoltar',
    essencia: 'o regresso',
    depois: 'Para de empurrar, regressa a si, deixa-se segurar e descansar.',
    veus: ['Esforço', 'Desolação'],
    simbolo: 'o colo',
    fundoBase:
      'a soft cupped hollow of warm golden light cradled in deep shadow, ' +
      'like a held nest or a quiet hearth, tender and sheltering, abstract, no figure',
    cor: '#e8b56b',
    paleta: { bg1: '#3a241a', bg2: '#1a0f0a', accent: '#e8b56b' }, // âmbar quente (o colo, lareira)
    manifestoLinha: 'Não precisas de carregar tudo para mereceres o teu lugar.',
    emoji: '🕯️',
    bioPT:
      'Fazes tudo por toda a gente e sentes culpa quando pensas em ti? ' +
      'Aprende a descansar sem culpa e a deixar-te apoiar. Método VS · Ver e Soltar 🕯️ ↓',
    bioEN:
      'Do everything for everyone and feel guilty when you think of ' +
      'yourself? Learn to rest without guilt and let yourself be supported. ' +
      'Method VS · See and Release 🕯️ ↓',
    comentaPalavra: 'VIR',
    ctaPT: 'Comenta VIR e envio-te o primeiro passo, de graça.',
    manualNome: 'vir.soltar',
    manualPrecoEur: 9,
    manualFonte: 'VIR-SOLTAR-PT.md',
  },
  viver: {
    id: 'viver',
    movimento: 'Viver',
    handle: 'viver.soltar',
    marca: 'viversoltar',
    essencia: 'a integração',
    depois:
      'Sai da sala de espera, tira a armadura dos papéis e entra na própria vida, agora.',
    veus: ['Horizonte', 'Permanência'],
    simbolo: 'descalça',
    fundoBase:
      'an open doorway seen from inside a dark room, the threshold and the ' +
      'ground just beyond it bathed in warm morning light, a path of light leading out',
    cor: '#c4dd84',
    paleta: { bg1: '#21331f', bg2: '#0d140b', accent: '#c4dd84' }, // verde-manhã (descalça, limiar)
    manifestoLinha: 'A estreia não é para o ano. É hoje.',
    emoji: '🕯️',
    bioPT:
      'Estás sempre à espera que a tua vida comece? Aprende a sair do ' +
      '"depois" e a transformar o que já compreendeste em mudança real. ' +
      'Método VS · Ver e Soltar 🕯️ ↓',
    bioEN:
      'Always waiting for your life to begin? Learn to step out of the ' +
      '"later" and turn what you understand into real change. Method VS · See and Release 🕯️ ↓',
    comentaPalavra: 'VIVER',
    ctaPT: 'Comenta VIVER e envio-te o primeiro passo, de graça.',
    manualNome: 'viver.soltar',
    manualPrecoEur: 9,
    manualFonte: 'VIVER-SOLTAR-PT.md',
  },
};

export const CONTAS_LISTA: Conta[] = [CONTAS.ver, CONTAS.vir, CONTAS.viver];

export function getConta(id: string): Conta | undefined {
  return (CONTAS as Record<string, Conta>)[id];
}

// O hub (conta-mãe) e a didática, aqui só para referência (não geramos por elas).
export const CONTA_MAE = {
  handle: 'vivianne.dos.santos',
  papel: 'LARGURA: a autora + o método inteiro + o pilar + o diagnóstico',
  vende: 'Os Sete Véus (pilar, €19)',
};
export const CONTA_DIDATICA = {
  handle: 'veu.a.veu',
  papel: 'DIDÁTICA: ensina (4 matérias), fora da venda. Já orquestrada. NÃO TOCAR.',
};
