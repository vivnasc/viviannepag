// Método VS · O BARALHO "Sou Aquela" (mãe, meio da manhã).
//
// FIXO e curado: uma carta por PERSONAGEM (lib/metodo/personagens.ts), tirada do
// material real de cada uma (essência, frases, sombra). Não se gera ao calhas: é
// um baralho a sério, estável e editável à mão. A semana ORDENA estas cartas (a
// personagem do dia → a sua carta). Voz 2026 (a mulher fala/reclama, sem "estou
// bem" nem mártir muda). Cada carta: 3 a 4 comportamentos concretos + "Sou aquela."
//
// Para afinar: edita as linhas aqui. Para travar: ficam aqui (não mudam sozinhas).

// POSES TRAVADAS por personagem (ditadas pela Vivianne). Se uma personagem tem aqui
// uma pose, a figura usa EXATAMENTE essa (o modelo não improvisa); senão, a pose
// encarna a essência. Preenche personagemId: 'descrição da pose'. Editável à mão.
export const POSE_BARALHO: Record<string, string> = {
  // ex.: salvadora: 'de pé, a estender os braços para amparar alguém fora do enquadramento'
};
export const poseDoBaralho = (personagemId: string): string | undefined => POSE_BARALHO[personagemId];

export const BARALHO: Record<string, string[]> = {
  // As que carregam
  salvadora: ['Resolvo o problema antes de mo pedirem.', 'Atiro-me ao fogo de toda a gente.', 'Chamo-lhe amor, mas é resgate.', 'Sou aquela.'],
  diretora: ['Já tratei, já confirmei, já marquei.', 'Sei o que falta lá em casa antes de faltar.', 'Deito-me e o cérebro continua a operação.', 'Sou aquela.'],
  provedora: ['Garanto que não falte nada a ninguém.', 'Dou sempre, e fico sem jeito quando me dão.', 'Receber sabe-me a dívida.', 'Sou aquela.'],
  heroina: ['Na crise, sou eu que apareço.', 'Fico estranhamente calma quando tudo arde.', 'E quando há paz, não sei o que fazer comigo.', 'Sou aquela.'],
  indispensavel: ['Faço eu, que é mais depressa.', 'Digo que estou cansada e não largo nada.', 'Preciso de ser precisa.', 'Sou aquela.'],
  // As que procuram
  peregrina: ['Compro outro curso, outro método, outra resposta.', 'Sinto sempre que falta qualquer coisa.', 'Procuro lá fora o que talvez esteja cá dentro.', 'Sou aquela.'],
  navegadora: ['Pergunto a tudo o que me veio ensinar.', 'Procuro um sentido em cada coisa que me acontece.', 'Às vezes interpreto tanto que me esqueço de viver.', 'Sou aquela.'],
  'aluna-eterna': ['Faço mais um curso antes de começar.', 'Digo que ainda não estou pronta.', 'Transformo preparar-me em adiar.', 'Sou aquela.'],
  'buscadora-casa': ['Procuro um sítio onde finalmente pertença.', 'Quero pousar e descansar de uma vez.', 'Procuro fora a casa que é cá dentro.', 'Sou aquela.'],
  // As que desaparecem (voz 2026: vocal, não muda)
  invisivel: ['Lembro-me dos aniversários e das consultas de todos.', 'Faço tudo e queixo-me de que ninguém repara.', 'Espero que perguntem por mim, e a mim nunca pergunto.', 'Sou aquela.'],
  desaparecida: ['Estou em todos os grupos e calendários.', 'Já nem sei do que gosto.', 'Olho-me ao espelho e não sei bem quem é.', 'Sou aquela.'],
  orfa: ['Estou rodeada de gente e sinto-me só.', 'Desabafo com toda a gente e continuo na mesma.', 'Nunca acredito que alguém fique.', 'Sou aquela.'],
  'rebelde-silenciosa': ['Digo a toda a gente que estou farta.', 'Cumpro tudo na mesma.', 'Tenho tudo e continuo inquieta.', 'Sou aquela.'],
  // As que se adaptam
  adaptadora: ['Sou uma com o marido, outra no trabalho, outra com a minha mãe.', 'Digo "para mim tanto faz" a tudo.', 'Já não sei o que quero.', 'Sou aquela.'],
  tradutora: ['Explico o que ele quis dizer.', 'Suavizo o que a outra fez.', 'Traduzo toda a gente, e a mim ninguém traduz.', 'Sou aquela.'],
  diplomata: ['Mantenho a paz, percebo os dois lados.', 'Evito o conflito a todo o custo.', 'Nunca tomo partido de mim.', 'Sou aquela.'],
  fiel: ['Fico por lealdade, mesmo quando dói.', 'Depois de tudo o que fizeram por mim, não posso sair.', 'Confundo gratidão com prisão.', 'Sou aquela.'],
  // As que vigiam
  guardia: ['Confirmo outra vez, só para garantir.', 'Antecipo tudo o que pode correr mal.', 'E nunca me sinto mesmo segura.', 'Sou aquela.'],
  sentinela: ['Nunca baixo a guarda.', 'Mais vale estar preparada.', 'Confundo vigiar com estar segura.', 'Sou aquela.'],
  perfeccionista: ['Ainda falta corrigir um pormenor.', 'Não procuro aplausos, procuro que não falhe nada.', 'E nunca está pronto.', 'Sou aquela.'],
  observadora: ['Leio a sala toda num segundo.', 'Já tinha percebido tudo antes de acontecer.', 'Observo tanto que me esqueço de participar.', 'Sou aquela.'],
};

/** A carta fixa de uma personagem (as linhas, a última é "Sou aquela."). */
export const cartaDoBaralho = (personagemId: string): string[] => BARALHO[personagemId] ?? [];
