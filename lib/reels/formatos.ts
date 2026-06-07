// Formatos de Reels da conta didatica "Veu a Veu".
// Cada formato tem uma instrucao para o Claude e diz se gera VIDEO (frames
// renderizados em MP4) ou GUIAO (texto falado que a Vivianne grava).

export type FormatoReel = {
  id: string;
  nome: string;
  descricao: string;
  emoji: string;
  video: boolean;       // true = frames -> MP4; false = guiao p/ gravar a falar
  instrucao: string;    // regra para o Claude montar os frames/roteiro
};

export const FORMATOS: FormatoReel[] = [
  {
    id: 'sinais',
    nome: 'Sinais de que…',
    descricao: 'Lista de sinais de um padrão (parentificação, lealdades, burnout…). Muito partilhável.',
    emoji: '🔎',
    video: true,
    instrucao:
      'Formato "Sinais de que…". Frame 1 (capa): gancho "Sinais de que <tema>" curto e forte. Depois 4 a 6 frames, UM sinal concreto por frame (frase curta, do dia a dia, que faça a pessoa reconhecer-se). Frame final: uma frase de cuidado/reflexão (não diagnóstico, não vender). kicker dos sinais = "sinal 1", "sinal 2"…',
  },
  {
    id: 'ninguem',
    nome: 'O que ninguém te explica',
    descricao: 'Uma perspetiva psicológica/sistémica sobre algo comum. Gera curiosidade.',
    emoji: '💡',
    video: true,
    instrucao:
      'Formato "O que ninguém te explica". Frame 1 (capa): uma pergunta/afirmação que pára o scroll (ex.: "Porque é que algumas pessoas nunca conseguem sair da pobreza?"). 3 a 5 frames que dão UMA perspetiva psicológica ou sistémica clara, passo a passo (nada de clichés, dá profundidade real). Frame final: a virada/reflexão. kicker discreto.',
  },
  {
    id: 'pergunta',
    nome: 'Pergunta (comentários)',
    descricao: 'Uma pergunta que convida a comentar. Comentários geram alcance.',
    emoji: '💬',
    video: true,
    instrucao:
      'Formato "Pergunta". Frame 1 (capa): uma pergunta pessoal e tocante (ex.: "Qual foi a frase da tua infância que ainda vive dentro de ti?"). 1 a 2 frames que enquadram porque a pergunta importa (suave, sem teoria pesada). Frame final com nota "comenta em baixo ↓". Poucos frames (3-4). Objetivo: gerar comentários.',
  },
  {
    id: 'glossario',
    nome: 'Glossário da Alma',
    descricao: 'Explica UM termo (sombra, ego, individuação, campo morfogenético…). Série permanente.',
    emoji: '📖',
    video: true,
    instrucao:
      'Formato "Glossário da Alma". Frame 1 (capa): "O que é <termo>" (só o termo, grande). 2 a 3 frames: definição simples + 1 exemplo concreto do dia a dia. Frame final: uma frase que assenta a ideia. kicker = "glossário da alma". Rigoroso mas acessível.',
  },
  {
    id: 'pensador',
    nome: 'Uma ideia de…',
    descricao: 'Uma ideia de Jung, Frankl, Hellinger, Rumi… em ~20s. Dá para centenas.',
    emoji: '🕯️',
    video: true,
    instrucao:
      'Formato "Uma ideia de <pensador> em 20 segundos". Frame 1 (capa): "Uma ideia de <pensador>" (nomeia o pensador no tema). 2 a 3 frames com a ideia central explicada de forma simples e fiel. Frame final: como aplicar/refletir hoje. kicker = nome do pensador.',
  },
];

export function getFormato(id: string): FormatoReel {
  return FORMATOS.find((f) => f.id === id) ?? FORMATOS[0];
}
