// Método VS · sementes por véu (para a geração de reconhecimento com IA)
//
// O Claude escreve frases-sintoma NOVAS do véu (a dor na 1.ª pessoa, reconhecível
// em 3 segundos) a partir destas sementes, sem repetir os exemplos. As revelações
// e manifestos NÃO se inventam: vêm curados dos manuais (reels.ts).
//
// `cenas` = leque de fundos VARIADOS por véu (combinam com FUNDO_FAMILIA). Cada
// post escolhe uma cena diferente, para não repetir imagens (não gastar créditos
// a gerar a mesma imagem).

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
      'a dark bedroom window at night, a faint warm glow far beyond the glass',
      'a still lake before dawn, mist over the water, one thin band of gold',
      'a wide night sky with slow clouds passing, a break of warm light behind them',
      'rain running down a window pane, soft blurred light beyond',
      'a calm sea meeting a pale horizon at first light, vast and quiet',
      'a single candle flame in a vast quiet room, soft halo of gold',
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
      'an old empty theatre with a dim warm stage light, dust in the air',
      'a still antique mirror reflecting a single candle flame, warm gold on dark glass',
      'a long dim hallway of an old house, one warm door ajar at the end',
      'faded photographs resting on a dark table, soft lamplight',
      'a single ancient tree with deep visible roots, warm light through the branches',
      'an empty stone watchtower at first light, calm fields below',
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
      'an unmade bed at dawn, soft grey and gold light through a window',
      'a single empty chair in a warm pool of light, deep shadow around',
      'a long table laid for many, warm candlelight, all the chairs empty',
      'a simple bowl filling with warm golden light, dark tender background',
      'a soft cupped hollow of warm golden light cradled in deep shadow, like a nest',
      'folded linen resting in a quiet warm room, soft morning light',
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
      'a quiet dark room with one unlit lamp, a thin sliver of warm light under a door',
      'a still deep well seen from above, calm water holding a circle of warm light',
      'dark fertile soil cradling a single seed, a faint warm glow within the earth',
      'an open doorway into a quiet room, soft warm light at the threshold',
      'embers glowing softly in deep darkness, warm and alive',
      'a single chair by a window at dusk, the room dim and still',
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
      'an empty railway platform at dawn, warm light along the tracks',
      'a single steaming cup of coffee on a table by a window, soft morning gold',
      'a far horizon where sea meets sky, a single thin line of warm gold light',
      'an open country road at sunrise, mist and warm light ahead',
      'old calendar pages turning in warm dim light',
      'a quiet path through open fields at first light, dew and gold',
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
      'a tall tree letting golden leaves fall in still autumn air, warm light',
      'a soft garment resting over the back of a chair, warm shadow, quiet room',
      'an empty suit of armour standing in a dim hall, one warm shaft of light',
      'a calm river bending through dark land, a long reflection of gold',
      'still water slowly taking a new shape, soft luminous light',
      'bare branches against a soft dawn sky, the first warm light',
    ],
  },
};
