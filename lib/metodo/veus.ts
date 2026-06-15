// Método VS · sementes por véu (para a geração de reconhecimento com IA)
//
// O Claude escreve frases-sintoma NOVAS (a dor na 1.ª pessoa, reconhecível em 3
// segundos) a partir destas sementes, sem repetir os exemplos. As revelações e
// manifestos NÃO se inventam: vêm curados dos manuais (reels.ts).

import { VeuNome } from './contas';

export const VEU_SEMENTE: Record<VeuNome, { descricao: string; exemplos: string[] }> = {
  Turbilhão: {
    descricao: 'a cabeça que não pára, ansiedade e ruminação; pensar de mais, viver em alerta.',
    exemplos: [
      'A minha cabeça não desliga, sobretudo à noite.',
      'Acordo de manhã mais cansada do que me deitei.',
      'Ensaio conversas que talvez nunca aconteçam.',
      'Resolvo dez vezes um problema que ainda nem chegou.',
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
  },
  Esforço: {
    descricao: 'fazer tudo por todos, esforçar-se para ser amada; culpa ao descansar, dificuldade em receber.',
    exemplos: [
      'Faço tudo por toda a gente e ninguém faz por mim.',
      'Se paro, sobe-me uma culpa que não sei explicar.',
      'Digo sim com a boca enquanto o corpo grita não.',
      'Tenho um cansaço que dorme oito horas e acorda na mesma.',
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
  },
  Horizonte: {
    descricao: 'viver à espera de um quando; adiar a vida para depois, nunca chegar.',
    exemplos: [
      'A minha vida está sempre para depois.',
      'Vou ser feliz quando isto passar.',
      'Bebo o café já a pensar no que vou fazer a seguir.',
      'Chego à meta e já só penso na próxima.',
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
  },
};
