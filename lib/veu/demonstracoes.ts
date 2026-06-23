// veu.a.veu · DEMONSTRAÇÕES FÍSICAS — a biblioteca curada (desenhada com a Vivianne).
// Cada semana do plano editorial tem uma DEMONSTRAÇÃO: um fenómeno físico REAL em que
// a surpresa É a verdade do conceito (não ilustra, faz acontecer). O vídeo gera-se por
// IA (Runway Gen-4.5 via Replicate); o TEXTO é sobreposto pela app (a IA erra letras).
//
// Mapeado ao PLANO_EDITORIAL (lib/veu/planoEditorial.ts). A semana 1 não tem (já passou).
// NADA aqui é cópia: nasceram todas do campo dela (constelação, sombra, heranças, sentido).

export interface Demonstracao {
  semana: number;
  materia: string;        // a matéria/curso da semana
  tema: string;           // o tema editorial
  objeto: string;         // o fenómeno (curto, para a Vivianne reconhecer)
  prompt: string;         // prompt EN para o Runway Gen-4.5 (vertical 9:16)
  beats: string[];        // o texto que aparece no ecrã, em sequência (1.ª linha = a faca)
  envio: string;          // o CTA leve
  legenda: string;        // a legenda longa (sem hashtags; estas juntam-se à parte)
}

export const DEMONSTRACOES: Demonstracao[] = [
  {
    semana: 2, materia: 'Constelação Familiar', tema: 'Dar e receber em equilíbrio',
    objeto: 'duas bolhas de sabão ligadas (a pequena esvazia para a grande)',
    prompt: 'Two iridescent soap bubbles of different sizes connected by a thin straw, resting on a kitchen table by a bright window in a real home, soft morning daylight. In slow motion the smaller bubble gradually deflates and shrinks while the larger bubble visibly swells and grows, air flowing through. Rainbow shimmer on the film, shallow depth of field, real wood and glass textures. No text, no hands, no people. Vertical 9:16.',
    beats: ['Dás, dás, dás.', 'E não percebes porque te esvazias.', 'Quando só um dá, esvazia-se para encher o outro.', 'O equilíbrio não vem sozinho. Constrói-se.'],
    envio: 'Marca quem só sabe dar.',
    legenda: 'Há quem ame como a bolha pequena: dá o ar todo para o outro brilhar maior.\n\nNão é generosidade, é desaparecimento lento. O amor que dura é o que circula nos dois sentidos: dás, e deixas-te encher.\n\nHoje, recebe também.',
  },
  {
    semana: 3, materia: 'Desenvolvimento Pessoal', tema: 'Limites saudáveis',
    objeto: 'moedas que se vão pondo no copo cheio e a água sobe abaulada, segura por uma pele invisível, até transbordar',
    prompt: 'Extreme close-up of a glass filled to the very brim on a wooden kitchen table by a window in natural daylight. A hand gently drops small coins into the full glass, one by one. With each coin the water rises and bulges higher into a clear trembling dome above the rim, held up by an invisible skin, far higher than seems possible, without spilling. After one coin too many the dome finally breaks and the water floods over the rim and runs across the wooden table. Real water and coins, natural light, slow motion. Vertical 9:16.',
    beats: ['Achas que aguentas tudo.', 'E aguentas, muito além do que parece.', 'Há um limite invisível que te segura inteira.', 'Tira-o, e espalha-se tudo.'],
    envio: 'Guarda para o dia em que precisares de dizer não.',
    legenda: 'A água segura-se acima do copo por uma pele que não vês. Aguenta moedas e moedas. Até que uma gota a mais rompe a tensão, e entorna tudo de uma vez.\n\nUm limite não te isola. É a pele invisível que te mantém inteira.\n\nDiz não antes da gota a mais.',
  },
  {
    semana: 4, materia: 'Psicologia Transpessoal', tema: 'Persona e máscara social',
    objeto: 'espelho de dois sentidos: só espelho até se acender a luz por trás',
    prompt: 'A two-way mirror on the wall of a real lived-in room at dusk: at first a perfect reflective mirror. Slowly a warm lamp turns on behind it, and the mirror becomes transparent, revealing a quiet human silhouette standing behind the glass that was invisible before. Real room, natural intimate light, slow reveal. No text. Vertical 9:16.',
    beats: ['Mostras um reflexo polido.', 'E todos acreditam que é tudo o que há.', 'Enquanto a luz é só à frente, vês a máscara.', 'Acende-se por dentro, e aparece quem está lá.'],
    envio: 'Partilha com quem usa máscara há demasiado tempo.',
    legenda: 'Um espelho de dois sentidos é só espelho enquanto a luz está à frente. Mostra-te a ti o teu próprio reflexo. Mas acende-se a luz por trás, e o vidro abre-se: havia uma pessoa inteira ali, que não se via.\n\nA persona protege. Mas por baixo, alguém espera ser visto.\n\nAcende a luz por dentro.',
  },
  {
    semana: 5, materia: 'Psicologia Transpessoal', tema: 'Sombra e integração',
    objeto: 'ferrofluido que se ergue em espinhos vivos sob um íman escondido',
    prompt: 'A pool of black ferrofluid resting still in a white ceramic dish on a real desk by a window in natural daylight. A hidden magnet approaches from beneath and the black liquid suddenly rises into sharp living spikes and shifting geometric architecture, breathing. Glossy black liquid, real reflections, mesmerizing slow motion. No text, no people. Vertical 9:16.',
    beats: ['O que recusas em ti não desaparece.', 'Fica quieto. À espera.', 'Basta o campo certo, e ergue-se.', 'O que rejeitas, governa-te.'],
    envio: 'Guarda para quando algo em ti se erguer sem aviso.',
    legenda: 'O ferrofluido parece um charco morto. Mas há um campo invisível por baixo, e ele ergue-se em espinhos vivos, com forma e vontade.\n\nA sombra é isso: o que afastas não morre, espera o campo certo para se erguer. Integrá-la não é vencê-la, é deixá-la voltar a ti.\n\nO que olhas, deixa de te governar.',
  },
  {
    semana: 6, materia: 'Constelação Familiar', tema: 'Lealdades invisíveis',
    objeto: 'a corda de uma guitarra que canta sozinha quando se toca a outra',
    prompt: 'Two acoustic guitars standing side by side in a real living room in warm afternoon daylight from a window. A single string on the first guitar is plucked and vibrates; then the matching string on the SECOND, untouched guitar begins to vibrate and sing on its own, sympathetic resonance, fine dust trembling on it. Real wood textures, shallow depth of field, slow motion. No text, no hands shown after the pluck. Vertical 9:16.',
    beats: ['Sentes uma dor.', 'E juras que é tua.', 'Mas ninguém tocou a tua corda.', 'Vibras com algo que nunca foi teu.'],
    envio: 'Marca quem repete uma história que não começou nele.',
    legenda: 'Tocas uma corda numa guitarra, e a mesma corda da guitarra do lado, que ninguém tocou, começa a cantar. Chama-se ressonância.\n\nÉ assim a lealdade invisível: vibras com uma dor de outra geração, e juras que é tua. Reconhecer de quem é, devolve-te o silêncio.\n\nNem toda a dor que sentes começou em ti.',
  },
  {
    semana: 7, materia: 'Constelação Familiar', tema: 'Parentificação: ser mãe da mãe',
    objeto: 'a pedra mais pequena (a chave) que segura um arco inteiro',
    prompt: 'A real old stone archway outdoors in daylight. Focus on the small keystone at the very top. The small keystone is slowly removed, and the entire heavy stone arch collapses in slow motion, dust rising in the sunlight. Real weathered stone texture, natural daylight, weighty slow motion. No text, no people. Vertical 9:16.',
    beats: ['Foste a criança que segurava todos.', 'A mais pequena, a aguentar o peso todo.', 'Tira a pedra do topo, e o arco inteiro cai.', 'Mas tu não nasceste para segurar quem devia segurar-te.'],
    envio: 'Guarda se cresceste cedo demais.',
    legenda: 'Num arco de pedra, a peça mais pequena, lá no topo, é a que segura tudo. Tira-a, e desaba o arco inteiro.\n\nA criança parentificada é essa pedra: pequena, e a aguentar a estrutura toda. Mas esse peso nunca foi para os teus ombros.\n\nPodes pousá-lo. Não cais com ele.',
  },
  {
    semana: 8, materia: 'Desenvolvimento Pessoal', tema: 'Burnout do cuidador',
    objeto: 'a vela dentro do frasco que se apaga por falta de ar, não de cera',
    prompt: 'A lit candle with plenty of wax, placed inside a sealed glass jar on a windowsill in soft daylight. The flame slowly dims, shrinks and goes out, not from lack of wax but from lack of oxygen in the closed jar, a thin trail of smoke rising. Real glass, natural light, slow motion. No text, no people. Vertical 9:16.',
    beats: ['Ainda tens tanto para dar.', 'Mas a chama baixa, baixa.', 'Não te apagaste por falta de cera.', 'Faltou-te ar. Faltou-te espaço para respirar.'],
    envio: 'Manda a quem cuida de todos menos de si.',
    legenda: 'A vela dentro do frasco fechado não se apaga por ficar sem cera. Apaga-se por consumir todo o ar. Tinha tanto para arder ainda.\n\nO burnout é isto: não é fraqueza nem falta de amor. É falta de espaço para respirar. O teu cansaço é um pedido de limite.\n\nAbre o frasco antes de te apagares.',
  },
  {
    semana: 9, materia: 'Psicologia e Espiritualidade', tema: 'Sentido e propósito',
    objeto: 'o ovo que não parte na mão fechada (pressão uniforme) e estilhaça à primeira fenda',
    prompt: 'A raw egg held inside a closed fist in a real kitchen in natural daylight, squeezed with firm even pressure: the egg does not break, the arched shell distributing the force. Then a single point of pressure or a tiny crack appears and the egg suddenly shatters. Real skin and shell texture, natural light, slow motion. No text. Vertical 9:16.',
    beats: ['A pressão é a mesma para todos.', 'Com um porquê inteiro, suportas quase tudo.', 'O sentido distribui o peso por ti toda.', 'Uma fenda nesse porquê, e estilhaças.'],
    envio: 'Guarda para um dia difícil.',
    legenda: 'Um ovo inteiro não parte na mão fechada, por mais força uniforme que faças: a forma distribui a pressão. Mas chega uma fenda, um ponto fraco, e estilhaça.\n\nFrankl dizia: um porquê sustenta quase todo o como. O sentido não tira o peso, distribui-o por ti toda.\n\nGuarda o teu porquê inteiro.',
  },
  {
    semana: 10, materia: 'Psicologia e Espiritualidade', tema: 'A noite escura da alma',
    objeto: 'a vela que se reacende pelo fio de fumo, sem tocar o pavio',
    prompt: 'A just-extinguished candle on a wooden table in a real dim room at evening, a thin ribbon of smoke rising straight up in still air. A separate lit match is brought near the top of the smoke trail (not the wick), and the flame travels DOWN the smoke and reignites the candle. Real warm light, natural slow motion. No text, no people. Vertical 9:16.',
    beats: ['Pensaste que se tinha apagado.', 'Que daquilo já não voltava nada.', 'Mas há um fio que ainda liga à luz.', 'O que julgavas apagado, reacende.'],
    envio: 'Manda a quem está no escuro agora.',
    legenda: 'Apagas a vela, e sobe um fio de fumo. Chegas uma chama ao fumo, longe do pavio, e a chama desce o fio e reacende a vela. Quase ninguém sabe que é possível.\n\nA noite escura da alma é esse fio: parece tudo apagado, mas há uma linha invisível que ainda te liga à luz.\n\nNo escuro também se cresce.',
  },
  {
    semana: 11, materia: 'Constelação Familiar', tema: 'O que pertence a cada um, volta a cada um',
    objeto: 'a gota de tinta que se desmistura e volta à gota (fluxo laminar)',
    prompt: 'A real laminar-flow demonstration device on a desk by a window in natural daylight: clear viscous liquid between two glass cylinders; a single drop of dark ink is injected and slowly stirred until it completely dissolves and disappears into swirls. Then the stirring is reversed and the ink un-mixes, the swirls gathering back into the original single clean drop. Real glass and liquid, natural light, slow motion. No text. Vertical 9:16.',
    beats: ['Carregaste o que se misturou em ti.', 'Dores que nem sabias de quem eram.', 'Quando cada coisa volta a quem pertence,', 'o que parecia perdido volta a inteirar-se.'],
    envio: 'Guarda para quando precisares de devolver o que não é teu.',
    legenda: 'Uma gota de tinta mistura-se no líquido e parece perdida para sempre. Mas roda-se ao contrário, e a tinta junta-se de novo na gota original. O irreversível, desfeito.\n\nCurar, na constelação, é isto: devolver a cada um o que é seu. O que carregaste e não era teu volta ao lugar, e tu voltas a inteirar-te.\n\nDevolve, e respira.',
  },
  {
    semana: 12, materia: 'Psicologia e Espiritualidade', tema: 'Perdão: libertar-se, não esquecer',
    objeto: 'a armadilha de dedo: quanto mais puxas, mais aperta',
    prompt: 'A woven bamboo finger trap with a real finger in each end, on a table in a real home in natural daylight. As the fingers pull apart to escape, the woven tube tightens and grips harder. Then the fingers stop fighting and gently push inward, and the trap loosens and releases. Real hands, natural light, shallow depth of field, slow motion. Vertical 9:16.',
    beats: ['Aperta-la com força.', 'E quanto mais puxas, mais te prende.', 'Não te soltas com luta.', 'Soltas-te quando deixas de puxar.'],
    envio: 'Guarda para o que ainda não largaste.',
    legenda: 'A armadilha de dedo aperta mais quanto mais puxas para fugir. Só te libertas quando paras de lutar e cedes para dentro.\n\nO perdão é assim: não apaga a marca, não nega a dor. Mas a força que te prende és tu a fazê-la. Largar não é esquecer, é parar de puxar.\n\nSolta, e a mão abre-se.',
  },
  {
    semana: 13, materia: 'Psicologia Transpessoal', tema: 'Individuação',
    objeto: 'a areia no caos que salta para um padrão perfeito na frequência certa (Chladni)',
    prompt: 'Top-down view of a real metal Chladni plate on a workbench by a window in natural daylight, covered with fine sand in chaotic scattered piles. As a pure tone vibrates the plate and the frequency rises to a resonant point, the sand suddenly leaps and self-organizes into a perfect symmetric geometric pattern. Real metal and sand texture, natural light, satisfying slow motion. No text, no people. Vertical 9:16.',
    beats: ['Por fora, parece tudo caos.', 'Areia sem forma, espalhada.', 'Até à tua frequência. A tua.', 'E tudo salta para o lugar que já estava à espera.'],
    envio: 'Guarda para te lembrares de quem és.',
    legenda: 'Areia espalhada numa placa, puro caos. Mas chega a frequência certa e a areia salta sozinha para um padrão perfeito, que já estava latente, à espera.\n\nIndividuação é tornares-te quem sempre foste. A forma não se inventa, revela-se quando encontras a tua frequência.\n\nTorna-te o teu próprio som.',
  },
];

export const demonstracaoDaSemana = (semana: number): Demonstracao | undefined =>
  DEMONSTRACOES.find((d) => d.semana === semana);
