// Método VS · as FACES que faltavam ao retrato de cada véu — FUGA, CULPA e SAÍDA.
//
// Descoberta (Vivianne): o comportamento NÃO é o diagnóstico. A mesma ação
// (procrastinar, comprar, beber, scroll) tem um MOTIVO diferente em cada véu. Por
// isso a fuga e a culpa NÃO pertencem a um véu (ex.: à Desolação): cada véu foge
// e culpa-se à SUA maneira. Isto expande o retrato sem criar véus novos:
//   Dor (essencia/comportamentos · saber.ts) · FUGA · CULPA · Custo (custos) ·
//   Revelação (crencas.verdade) · SAÍDA (o movimento de saída).
//
// Ficheiro à parte de propósito (não toca no saber.ts, que está a evoluir noutra
// sessão). Conteúdo derivado do campo dela; afina à vontade.

import type { VeuNome } from './contas';

export interface VeuFaces {
  /** como ESTE véu foge (cada um foge à sua maneira; a fuga é transversal). */
  fuga: string;
  /** a culpa própria deste véu (cada véu pune-se de forma diferente). */
  culpa: string;
  /** o movimento de saída (a direção concreta, não uma lição). */
  saida: string;
}

export const VEU_FACES: Record<VeuNome, VeuFaces> = {
  Turbilhão: {
    fuga: 'Foge para a cabeça: pensa, controla, antecipa, verifica. Procrastina porque precisa de pensar mais um pouco antes de agir.',
    culpa: 'Culpa-se por não conseguir desligar, e por estar no jantar com a cabeça na conversa da manhã.',
    saida: 'Ver os pensamentos passar em vez de ser arrastada por eles. Decidir com o que já sabe.',
  },
  Memória: {
    fuga: 'Sai primeiro, fecha portas antes de se aproximar, antecipa o abandono. Adia porque falhar dói demais.',
    culpa: 'Culpa-se por "ser sempre assim" e por estragar o que lhe corre bem.',
    saida: 'Responder ao presente, não reagir à dor de antes. Ficar antes de o filme antigo recomeçar.',
  },
  Esforço: {
    fuga: 'Faz, resolve, ocupa-se, torna-se indispensável. Adia o que é dela porque está exausta e não admite.',
    culpa: 'Culpa-se ao descansar, ao receber e ao pôr-se à frente da lista.',
    saida: 'Deixar uma coisa por fazer, e receber sem sentir dívida.',
  },
  Desolação: {
    fuga: 'Anestesia o vazio (TV ao entrar, scroll, compras, álcool) ou procura sentido sem fim. Adia porque nada parece ter significado suficiente para começar.',
    culpa: 'Culpa-se por precisar, por receber, e por estar mal sem motivo aparente.',
    saida: 'Ficar no silêncio sem o tapar, e ver o que aparece.',
  },
  Horizonte: {
    fuga: 'Adia a vida para um "quando", persegue a meta seguinte. Adia porque o verdadeiro momento ainda não chegou.',
    culpa: 'Culpa-se por nunca aproveitar nem chegar, por estar sempre à espera.',
    saida: 'Um gesto pequeno e presente hoje, sem esperar a altura certa.',
  },
  Permanência: {
    fuga: 'Mantém o papel e a armadura, não muda. Adia porque começar obriga-a a tornar-se alguém novo.',
    culpa: 'Culpa-se por pensar em mudar e por desiludir quem conta com ela.',
    saida: 'Largar uma versão antiga sem deixar de ser ela.',
  },
  Dualidade: {
    fuga: 'Mantém a distância, sorri por fora, faz as contas das relações.',
    culpa: 'Culpa-se por se sentir só tendo tudo, e por não pertencer.',
    saida: 'Deixar-se aproximar e dizer o que sente, sem medir.',
  },
};

/** PONTES entre véus: ligações específicas (não regras). A 1.ª, descoberta pela
 *  Vivianne: a Desolação põe à procura; o Horizonte convence de que ainda não
 *  chegou, e a procura vira sala de espera (liga vir e viver). */
export const PONTES: { de: VeuNome; para: VeuNome; mecanismo: string }[] = [
  { de: 'Desolação', para: 'Horizonte', mecanismo: 'O vazio põe à procura. O Horizonte sussurra "ainda não é aqui". E a procura vira uma sala de espera sem chegada.' },
];
