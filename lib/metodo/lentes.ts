// Método VS · A LENTE de cada véu (a teoria "Estratégias de Sobrevivência").
//
// FONTE: UNIVERSO-VS.md, PARTE I (a sequência, a pergunta-mestra, a tabela "Os
// sete véus relidos como estratégias"). NADA aqui é inventado — é a voz da
// Vivianne, copiada do documento mestre. Serve para o calendário trimestral
// MOSTRAR a lente/ângulo/fonte por trás de cada véu (em vez de "véu por face"
// abstrato), e para a geração ancorar a profundidade.
//
// A cadeia (3 verbos): sobreviver -> prender -> cegar.
//   Estratégia: "foi assim que sobrevivi." -> Lealdade: "foi assim que me mantive
//   viva, amada, pertencente." -> Véu: "tornei-me incapaz de ver que já não
//   precisava disto."

import type { VeuNome } from './contas';

// A pergunta que faz o VER virar SOLTAR (UNIVERSO-VS.md).
export const PERGUNTA_MESTRA = 'O que é que esta estratégia fez por ti, que te tornou tão leal a ela?';
export const CADEIA = 'sobreviver → prender → cegar';

export interface Lente {
  frase: string;      // "a mente que afoga" — o véu numa frase
  estrategia: string; // "…me mantive segura, antecipando tudo" — foi assim que sobrevivi
  expira: string;     // "percebes que pensar não é resolver" — quando o véu deixa de ser preciso
}

// Os 7 véus relidos como estratégias (UNIVERSO-VS.md, tabela da PARTE I).
export const VEU_LENTE: Record<VeuNome, Lente> = {
  Permanência: { frase: 'a identidade que se defende', estrategia: 'mantive quem eu era e o meu lugar', expira: 'já não precisas de defender uma identidade para existir' },
  Memória: { frase: 'o passado que aprisiona', estrategia: 'me protegi do que já doeu', expira: 'vês que a dor é de outro tempo' },
  Turbilhão: { frase: 'a mente que afoga', estrategia: 'me mantive segura, antecipando tudo', expira: 'percebes que pensar não é resolver' },
  Esforço: { frase: 'o esforço que esgota', estrategia: 'fui amada e necessária', expira: 'descobres que bastas antes de fazer' },
  Desolação: { frase: 'o vazio que aterra', estrategia: 'aguentei o vazio, enchendo-o', expira: 'o silêncio deixa de ser abismo e vira colo' },
  Horizonte: { frase: 'o horizonte que adia', estrategia: 'continuei a andar', expira: 'vês que a sala de espera era a viagem' },
  Dualidade: { frase: 'a separação, raiz de todos', estrategia: 'sobrevivi a sentir-me só, fazendo-me ilha', expira: 'te lembras de que nunca estiveste separada' },
};

// O enquadramento de cada PORTA (a linha dos manuais-filhos, UNIVERSO-VS.md PARTE
// II): a mesma voz que define o que a porta vem fazer com os seus 2 véus.
export const PORTA_ENQUADRAMENTO: Record<'ver' | 'vir' | 'viver', string> = {
  ver: 'Vens ver como a tua cabeça aprendeu a manter-te segura, e agradecer-lhe, antes de a soltar.',
  vir: 'Vens ver que o teu esforço foi a forma de seres amada, e descobrir que já és, antes de fazeres nada.',
  viver: 'Vens ver que adiaste a vida para sobreviver, e pousar a armadura no chão que já é teu.',
};
