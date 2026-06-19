// Universo VS · gerador de STORYBOARD de uma peça (à mecânica + veste da conta).
//
// Uma peça = um reel curto à ANATOMIA (faca partida no 1.º segundo · a imagem mexe
// ao serviço do gesto · raiz no meio · volta no fim · envio para uma pessoa). A
// MECÂNICA é igual em todas as contas; a VESTE (símbolos + cores) é a do universo
// da conta (contas.ts → atmosfera). Devolve um storyboard: beats { tempo, imagem,
// texto }, mais o envio. SÓ texto/indicações; a imagem gera-se depois.
//
// Dois tipos (2 posts/dia):
//   descoberta (manhã): faca FRAGMENTADA (a frase parte-se em pedaços), rápida,
//     SEM voz (texto no ecrã). Fura para estranhos.
//   profundidade (noite): VOZ-OFF contínua, a imagem transforma-se, raiz/origem
//     mais funda. Retém quem já segue.

import { VeuNome, ContaId, CONTAS } from './contas';
import { VEU_FACES, type FacesVeu } from './veu-faces';
import { VEU_SEMENTE } from './veus';
import { SABER } from './saber';
import { REFERENCIAS } from './referencias';
import type { Personagem } from './personagens';
import { getFormatoConta } from './formatos-conta';
import { VEU_COR } from './universo';
import { limparTravessoes } from '@/lib/texto';

export type TipoPeca = 'descoberta' | 'profundidade';

export interface BeatSB { tempo: string; imagem: string; texto: string }
export interface Storyboard { tipo: TipoPeca; beats: BeatSB[]; envio: string }

const lp = (s: unknown) => limparTravessoes(String(s ?? '').replace(/^["«»]+|["«»]+$/g, '').trim());

// O METAMODELO do método (a teoria por baixo de tudo: "Estratégias de
// Sobrevivência"). Cada véu/padrão NÃO é um defeito: foi, na origem, uma
// estratégia que te protegeu (lealdade, segurança, pertença). Por isso o SOLTAR
// não é lutar contra o padrão, é HONRAR a estratégia (reconhecer que te serviu,
// agradecer) e largá-la sem força, porque o presente já não a pede. Regra de
// ouro: não há soltar sem ver. Esta lente atravessa TODAS as contas e dá o tom
// da raiz e da volta (sem culpa, sem combate).
const METAMODELO =
  'O METAMODELO (a teoria por baixo, NUNCA a nomeies no texto): este padrão não ' +
  'é um defeito. Foi, na origem, uma estratégia de sobrevivência que te protegeu ' +
  '(era lealdade, segurança, pertença). Por isso a VOLTA nunca luta contra o ' +
  'padrão nem o julga: reconhece que te serviu, honra-o, agradece em silêncio, e ' +
  'só então o solta, sem força, porque o presente já não o pede. Não há soltar ' +
  'sem ver. A raiz mostra-se sem culpa; a saída é largar, não vencer.';

// O ÂNGULO de cada conta sobre o MESMO véu do dia. É isto que faz 4 peças DIFERENTES
// (e não a mesma dor 4 vezes): cada porta ataca uma FACE distinta do retrato e fecha
// no SEU movimento. Sem isto, partilhando véu e personagem, as contas convergem todas
// na cena mais óbvia. (Cura do "isto não é tudo o mesmo?".)
function focoConta(conta: ContaId, f?: FacesVeu): { titulo: string; material: string; instrucao: string } {
  if (!f) return { titulo: 'a dor deste véu', material: '', instrucao: '' };
  switch (conta) {
    case 'ver':
      return {
        titulo: 'VER o padrão de fora (RECONHECIMENTO, não solução)',
        material: [f.dor, f.custo].filter(Boolean).join(' '),
        instrucao: 'O teu trabalho é o reconhecimento: mostra o momento exato em que ela se vê no padrão, visto de fora, com clareza e sem julgamento. NÃO dês o passo de saída nem conselho (isso é de outra conta); fecha em "isto és tu", em vê-lo, não em resolvê-lo.',
      };
    case 'vir':
      return {
        titulo: 'PARAR e receber (a CULPA de descansar, a exaustão)',
        material: [f.culpa, f.fuga, f.saida].filter(Boolean).join(' '),
        instrucao: 'Fica na exaustão de quem faz tudo e na culpa que sobe ao parar. A volta é largar uma coisa, só uma, e deixar-se segurar em vez de seres sempre tu a segurar. Chega a regressar a si.',
      };
    case 'viver':
      return {
        titulo: 'A VIDA que fica por viver (o CUSTO) e o gesto de hoje',
        material: [f.custo, f.saida].filter(Boolean).join(' '),
        instrucao: 'Mostra o que fica por viver enquanto te ocupas dos outros, a vida a passar ao lado. A volta é um gesto presente e pequeno, para fazer HOJE. Chega a participar, a encarnar a vida agora.',
      };
    default: // mae
      return {
        titulo: 'NOMEAR o padrão inteiro (a vista de cima, a raiz e a direção)',
        material: [f.dor, f.revelacao, f.saida].filter(Boolean).join(' '),
        instrucao: 'Nomeia o padrão com clareza e calma, mostra a raiz ou a herança sem culpa, e fecha numa direção concreta. És a voz que vê o todo, não uma só face.',
      };
  }
}

// roda um leque para que cada conta arranque de um momento concreto DIFERENTE (e não
// agarrem todas a primeira/mais óbvia cena do banco).
function rodar<T>(arr: T[], n: number): T[] {
  if (!arr.length) return arr;
  const k = ((n % arr.length) + arr.length) % arr.length;
  return arr.slice(k).concat(arr.slice(0, k));
}

export async function gerarStoryboard(conta: ContaId, tipo: TipoPeca, veu: VeuNome, personagem: Personagem, apiKey: string, evitar: string[] = [], clarificar = false): Promise<Storyboard> {
  const c = CONTAS[conta];
  const a = c.atmosfera;
  const f = VEU_FACES[veu];
  const fmt = getFormatoConta(conta, tipo);
  const ref = REFERENCIAS[veu];
  const k = SABER[veu];
  const sem = VEU_SEMENTE[veu];
  // BANCO DE CONCRETO: a dor deste véu em momentos REAIS e observáveis, para TODOS
  // os 7 véus (não só o que tem SABER). É a cura da ambiguidade: o motor escolhe um
  // momento específico em que a mulher se reconhece em 1 segundo, em vez de soltar
  // uma frase de coach. Junta as frases de reconhecimento (VEU_SEMENTE), as faces
  // concretas do retrato (dor/fuga/culpa/custo) e, quando existe, o SABER.
  // A FONTE de conteúdo é o SABER + faces + sementes — material que NÃO acaba
  // (cresce com as cadeiras). O bancoCenas da conta NÃO entra aqui: é finito (7
  // cenas) e se liderasse o banco a manhã repetir-se-ia e esgotava. O bancoCenas
  // entra só como MOLDE da forma (ver prompt) — a "cena primeiro" gera-se NOVA a
  // partir deste banco infinito, na forma dos exemplos.
  const bancoBase = [
    ...(sem?.exemplos ?? []),
    f?.dor, f?.fuga, f?.culpa, f?.custo,
    ...(k ? [...k.comportamentos.slice(0, 6), ...k.cenas.slice(0, 5)] : []),
  ].filter(Boolean) as string[];
  // cada conta vê o banco rodado por um passo diferente -> arranca de outra cena.
  const ordemConta: ContaId[] = ['mae', 'ver', 'vir', 'viver'];
  const banco = rodar(bancoBase, ordemConta.indexOf(conta) * 3);
  // O ÂNGULO desta conta sobre o véu do dia (a face que ataca + onde fecha).
  const foco = focoConta(conta, f);
  // CARTA do baralho "Sou Aquela" (manhã da mãe): a figura é a PERSONAGEM e o texto
  // é a confissão dela na 1.ª pessoa. Quebra duas regras gerais só para este formato.
  const carta = !!fmt.cartaBaralho;
  // "Não normalizes…" (TARDE da mãe): espelho social. NÃO é a pessoa, é o que a
  // cultura tornou normal. Sem mecanismo, sem raiz, sem véu: só a cena normalizada.
  const naoNorm = !!fmt.naoNormalizes;
  // "Carta de renomear" (TARDE da vir): carta pessoal (2.ª pessoa) que RENOMEIA uma
  // história antiga (pega num nome antigo e vira-lhe o significado). Não consola.
  const cartaRen = !!fmt.cartaRenomear;
  // "O Espelho" (TARDE da ver): abre para FORA (uma pessoa real na cabeça de quem vê)
  // e vira para DENTRO (porque a escolheste para espelho). O outro é o vidro, tu o filme.
  const espelho = !!fmt.espelho;
  // "Repara" (a viver): a imagem MANDA, a palavra serve (1-2 linhas). Aponta para o
  // que já está aqui, agora. Sem moral, sem lição: um sussurro ao lado da imagem.
  const repara = !!fmt.repara;
  // A COR é SÓ a do VÉU do dia (sequência dos chakras). NÃO existe paleta de cor
  // por conta (foi banida): a cor da imagem é sempre a do véu. A conta entra com
  // os SÍMBOLOS e o MOOD (a sensação, sem cor). Veste a IMAGEM, nunca o texto.
  // EXCEÇÃO: na CARTA, a imagem é a FIGURA da personagem; o véu e a cor ficam no
  // VERSO da carta, não mandam na figura.
  const cor = VEU_COR[veu];
  const veste = carta
    ? `A IMAGEM é UMA figura da personagem ${personagem.nome} (UMA só por carta — é a FRENTE da carta), no estilo de uma CARTA ilustrada do baralho "Sou Aquela". A imagem é GERADA na API (Flux), NUNCA no Midjourney: descreve a figura como ilustração pintada coerente — uma mulher, num ângulo digno (rosto sereno OU silhueta OU de costas) com o símbolo do padrão dela. As linhas da confissão revelam-se POR CIMA desta mesma figura (não há imagem nova por linha). O VÉU e a COR não mandam na figura: ficam no VERSO da carta. Estilo: ilustração pintada, digna, intemporal.`
    : naoNorm
    ? `A IMAGEM é UMA cena REAL de 2026 que encarna a ASSIMETRIA do beat (não "tarefas"): a responsabilidade invisível sem autoridade (ex.: uma só pessoa a segurar muitos fios ao mesmo tempo · a lista interminável só com a letra dela · ela a tratar de tudo enquanto outro descansa) OU a gestão emocional (ex.: ela a sorrir por fora com o cansaço contido por dentro · toda a casa a depender do humor dela). Dignas, SEM rosto colado à câmara. A cor do véu (${VEU_COR[veu].pt}) entra subtil, não manda. Textura: painterly, fine grain.`
    : cartaRen
    ? `A FORMA VISUAL tem DOIS registos. (1) A CAPA (1.º beat) PARA O SCROLL: a frase-cena GRANDE a ocupar o ecrã, com CONTRASTE A SÉRIO (texto claro sobre fundo escuro quente) e MICRO-MOVIMENTO (a letra a assentar, um grão de luz) para o Instagram a ler como REEL, não imagem parada. Crua e grande, NUNCA sépia suave (que se confunde com mil cartões de citações). (2) O CORPO da carta: texto tipográfico em PAPEL ENVELHECIDO com timbre da conta (@${c.handle}, timbre a definir), as palavras a revelarem-se. NÃO é cena fotográfica nem Flux. Mood subtil da conta: ${a.sensacao}.`
    : espelho
    ? `A IMAGEM (que respira, em movimento, SEM rosto e SEM pessoas): espelhos infinitos, máscaras que se desfazem, fios invisíveis tornados visíveis, prismas, véus translúcidos. Azul profundo, prata, violeta, branco lunar. Textura: painterly, fine grain.`
    : repara
    ? `A IMAGEM MANDA (a palavra serve): UMA imagem concreta e específica a respirar (movimento mínimo), dos símbolos da viver — sementes, jardins, frutos dourados, auroras, mãos, flores, rodas solares. Verde esmeralda, ouro vivo, coral, branco solar. O pequeno e específico (uma luz a certa hora, um cheiro, uma textura), NUNCA o postal genérico. Textura: painterly, fine grain, luz quente.`
    : `A COR é a do VÉU de hoje e SÓ essa (não existe paleta de cor por conta, foi banida): ${cor.pt} (${cor.prompt}). Toda a imagem segue esta cor. Os SÍMBOLOS do universo desta conta (é o que distingue a conta, junto com o formato; rende-os NESTA cor do véu, em movimento): ${a.elementos.slice(0, 12).join(' · ')}. O MOOD da conta (a sensação, nunca a cor): ${a.sensacao}; ${a.fraseVisual}. Textura: painterly, fine grain, em movimento.`;
  // A VOZ própria da conta = o que define o CONTEÚDO (não a cor). A confissão
  // recorrente (fraseMae), as sensações que se repetem e o verbo de chegada são a
  // identidade SENTIDA em qualquer post da porta. A mãe é a vista panorâmica (não
  // tem fraseMae): aí a voz é o método inteiro, em 1.ª pessoa.
  const voz = c.fraseMae
    ? `A VOZ desta conta (é ISTO, não a cor, que define o conteúdo): a confissão recorrente que tem de ressoar em QUALQUER post desta porta é "${c.fraseMae}". As sensações que se repetem: ${(c.sensacoes ?? []).join(' · ')}. O movimento de chegada (o fim a que esta porta leva): ${c.chegada ?? ''}. Toda a peça reforça esta mesma voz, em qualquer ordem.`
    : `A VOZ desta conta (a mãe): a vista panorâmica do método inteiro, em 1.ª pessoa, quem nomeia o padrão com clareza serena. É a voz, não a cor, que define o conteúdo.`;

  // A FUNÇÃO da peça muda TUDO. Manhã = FACA (sentir). Noite = PROFUNDIDADE
  // (compreender). O erro a evitar: a manhã fazer o trabalho da noite (explicar).
  const ehManha = tipo === 'descoberta';
  const regrasTipo = carta
    ? `A FUNÇÃO DESTA PEÇA — CARTA "SOU AQUELA" = só RECONHECIMENTO, zero explicação. O objetivo único: a mulher pensar "meu Deus, és tu" (ela ou alguém que ama). REGRAS DE FERRO:
- O TEXTO é uma ANÁFORA de 3 a 4 comportamentos CONCRETOS e observáveis da personagem, em linhas curtas, e o ÚLTIMO beat é só "Sou aquela." sozinho.
- MOLDE (copia a FORMA, não o tema): "Sabe as consultas de todos. / Os medicamentos de todos. / Os aniversários de todos. / Quando lhe perguntam pela dela, não sabe responder." → "Sou aquela."
- ZERO explicação: NÃO nomeies o véu, a estratégia, o mecanismo, a "sobrevivência"; nada de "porque", nada de interpretação. A reflexão acontece sozinha na cabeça de quem lê.
- A imagem é UMA só figura da personagem (a FRENTE da carta), GERADA na API (Flux), nunca no Midjourney; as linhas da confissão aparecem por cima dela, não há uma imagem nova por beat.`
    : naoNorm
    ? `A FUNÇÃO DESTA PEÇA — "NÃO NORMALIZES…" = a FACA que para o scroll (nomeia a injustiça) + a VOLTA que solta (a sobrevivência, a tua teoria). Hook + raiz + volta numa só peça, tudo em texto, SEM rosto. REGRAS DE FERRO:
- PARTE 1 · A FACA (o que se partilha): os PRIMEIROS beats começam por "Não normalizes" + UMA assimetria concreta e observável. O 1.º é o MURRO que para o scroll, grande, com FÚRIA COM DIGNIDADE (a frase que se manda à irmã com "vê isto", não a frase suave que se admira). O TEMA é a ASSIMETRIA, NÃO "fazer muito"/tarefas: (1) RESPONSABILIDADE INVISÍVEL SEM AUTORIDADE; (2) GESTÃO EMOCIONAL.
- MOLDE da faca (copia a FORMA): "Não normalizes seres responsável por tudo e dona de quase nada." / "Não normalizes que a tua lista seja obrigatória e a dele opcional." / "Não normalizes que, se estás cansada, todos sintam, mas se ele está cansado, ele descanse."
- PARTE 2 · A VOLTA (o que solta): os ÚLTIMOS 1 a 2 beats viram para a SOBREVIVÊNCIA, sem suavizar, para LIBERTAR. Nomeia a ORIGEM ("aprendeste a gerir tudo quando eras a menina que segurava a casa"), HONRA ("foi como sobreviveste") e SOLTA ("mas já não és essa menina, e podes pousar o cargo"). Estes beats NÃO começam por "Não normalizes".
- MOLDE da volta: "Aprendeste a gerir tudo quando eras a menina que segurava a casa. Foi como sobreviveste. Mas já não és essa menina, e podes pousar o cargo."
- A faca corta, a volta solta. NUNCA nomeies o véu, jargão, diagnóstico nem "porque" teórico: a faca é a assimetria, a volta é a sobrevivência em linguagem da vida.
- NÃO é sobre identidade (isso é a carta da manhã): é o desequilíbrio coletivo + a libertação.`
    : cartaRen
    ? `A FUNÇÃO DESTA PEÇA — CARTA DE RENOMEAR = dar um NOME NOVO a uma história antiga. NÃO consola, NÃO ensina, NÃO diagnostica, NÃO aconselha, NÃO valida, NÃO é frase inspiracional. RENOMEIA. Se pudesse estar em mil contas de desenvolvimento pessoal, FALHOU. REGRAS DE FERRO:
- PARA O SCROLL no 1.º beat (a CAPA): abre numa CENA concreta (uma fotografia, uma memória que se VÊ), NUNCA na identidade/grupo ("para a filha mais velha") nem na tese/conclusão ("madura ou necessária"). A cena entra antes do conceito: faz VER antes de fazer pensar (a memória ganha à ideia). Ex.: "Eras criança. Já tomavas conta de todos." A reviravolta/renomeação vem DEPOIS, na viagem, nunca na capa. NUNCA abras com saudação mansa nem com um muro de texto.
- É uma CARTA pessoal, 2.ª pessoa, tom íntimo e sereno.
- ARQUITETURA (o MOLDE reutilizável da vir, 6 passos por esta ordem, a CAPA é o passo 1): (1) CENA, a fotografia (é a capa); (2) VIDA por trás, a realidade concreta onde ela se reconhece; (3) NOME antigo que carregou a vida toda; (4) RELEITURA, a viragem onde a CARTA ACONTECE (o nome nunca foi um elogio); (5) PREÇO, uma SENSAÇÃO traduzida, não explicada ("descansar sabe a dívida"); (6) ABERTURA, não manda nem resolve, só ABRE. A carta RESPIRA, não despeja tudo de uma vez.
- MOVIMENTO: a carta REVELA-SE (as palavras a aparecer, escritas), é um REEL, não uma página de texto parada.
- ZERO véu, ZERO mecanismo, ZERO diagnóstico, ZERO "deves"/conselho, ZERO validação.
- TESTE: a pessoa pensa "nunca tinha visto isto desta maneira", nunca "sinto-me validada".`
    : espelho
    ? `A FUNÇÃO DESTA PEÇA — "O ESPELHO" = REVELAR. Abre PARA FORA (uma pessoa real que vive na cabeça de quem vê, o murro que para o scroll) e VIRA PARA DENTRO (porque é que, entre milhões, ELA a escolheu para espelho). O outro é o vidro, ela é o filme. REGRAS DE FERRO:
- O 1.º beat aponta para uma FIGURA concreta da vida de quem vê (a colega, a mulher que segue, a cunhada): a faca para fora.
- O virar é a ALMA: de fora para dentro, o mecanismo em LINGUAGEM DA VIDA (inveja = a vida que não te deixaste querer; irritação = o outro faz o que te proíbes; intimidação = a permissão que não te deste; não esquecer = uma frase tua por dizer). NUNCA teoria nem nomear o véu.
- LINHA VERMELHA: sempre "o outro mostra-te a ti", NUNCA "analisa os outros". Liberta, não bisbilhota.
- POUSO: frase curta que liberta; palavra final "revelar" ou nada.${ehManha ? ' NA MANHÃ: curta, só a faca para fora + UMA linha que vira para dentro.' : ' Na TARDE: a peça inteira (fora → aprofundar → virar o vidro → pouso).'}`
    : repara
    ? `A FUNÇÃO DESTA PEÇA — "REPARA" = ENCARNAR (olha para CÁ, agora). A imagem MANDA, a palavra SERVE (1 a 2 linhas, NUNCA mais). Aponta para o que JÁ está aqui e a que não davas atenção. REGRAS DE FERRO:
- UMA imagem concreta a respirar + UMA linha que APONTA, não que ensina (um sussurro ao lado da imagem).
- SEM hook agressivo, SEM texto palavra-a-palavra, SEM voz dramática, SEM moral, SEM lição, SEM "e é por isso que…". Leve, mas NUNCA vazio: um fio de verdade por baixo, sem peso.
- O concreto e quase tonto toca; o universal bonito passa despercebido. Os instantes lembram-se, não se inventam: parte de uma coisa REAL e específica (uma luz a certa hora, um cheiro, um gesto, uma textura). Foge do "viver o momento" e da "dança na cozinha".
- Assinatura "encarnar" ou nada. Envio opcional e suave, muitas vezes nenhum.`
    : ehManha
    ? `A FUNÇÃO DESTA PEÇA — MANHÃ · DESCOBERTA = uma FACA, não um artigo. Fura para estranhos, é para ser SENTIDA, não compreendida. REGRAS DE FERRO (são o que mais importa hoje):
- POUQUÍSSIMO texto: cada beat é uma linha curta, 3 a 8 palavras, fragmentada, frase nominal. A peça inteira cabe em poucas linhas curtas.
- UMA ideia, UM corte. Reconhecimento instantâneo, no 1.º segundo.
- NÃO expliques. NÃO dês o mecanismo, NÃO dês a raiz nem a herança. PROIBIDO "porque", "não é… é…", "ou seja", e qualquer interpretação. Deixa a pessoa FECHAR a frase sozinha — o que ela descobre dói mais do que o que tu explicas.
- O SÍMBOLO manda: a imagem (em movimento) faz metade do trabalho. Descreve bem a imagem de cada beat.
- Termina como o teu FORMATO manda (muitas vezes a palavra-gesto sozinha).
- Ritmo-modelo (copia o CORTE, não o tema): "2000: agenda da mãe. / 2026: app de todos. / Os teus exames: adiados." A pessoa fecha a frase, tu não.`
    : `A FUNÇÃO DESTA PEÇA — NOITE · PROFUNDIDADE = voz-off contínua que APROFUNDA. Retém quem já segue. AQUI SIM entra o que a manhã não deu: a raiz, a herança sem culpa, o mecanismo, e a volta. Pode respirar em frases inteiras, mas continua concreta e sem jargão.`;

  const sys = `Escreves o STORYBOARD de um reel curto (9:16, ~12-20s) de uma marca de psicologia (Método VS · @${c.handle}). ${carta ? 'É uma CARTA ilustrada do baralho "Sou Aquela": a figura é a PERSONAGEM (pode ter rosto, é a carta dela).' : naoNorm ? 'Cenas REAIS do dia a dia, sem rosto colado à câmara.' : cartaRen ? 'É uma CARTA pessoal que renomeia uma história antiga; imagem contemplativa, sem pessoas.' : 'Sem rosto, sem pessoas.'} A mulher reconhece-se em 1 segundo.

${carta ? 'É uma CARTA do baralho "Sou Aquela": uma PERSONAGEM (a máscara que a mulher usa todos os dias). O reconhecimento é tudo; a reflexão acontece sozinha.' : naoNorm ? 'É um "Não normalizes…": a FACA que nomeia a injustiça normalizada (a assimetria, para parar o scroll e partilhar) E a VOLTA que solta (a origem de sobrevivência: foi uma estratégia que te protegeu, e já podes pousá-la). Hook + raiz + volta, tudo em texto, sem rosto.' : cartaRen ? 'É uma CARTA DE RENOMEAR: dá um nome novo a uma história antiga. Não consola, não ensina, não diagnostica. Renomeia. O teste é "nunca tinha visto isto desta maneira".' : espelho ? 'É "O Espelho": revela porque é que uma pessoa concreta ficou a viver na cabeça de quem vê. O outro é o vidro, ela é o filme. Abre para fora, vira para dentro. Sem rosto, sem voz.' : repara ? 'É "Repara": a imagem manda, a palavra serve. Aponta para o que já está aqui, agora, a que não davas atenção. Um sussurro, sem moral, sem lição.' : `A MECÂNICA (igual em todas as peças): faca partida no 1.º segundo · a imagem começa a mexer ao serviço do gesto · raiz no meio · volta no fim · ENVIO que aponta para UMA pessoa concreta.

${METAMODELO}`}

O FORMATO PRÓPRIO DESTA CONTA E DESTA PEÇA (${fmt.nome}) — é isto que a distingue das outras contas, segue à risca: ${fmt.registo}

${regrasTipo}

${voz}

A VESTE (só veste a IMAGEM, NUNCA define o conteúdo do texto): ${veste}
Cada beat tem uma IMAGEM feita destes símbolos, EM MOVIMENTO (o movimento é o gesto a acontecer, não fundo bonito). A imagem transforma-se ao longo dos beats.

${carta ? `A PERSONAGEM desta carta (é só sobre ela, não sobre o véu): ${personagem.nome}. ${personagem.essencia} Diz coisas como: ${personagem.frases.map((x) => `"${x}"`).join('; ')}. A sombra: ${personagem.sombra}. Tira daqui 3 a 4 comportamentos CONCRETOS e do dia a dia para a anáfora, e fecha em "Sou aquela.".` : naoNorm ? `AS LINHAS DE HOJE (cada beat é uma frase "Não normalizes…" NOVA; escolhe um ângulo de uma das duas famílias e dá-lhe um detalhe concreto de 2026, NÃO copies o molde à letra, NÃO juntes várias numa linha):
- O TERRITÓRIO (é ISTO, NÃO "fazer muito"/tarefas), duas famílias:
  (1) RESPONSABILIDADE INVISÍVEL SEM AUTORIDADE EQUIVALENTE: ser responsável por tudo e dona de quase nada; a gestão é obrigação dela e a participação dele é "ajuda"; a lista dela é obrigatória e a dele opcional; é a directora-geral da família sem nunca ter aceite o cargo; o trabalho mental nem conta como trabalho.
  (2) GESTÃO EMOCIONAL: ser responsável pelas emoções de todos menos pelas suas; a paz da casa depende do estado emocional dela; engolir o cansaço para não estragar o ambiente; a irritação dela é um problema e a exaustão é uma expectativa.
- MOLDE da FACA (a FORMA e o tipo de assimetria; é finito, NÃO é lista para repetir nem reutilizar): ${(c.bancoNaoNormalizes ?? []).map((x) => `"${x}"`).join(' · ')}
- A VOLTA (os ÚLTIMOS beats, a tua teoria): depois da faca, vira para a SOBREVIVÊNCIA, sem suavizar, para LIBERTAR. ${METAMODELO} Em linguagem da vida: nomeia a ORIGEM ("aprendeste isto quando eras a menina que segurava a casa"), HONRA ("foi como sobreviveste") e SOLTA ("mas já não és essa menina, podes pousar o cargo").
- NUNCA nomeies o véu nem jargão: a faca é a assimetria, a volta é a sobrevivência.` : cartaRen ? `A MATÉRIA DA CARTA (renomeia uma história antiga; o conteúdo de fundo vem da vida concreta dela, NÃO de uma lista fechada):
- NOME ANTIGO (escolhe UM como o nome que ela sempre acreditou ser): ${(c.nomesAntigos ?? []).map((x) => `"${x}"`).join(' · ')}
- FRASE DE VIRAGEM (a viragem do significado; usa uma OU escreve outra no mesmo espírito): ${(c.frasesViragem ?? []).map((x) => `"${x}"`).join(' · ')}
- A VIDA por trás do nome, o PREÇO e a raiz (material concreto, NÃO o nomeies como teoria): ${banco.slice(0, 8).map((x) => `"${x}"`).join(' · ')}
- NÃO nomeies o véu nem nenhum mecanismo: a carta só renomeia.` : espelho ? `A MATÉRIA (O ESPELHO): quem fica a viver na cabeça de quem vê (admira, inveja, detesta, não esquece, irrita, intimida).
- A PERGUNTA-FACA (o motor, NÃO a escrevas tal e qual): "${c.perguntaEspinha ?? 'Porque é que, entre milhões de pessoas, esta ficou a viver dentro de mim?'}"
- BANCO DE HOOKS (abre para FORA, uma pessoa REAL; usa um OU escreve novo no mesmo espírito, NÃO repitas): ${(c.bancoEspelho ?? []).map((x) => `"${x}"`).join(' · ')}
- O MECANISMO (o virar para dentro, em linguagem da vida): inveja = a vida que não te deixaste querer; irritação desproporcional = o outro faz o que te proíbes; intimidação = a permissão que não te deste; não esquecer = uma frase tua por dizer.
- LINHA VERMELHA: o outro mostra-te a ti; liberta, não bisbilhota; NUNCA analisar os outros.` : repara ? `A MATÉRIA (REPARA): a vida que JÁ está aqui, a que não dás atenção (olha para CÁ, agora).
- A PERGUNTA DE FUNDO (NÃO a escrevas): "${c.perguntaEspinha ?? 'O que não estou a ver porque estou à espera?'}"
- BANCO DE INSTANTES (concretos, pequenos, sensoriais; usa um OU lembra-te de outro REAL no mesmo registo, NÃO inventes fórmula bonita): ${(c.bancoRepara ?? []).map((x) => `"${x}"`).join(' · ')}
- A imagem MANDA: descreve UM instante concreto a respirar; a palavra é 1 a 2 linhas que apontam, um sussurro.
- SEM moral, sem lição, sem "viver o momento". O pequeno e específico toca; o bonito genérico passa.` : `O ASSUNTO de hoje (partilhado por todas as contas; muda a forma E o ângulo):
${c.perguntaEspinha ? `- A PERGUNTA-ESPINHA desta conta (é A CENA PRIMEIRO: a mulher fá-la a si própria; NUNCA a escrevas nem nomeies o véu): "${c.perguntaEspinha}". A peça é uma MICRO-CENA concreta que faz a mulher sentir esta pergunta, sem nunca a formular.\n` : ''}${c.bancoCenas?.length ? `- MOLDE DE CENA (a FORMA da "cena primeiro": concreta, curta, do dia a dia, tão específica que a mulher pensa numa cara). Estes são EXEMPLOS da FORMA, NÃO uma lista para repetir nem reutilizar: escreve uma cena NOVA, tirada do BANCO DE CONCRETO (em baixo), na MESMA forma destes: ${c.bancoCenas.map((x) => `"${x}"`).join(' · ')}.\n` : ''}${c.assinatura ? `- A ASSINATURA no fim (discreta, sozinha, uma palavra): "${c.assinatura}".\n` : ''}- VÉU (o mecanismo, NÃO o nomeies no texto): ${f?.dor ?? veu}
- O TEU ÂNGULO (o que te separa das outras contas que hoje falam do mesmo véu): ${foco.titulo}.${ehManha ? ' NA MANHÃ isto é só o CORTE: mostra-o, não o expliques.' : ` ${foco.instrucao}`}
- BANCO DE CONCRETO (momentos REAIS; escolhe UM e dá-lhe um detalhe novo, NÃO copies à letra, NÃO juntes vários): ${banco.map((x) => `"${x}"`).join(' · ')}
- A pessoa que se reconhece: ${personagem.nome}. Fala assim: ${personagem.frases.map((x) => `"${x}"`).join('; ')}. A sombra: ${personagem.sombra}
${ehManha ? '' : `- A raiz/herança e a volta (a NOITE aprofunda; nunca na manhã): ${f?.fuga ?? ''} ${f?.culpa ?? ''} ${foco.material} A direção concreta: ${f?.saida ?? ''}`}`}

${ref?.conceitos?.length ? `CAMPO DE ESTUDO (conceitos reais das cadeiras/pós-graduações dela, SÓ para TU pensares mais fundo; NUNCA os nomeies nem uses jargão/autores no texto): ${ref.conceitos.join(' · ')}${ref.estudos?.length ? ` · ${ref.estudos.join(' · ')}` : ''}.` : ''}

CONCRETO OU NADA (a regra que mais importa, é por aqui que a peça vive ou morre): cada linha de TEXTO tem de nomear um momento concreto e observável do dia a dia (um objeto, uma hora do dia, um gesto, um sítio, uma frase exata que ela diz por dentro), tão específico que a mulher se reconhece em 1 segundo e pensa "isto sou eu". TESTE a cada linha: se pudesse servir para qualquer pessoa, ou se soasse a frase de coach ou de horóscopo, está ERRADA — troca-a por um detalhe específico (ex.: não "vives em alerta" mas "às três da manhã ainda estás a resolver uma conversa que correu bem"). PROIBIDO no texto: abstrações e jargão (padrão, presença, consciência, lealdade, vazio, alma, jornada, energia, cura, transformação, essência, propósito, autoconhecimento). A IMAGEM pode ser simbólica; o TEXTO é vida concreta.

REGRAS DE VOZ (duras): português europeu, do dia a dia (a carga mental de 2026). TESTE 2026 (obrigatório): cada objeto, gesto e cena tem de ser da vida de HOJE (telemóvel, mensagens por ler, notificações, apps, encomendas, a casa de agora). PROIBIDO objetos fora do tempo (uma carta em papel por abrir, um fax, uma agenda de papel) a menos que sejam DE PROPÓSITO uma memória antiga. Se a cena só fizesse sentido há vinte anos, troca-a por uma de hoje. SEM metáforas no texto (nada de alma, universo, água, tempestade). ${carta ? 'A CARTA descreve os comportamentos da personagem (3.ª pessoa: "Sabe…", "Já…", "Ficou…") e SÓ no fim a mulher assume: "Sou aquela." NÃO é biografia da autora.' : 'SEM testemunho ("fui eu") nem biografia. Fala na 2.ª pessoa ou descreve em 3.ª.'} SEM travessões. SEM aspas. SEM hashtags. Cada frase tem de fazer sentido SOZINHA (sem pronomes ambíguos: evita "isso", "aquilo", "ela", "ele" sem dizer a quê/a quem).
O ENVIO é implícito ou aponta para uma pessoa concreta ("Marca a que…" / "Já sabes em quem pensaste").
${clarificar ? 'CLARIFICA: reescreve mais claro e direto, tirando qualquer ambiguidade, sem perder a dor.' : ''}
${evitar.length ? `NÃO repitas estes ângulos/frases já usados (encontra outro): ${evitar.slice(-12).map((e) => `"${e}"`).join('; ')}.` : ''}

Devolve SÓ JSON válido: {"beats":[{"tempo":"0-1s","imagem":"o que se vê (na veste, em movimento)","texto":"o que aparece no ecrã ou a voz-off"}, ...],"envio":"..."} com ${fmt.beats} beats.${carta ? ' O texto do ÚLTIMO beat é exatamente "Sou aquela." sozinho.' : ''}${naoNorm ? ' Os PRIMEIROS beats começam por "Não normalizes" (a faca; o 1.º é o murro que para o scroll). Os ÚLTIMOS 1 a 2 beats são a VOLTA de sobrevivência (origem → foi como sobreviveste → já não és essa menina, podes pousar) e NÃO começam por "Não normalizes".' : ''}${cartaRen ? ' O 1.º beat é a CAPA que PARA O SCROLL: uma CENA concreta (fotografia/memória que se vê), nunca identidade nem tese. Os beats seguintes são o CORPO da carta (papel, as palavras a revelarem-se), na ordem da arquitetura: vida por trás, nome antigo, releitura (a viragem onde a carta acontece), preço, abertura.' : ''}${espelho ? ' O 1.º beat ABRE PARA FORA (uma pessoa concreta que vive na cabeça, o murro que para o scroll); os do meio aprofundam; depois VIRA o vidro de fora para dentro (porque a escolheste para espelho); o último é o pouso que liberta (palavra final "revelar" ou nada).' : ''}${repara ? ' A imagem MANDA: no máximo 1 a 2 beats, cada um 1 linha curta que aponta (nunca texto longo nem palavra-a-palavra); um sussurro ao lado da imagem.' : ''}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 900, system: sys, messages: [{ role: 'user', content: `Storyboard ${tipo} para @${c.handle}, véu ${veu}, ${personagem.nome}.` }] }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}`);
  const txt = ((await res.json())?.content?.[0]?.text ?? '').trim();
  let o: { beats?: Array<{ tempo?: string; imagem?: string; texto?: string }>; envio?: string } = {};
  try { const m = txt.match(/\{[\s\S]*\}/); o = JSON.parse(m ? m[0] : txt); } catch { /* fallback */ }
  const beats: BeatSB[] = (o.beats ?? []).map((b) => ({ tempo: lp(b.tempo), imagem: lp(b.imagem), texto: lp(b.texto) })).filter((b) => b.texto || b.imagem);
  if (!beats.length) throw new Error('sem storyboard');
  return { tipo, beats, envio: lp(o.envio) };
}
