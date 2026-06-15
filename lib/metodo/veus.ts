// Método VS · sementes por véu (para a geração de reconhecimento com IA)
//
// O Claude escreve frases-sintoma NOVAS do véu (a dor na 1.ª pessoa, reconhecível
// em 3 segundos) a partir destas sementes, sem repetir os exemplos. As revelações
// e manifestos NÃO se inventam: vêm curados dos manuais (reels.ts).
//
// `cenas` = leque de fundos VARIADOS por véu (combinam com FUNDO_FAMILIA). São
// LUMINOSOS e arejados (luz e sombra em equilíbrio, não penumbra) e cada post
// escolhe uma cena diferente, para não repetir imagens nem escurecer o feed.

import { VeuNome } from './contas';

export const VEU_SEMENTE: Record<VeuNome, { descricao: string; exemplos: string[]; cenas: string[] }> = {
  Turbilhão: {
    descricao: 'a cabeça que não pára, ansiedade e ruminação; pensar de mais, viver em alerta.',
    exemplos: [
      'A minha cabeça não desliga, sobretudo à noite.',
      'Acordo de manhã mais cansada do que me deitei.',
      'Ensaio conversas que talvez nunca aconteçam.',
      'Resolvo dez vezes um problema que ainda nem chegou.',
    ],
    cenas: [
      'a calm sea at soft dawn, pale luminous sky, gentle light',
      'a bright window with sheer curtains and soft morning light',
      'a wide luminous sky with slow soft clouds, airy and open',
      'still water reflecting a pale bright sky, serene',
      'a quiet room in soft daylight, calm and bright',
      'misty morning light over a calm lake, luminous',
    ],
  },
  Memória: {
    descricao: 'viver preso a uma história antiga; reagir ao presente com uma dor de outro tempo.',
    exemplos: [
      'Comigo é sempre a mesma coisa.',
      'Alguém demora a responder e eu já montei a história toda.',
      'Eu sou assim desde sempre.',
      'Fecho portas antes mesmo de me aproximar delas.',
    ],
    cenas: [
      'an old sunlit room with soft warm light through a tall window',
      'faded photographs on a table in gentle daylight',
      'a single tree in soft golden afternoon light, open field',
      'a calm hallway with warm light from an open door',
      'a quiet mirror catching soft daylight, gentle reflection',
      'a meadow at first light, soft and luminous',
    ],
  },
  Esforço: {
    descricao: 'fazer tudo por todos, esforçar-se para ser amada; culpa ao descansar, dificuldade em receber.',
    exemplos: [
      'Faço tudo por toda a gente e ninguém faz por mim.',
      'Se paro, sobe-me uma culpa que não sei explicar.',
      'Digo sim com a boca enquanto o corpo grita não.',
      'Tenho um cansaço que dorme oito horas e acorda na mesma.',
    ],
    cenas: [
      'soft morning light on rumpled linen, gentle and warm',
      'a calm sunlit chair by a bright window',
      'a warm bright table with soft daylight and an empty cup',
      'a simple bowl in soft warm light, gentle glow',
      'a soft cupped hollow of warm light, tender and bright',
      'folded linen resting in a bright calm room',
    ],
  },
  Desolação: {
    descricao: 'medo do vazio e da solidão; preencher tudo para não sentir.',
    exemplos: [
      'Ligo a televisão mal entro em casa.',
      'Mal o silêncio chega, corro a tapá-lo.',
      'Tenho medo de parar e não encontrar nada cá dentro.',
      'Já nem sei do que é que eu, só eu, gosto.',
    ],
    cenas: [
      'a quiet bright room with soft empty space and gentle light',
      'a single seed in warm earth touched by soft light',
      'an open doorway into a softly lit calm room',
      'dawn light gently filling an empty serene space',
      'soft warm light on still water, calm and open',
      'a calm window with warm gentle light at dusk',
    ],
  },
  Horizonte: {
    descricao: 'viver à espera de um quando; adiar a vida para depois, nunca chegar.',
    exemplos: [
      'A minha vida está sempre para depois.',
      'Vou ser feliz quando isto passar.',
      'Bebo o café já a pensar no que vou fazer a seguir.',
      'Chego à meta e já só penso na próxima.',
    ],
    cenas: [
      'an open road at sunrise, soft luminous light ahead',
      'a bright cup of coffee by a sunny window, morning glow',
      'a far horizon where sea meets a luminous bright sky',
      'a path through sunlit fields, dew and soft gold',
      'soft morning light over quiet rooftops, airy',
      'a calm bright sky at dawn, open and serene',
    ],
  },
  Permanência: {
    descricao: 'defender quem já não se é; medo de mudar e deixar de ser quem se foi.',
    exemplos: [
      'Sou a forte, a que aguenta sempre.',
      'Quem seria eu sem este papel?',
      'Custa-me pedir ajuda ou mostrar fragilidade.',
      'Tenho medo de mudar e desiludir quem conta comigo.',
    ],
    cenas: [
      'a tree in soft autumn light, gentle and luminous',
      'a soft garment over a chair in a bright calm room',
      'a calm river under a soft bright sky',
      'bare branches against a luminous dawn sky',
      'still water slowly taking a new shape in soft light',
      'soft daylight through tall windows, serene and open',
    ],
  },
};
