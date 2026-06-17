// Método VS · O RETRATO COMPLETO de cada véu (as 6 faces).
//
// O que separa o método do mercado: o mercado fala do COMPORTAMENTO; este fala do
// MOTIVO. A mesma procrastinação tem 7 motivos diferentes (um por véu). Por isso
// cada véu tem um retrato inteiro, não fuga/culpa "soltas".
//
// As 6 faces: Dor · Fuga · Culpa · Custo · Revelação · Saída (movimento).
//   - Dor, Custo, Revelação já vivem no SABER (saber.ts) e nos manuais.
//   - Fuga, Culpa, Saída são as que FALTAM e se acrescentam aqui.
// NÃO toca no saber.ts de propósito (a outra sessão edita-o). Esta camada é só o
// retrato, derivado dos manuais da Vivianne (não inventado), para validação.

import type { VeuNome } from './contas';

export interface FacesVeu {
  dor: string;        // o que se sente / faz (do SABER + biblioteca de reconhecimentos)
  fuga: string;       // como foge desse véu (NOVO)
  culpa: string;      // a culpa que o véu gera (NOVO)
  custo: string;      // o preço invisível (do SABER.custos)
  revelacao: string;  // a verdade que o desfaz (do SABER.crencas.verdade)
  saida: string;      // o movimento concreto de sair (NOVO)
}

// Estado: 'completo' = retrato validável; 'rascunho' = só a dor, à espera da
// matéria da Vivianne (preenche-se véu a véu, depois de validar o primeiro).
export const VEU_FACES: Partial<Record<VeuNome, FacesVeu>> = {
  // ───────── ESFORÇO · retrato completo (derivado do manual O Esforço) ─────────
  Esforço: {
    dor: 'Comes de pé o que sobra. Arrumas enquanto os outros já comem. Respondes a todos em segundos e a ti em três dias. E sentes culpa no instante em que te sentas.',
    fuga: 'O fazer é a tua fuga mais aplaudida. Enquanto não paras, não chegas ao silêncio. E enquanto não chegas ao silêncio, não tens de sentir o vazio. Encher a vida de cuidar parece virtude, mas é também não teres de estar contigo.',
    culpa: 'Descansar custa-te como uma dívida. Se paras, sentes que deixas alguém em falta. A culpa não vem de teres feito mal. Vem de teres parado.',
    custo: 'O corpo que avisa e tu calas. As relações onde só dás e nunca recebes. A exaustão a que chamas ser responsável. E uma vida inteira a provar que mereces ficar.',
    revelacao: 'Aprendeste que o amor se ganha a fazer. Não se ganha. O que se ganha a fazer não é amor, é dependência da tua entrega. Tu bastas antes de produzires seja o que for.',
    saida: 'Parar de empurrar. Largar uma coisa, só uma, e ver que o chão continua lá. Deixares-te segurar, em vez de seres sempre tu a segurar.',
  },
};

// Só a dor, para a página mostrar os 7 véus (os outros 6 preenchem-se a seguir,
// com a matéria da Vivianne, depois de ela validar o retrato do Esforço).
export const VEU_DOR: Record<VeuNome, string> = {
  Permanência: 'Dizes "está tudo bem" antes de saberes se está. Custa-te pedir ajuda. És procurada nas crises, não nos dias bons.',
  Memória: 'Dizes "comigo é sempre assim". Carregas uma tristeza que sabes ser da tua mãe. Reages com mais força do que a cena pede.',
  Turbilhão: 'Levas as discussões para a cama. Lês a mesma mensagem cinco vezes. Acordas já a fazer a lista.',
  Esforço: 'Comes de pé o que sobra. Sentes culpa quando te sentas.',
  Desolação: 'Ligas a TV mal entras em casa. Dormes com o podcast a tocar. Enches o domingo para não ouvir a tarde a chegar.',
  Horizonte: 'Vives num "quando". Alcanças a meta e já queres a próxima. Não saboreias o que tens.',
  Dualidade: 'Fazes as contas das relações. Sentes o mundo do outro lado de um vidro. Saudade de uma pertença que não sabes nomear.',
};

// As LIGAÇÕES entre véus (a teia). A primeira, descoberta na vida, não no mapa.
export interface LigacaoVeu { de: VeuNome; para: VeuNome; nome: string; texto: string; }
export const LIGACOES: LigacaoVeu[] = [
  {
    de: 'Desolação', para: 'Horizonte',
    nome: 'A Procura sem Chegada',
    texto: 'A Desolação não te empurra só para a fuga. Às vezes empurra-te para a procura. E quando a procura encontra o Horizonte (ainda não, falta mais, continua), transforma-se numa sala de espera sem fim. A Desolação faz a fome, o Horizonte promete a refeição sempre no prato seguinte.',
  },
];

export const FACES_ORDEM: { chave: keyof FacesVeu; titulo: string; nova: boolean }[] = [
  { chave: 'dor', titulo: 'A dor', nova: false },
  { chave: 'fuga', titulo: 'A fuga', nova: true },
  { chave: 'culpa', titulo: 'A culpa', nova: true },
  { chave: 'custo', titulo: 'O custo', nova: false },
  { chave: 'revelacao', titulo: 'A revelação', nova: false },
  { chave: 'saida', titulo: 'A saída', nova: true },
];
