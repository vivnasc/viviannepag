// Formatos de Reels da conta didatica "Veu a Veu".
// Cada formato tem uma instrucao para o Claude e diz se gera VIDEO (frames
// renderizados em MP4) ou GUIAO (texto falado que a Vivianne grava).

export type FormatoReel = {
  id: string;
  nome: string;
  descricao: string;
  emoji: string;
  video: boolean;       // true = frames -> MP4; false = sem MP4
  carrossel?: boolean;  // true = carrossel de imagens 4:5 (lê-se ao ritmo de quem desliza), NAO video
  instrucao: string;    // regra para o Claude montar os frames/roteiro
};

export const FORMATOS: FormatoReel[] = [
  {
    id: 'domingo',
    nome: 'Domingo de Luz',
    descricao: 'O respiro luminoso do domingo: uma frase doce e esperançosa, depois da semana mais funda.',
    emoji: '🕊️',
    video: true,
    instrucao:
      'Formato "Domingo de Luz" (frase com motion, registo LUMINOSO e terno). Devolve em "frames" UM ÚNICO frame com uma frase CURTA, doce e esperançosa (6 a 12 palavras): permissão para descansar, ternura consigo, honrar o caminho percorrido, fé suave. NADA de ensinar padrões pesados nem limites, é um abraço de fim de semana. Em "destaque" 1 a 2 palavras-chave para realçar. Em "fundoPrompt" devolve um prompt MidJourney LUMINOSO mas SÓBRIO e elegante (coerente com uma marca profunda, NADA de açucarado/kitsch/fru-fru): luz natural suave e clara, ex.: amanhecer sereno, raios de sol ténues por uma janela, névoa luminosa sobre água calma, céu limpo ao nascer do dia, um campo em luz macia. Tons claros e calmos (toques de rosa/azul subtis, SEM dourado). VARIA o motivo a cada vez. Fine art, refinado, SEM pétalas/penas a voar, SEM pessoas, SEM texto. Termina com "--ar 9:16 --style raw". Só a frase, nada de listas.',
  },
  {
    id: 'kinetico',
    nome: 'Frase com motion',
    descricao: 'O reel que mais rende: uma imagem transcendente + uma frase que se escreve (typewriter/kinetic) + música.',
    emoji: '✨',
    video: true,
    instrucao:
      'Formato "Frase com motion" (reel simples de alto alcance). A BREVIDADE VENCE (os posts mais curtos rendem mais views): devolve em "frames" UM ÚNICO frame com uma frase CURTA e forte (uma só ideia, ritmo poético; ~5 a 12 palavras nua, ou até ~18 quando abre com micro-cena de reconhecimento) OU, quando o conceito for poderoso por si só, UMA ÚNICA PALAVRA-conceito (ex.: Dignidade, Pertença, Inteireza). PORTA->SALA (para parar o scroll de quem ainda não te conhece): quando a frase funda for fechada/hermética para um estranho, ABRE com uma micro-cena concreta do dia a dia onde a pessoa pensa "isto sou eu" (corpo, casa, gesto) e FECHA na tua frase funda, na mesma respiração (ex.: "Há um peso que carregas há anos sem saber de onde vem. Nem tudo o que sentes é teu."). A rampa é concreta e sensorial, NUNCA genérica/autoajuda ("expectativas que nunca escolhemos" é fraco). Mas nem todas precisam: quando a imagem de fundo já dá o reconhecimento, deixa a frase/palavra NUA. A aforística aterra sempre no FIM. A frase/palavra é a estrela. Em "destaque" devolve 1 a 2 palavras-chave para realçar. Em "fundoPrompt" devolve um prompt MidJourney ÚNICO e VARIADO para o fundo, evocativo DESTE conceito: varia mesmo o motivo (água, luz por uma janela, pedra, céu, névoa, areia, folhas, vela, fumo suave, horizonte, tecido, mar, montanha…). NUNCA repitas "raízes douradas" nem fios dourados, varia a paleta. Sempre fine art, sem pessoas, sem texto, termina com "--ar 9:16 --style raw". Nada de listas: só a frase/palavra.',
  },
  {
    id: 'sinais',
    nome: 'Sinais de que…',
    descricao: 'Reel de sinais de um padrão (parentificação, lealdades, burnout…). Muito partilhável, cada sinal a seu tempo.',
    emoji: '🔎',
    video: true,
    instrucao:
      'Formato "Sinais de que…". Frame 1 (capa, a PORTA): gancho "Sinais de que <tema>" curto e forte, do real e reconhecível ("isto sou eu"). Depois 4 a 6 frames, UM sinal concreto por frame: uma CENA do dia a dia (corpo, casa, gesto, relação) onde a pessoa se reconhece, com ternura e NUNCA com o dedo apontado (tem de se sentir VISTA, não julgada nem diagnosticada). Frame final (a SALA): uma frase funda de cuidado e pertença, que apetece GUARDAR. Conteúdo que dá palavras ao que não se diz é o que mais se PARTILHA. kicker dos sinais = "sinal 1", "sinal 2"…',
  },
  {
    id: 'ninguem',
    nome: 'O que ninguém te explica',
    descricao: 'Reel-mini-aula: uma perspetiva psicológica/sistémica sobre algo comum, frame a frame.',
    emoji: '💡',
    video: true,
    instrucao:
      'Formato "O que ninguém te explica" (mini-aula). É quase uma aula: tem de ENSINAR algo concreto, não dar frases genéricas/motivacionais. ' +
      'Frame 1 (capa, a PORTA): uma pergunta/afirmação do real e reconhecível ("isto sou eu") que pára o scroll (ex.: "Porque é que voltas sempre ao mesmo tipo de relação?"), nunca abstrata; só "texto" (sem pontos). ' +
      'Depois 3 a 4 frames de EXPLICAÇÃO, cada um com "titulo" (3 a 6 palavras, a ideia desse passo) e "pontos" (2 a 3 bullets CURTOS, concretos, com o mecanismo real ou um exemplo do dia a dia; deixa "texto" vazio nesses). Nada de clichés: nomeia o porquê psicológico/sistémico (ex.: "o sistema familiar puxa-te para a lealdade", "o cérebro confunde familiar com seguro"). ' +
      'Frame final (a SALA): a virada/reflexão, só "texto", uma frase funda que assenta a aprendizagem e apetece GUARDAR. kicker discreto (ex.: "o que ninguém te explica"). ' +
      'Regra de ouro: cada bullet tem de ENSINAR (um facto, um mecanismo, um exemplo), nunca repetir o óbvio.',
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
    descricao: 'Reel: uma ideia de Jung, Frankl, Hellinger, Rumi… Dá para centenas, frame a frame.',
    emoji: '🕯️',
    video: true,
    instrucao:
      'Formato "Uma ideia de <pensador>" (carrossel). Frame 1 (capa): "Uma ideia de <pensador>" (nomeia o pensador no tema). Frame 2 (a PORTA): abre com uma situação do dia a dia onde a ideia se reconhece ("isto sou eu"), antes da teoria. Depois 2 a 3 frames com a ideia central explicada de forma simples e fiel. Frame final (a SALA): como aplicar/refletir hoje, numa frase funda que apetece GUARDAR e que faz pensar em alguém (partilhável). kicker = nome do pensador.',
  },
];

export function getFormato(id: string): FormatoReel {
  return FORMATOS.find((f) => f.id === id) ?? FORMATOS[0];
}
