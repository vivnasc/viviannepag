// Método VS · geração de frase de reconhecimento com Claude (servidor)
//
// Partilhado entre /gerar-ia (um) e /gerar-lote (vários). Escreve UMA frase de
// reconhecimento nova do véu, na voz dela, sem travessões.

import { VeuNome, Conta } from './contas';
import { VEU_COR } from './universo';
import { VEU_SEMENTE } from './veus';
import { SABER } from './saber';
import { VEU_FACES } from './veu-faces';
import { REFERENCIAS } from './referencias';
import { limparTravessoes } from '@/lib/texto';

// Regras fixas do fundo (incluídas sempre). A ASSINATURA (pintura renascentista,
// sfumato, luz de ouro) é o que torna o feed inconfundível e não genérico
// (ver COVER-PROMPTS-METODO-VS.md). NÃO é fotografia.
const FUNDO_REGRAS =
  'fine-art painterly oil painting in a renaissance manner, sfumato, visible painterly brushwork and texture, ' +
  'soft natural painterly light, contemplative and timeless, luminous and readable (never near-black), ' +
  'NOT a photograph, NOT stock photography, generous calm empty space in the centre for an overlaid sentence, ' +
  'NO people, NO faces, NO figures, NO hands, NO text, NO letters, NO watermark, vertical 9:16';

// assunto curto de um prompt (para alimentar a lista "evita") — as primeiras palavras.
export function assuntoCurto(prompt: string): string {
  return prompt.split(',')[0].trim().split(/\s+/).slice(0, 10).join(' ');
}

// Regras fixas do fundo DRAMÁTICO (estilo de tarde, para alcance): cinematográfico,
// escuro e contrastado, luz dramática. O DRAMA vem da luz/escala/atmosfera, NÃO de
// uma fórmula fixa. Mantém 9:16 e espaço para texto.
const FUNDO_REGRAS_DRAMA =
  'abstract luminous energy and flowing particles of light over deep near-black darkness, glowing filaments, sparks and light dust, ethereal cosmic fine-art, rich and hypnotic, cinematic depth, ' +
  'generous dark space in the lower third for an overlaid sentence, NO faces, NO text, NO letters, NO watermark, NO logo, vertical 9:16';

// O Claude ESCREVE o prompt de fundo de UM post: criativo e VARIADO (assunto,
// composição e luz diferentes a cada vez), mantendo só a paleta/atmosfera da
// conta como fio condutor. Recebe `evitar` = assuntos já usados, para não repetir.
// É isto que mata a monotonia (substitui a lista fixa fundoDaConta). `estilo`:
// 'contemplativo' (padrão, manhã) ou 'dramatico' (tarde, alcance).
// A FRENTE da carta "Sou Aquela": UMA figura de mulher (o arquétipo da personagem),
// ilustração PINTADA, enquadramento de carta de oráculo, na veste da mãe (velas,
// constelações, manuscritos; âmbar/ouro velho/negro estrelado). É uma FIGURA, NÃO um
// fundo/cena — e SEM texto (as linhas da confissão entram por cima na composição).
// Determinístico (não gasta IA): a carta tem de sair sempre como carta, não cena.
export function promptCartaFigura(personagem?: string): string {
  return [
    // é uma CARTA DE BARALHO/ORÁCULO a sério — um OBJETO carta, com MOLDURA ornamentada,
    // a figura dentro da carta, proporção de carta — não um retrato/imagem solto.
    'an ornate illustrated tarot / oracle CARD, the whole image is a single trading-card object with a decorative ornate gold border and frame around it, card proportions',
    'inside the frame, a single dignified woman as a timeless archetype',
    personagem ? `embodying the figure of "${personagem}"` : '',
    'serene contemplative figure centered within the card, symbolic and calm, elegant',
    'painterly fine-art illustration, renaissance sfumato, candles, soft constellations and old manuscripts, warm amber and old-gold on deep starry near-black',
    'clearly a card drawn from a deck, ornamental corners and inner border, intemporal',
    'NO text, NO letters, NO words, NO numbers, NO title, NO watermark, NO logo',
  ].filter(Boolean).join(', ');
}

export async function gerarFundoIA(conta: Conta, evitar: string[], apiKey: string, frase?: string, estilo: 'contemplativo' | 'dramatico' = 'contemplativo', veu?: VeuNome): Promise<string> {
  const a = conta.atmosfera;
  // A COR é a do VÉU do dia e SÓ essa (a cor por conta foi ABOLIDA). A conta entra
  // com os símbolos e o mood, nunca com a cor. Sem véu, cai no mood da conta.
  const corMundo = veu
    ? `A COR é a do VÉU de hoje e SÓ essa: ${VEU_COR[veu].prompt} (${VEU_COR[veu].pt}). A conta dá os símbolos e o mood, NUNCA a cor. Mood: ${a.sensacao}`
    : `${a.prompt}. Sensação: ${a.sensacao}`;
  const evita = evitar.length ? `NÃO repitas nem te aproximes destes assuntos JÁ usados: ${evitar.slice(-14).map((e) => `"${e}"`).join('; ')}.` : '';
  const sys = estilo === 'dramatico'
    ? `És diretor de arte de uma marca de psicologia (Método VS, @${conta.handle}). Escreves UM prompt de imagem (em inglês) para um reel DRAMÁTICO que para o scroll — sofisticado, hipnótico, nunca clichê.

A LINGUAGEM (essencial — o que torna isto deslumbrante E barato de gerar/animar): LUZ e PARTÍCULAS a FLUIR sobre PRETO quase total. Energia luminosa, fios e poeira de luz, espirais, anéis e portais de luz, fumo luminoso, correntes de faíscas, nebulosas, reflexos — formas ABSTRATAS feitas de luz. NÃO são cenas realistas nem pessoas: é luz viva sobre escuridão. Elegante, etéreo, cósmico, fine-art (não stock, não foto crua).
A COR DA LUZ é a desta conta: ${corMundo}. A luz brilha NESTA paleta sobre fundo escuríssimo. Representa: ${conta.depois}
VARIA a FORMA da luz de post para post (espiral, anel/portal, fios a subir, vórtice, chuva de faíscas, onda de luz, nuvem luminosa, fenda de luz) e a composição (macro, centrado, a abrir, vista de cima). RARAMENTE uma silhueta humana minúscula ao fundo, e só se ajudar a frase — a ESTRELA é a luz, nunca uma pessoa parada (isso anima pobre).
${frase ? `A FRASE deste post é: «${frase}». A FORMA da luz ENCARNA o sentimento da frase (algo que se desfaz, que volta, que se abre, que se prende) — não um fundo genérico. A frase manda a metáfora; a luz na cor da conta dá o espetáculo.` : 'A forma da luz encarna o significado da conta.'}
MOVIMENTO É O PROTAGONISTA (a imagem vai ser ANIMADA): compõe luz/partículas que FLUEM, rodopiam, sobem, pulsam e se abrem — movimento contínuo e natural da própria luz (é isto que anima lindamente, sem deformar nada).
${evita}

Termina sempre com: ${FUNDO_REGRAS_DRAMA}.
Devolve SÓ o prompt, numa linha, em inglês, sem aspas e sem explicações.`
    : `És diretor de arte. Escreves UM prompt de imagem (em inglês) para o FUNDO de um post do Método VS (@${conta.handle}).

ASSINATURA VISUAL (INVIOLÁVEL — é o que torna o feed inconfundivelmente desta marca): pintura fine-art à maneira RENASCENTISTA, sfumato, textura pictórica visível (NÃO é fotografia, NÃO é stock), contemplativo e intemporal. Luminoso e legível (nunca quase-preto).

PALETA E MUNDO: ${corMundo}. Os SÍMBOLOS são os da conta (mas a COR é a do véu). Representa: ${conta.depois}
${frase ? `A FRASE deste post é: «${frase}».
CONEXÃO IMAGEM↔TEXTO (o mais importante, como nas séries VC Sabia / Hoje em Mim): a imagem tem de ENCARNAR esta frase — uma cena ou objeto concreto que representa o ESTADO ou a METÁFORA por trás dela, NÃO um fundo genérico. A FRASE manda o ASSUNTO; o mundo da conta dá só a PALETA, a luz e o tratamento. Ex.: uma frase sobre adiar a vida → algo que evoque espera/limiar; sobre o corpo → algo do corpo/casa; etc. Concreto, sensorial, sem pessoas.` : `ASSUNTO: cena real e concreta que encarne o significado da conta (interiores, objetos, janelas, água, paisagens, detalhes), variada, sem pessoas.`}
MOVIMENTO (INVIOLÁVEL — a imagem vai ser ANIMADA depois): a cena TEM de conter, em destaque, pelo menos UM elemento que se mova sozinho de forma natural e contínua — água a ondular, chama/vela a tremer, fumo ou incenso a subir, névoa/neblina a derivar, vapor, mar/ondas, chuva, tecido/cortina ao vento, luz a tremeluzir, brasas, pó num raio de sol, ramos/folhagem ao vento, reflexos na água. É este elemento que dá vida ao vídeo. PROIBIDO uma cena que seja só um objeto parado sem nada vivo (ex.: um casaco pendurado, uma cadeira vazia, um copo de água pousado, um livro fechado): se a metáfora pedir um objeto assim, ENCENA-O sempre com um elemento em movimento à volta (a luz a tremer sobre ele, fumo a passar, a água ao lado a mexer, a cortina atrás ao vento). A metáfora da frase manda o assunto; o movimento é OBRIGATÓRIO na composição.
COMPOSIÇÃO: varia (plano largo / macro / interior / vista de cima / ao nível do olhar). LUZ: dentro da paleta da conta, varia a hora.
${evita}

Termina sempre com: ${FUNDO_REGRAS}.
Devolve SÓ o prompt, numa linha, em inglês, sem aspas e sem explicações.`;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 320, system: sys, messages: [{ role: 'user', content: `Novo fundo para @${conta.handle}, claramente diferente dos já usados.` }] }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}`);
  let t = ((await res.json())?.content?.[0]?.text ?? '').trim().replace(/^["«»]+|["«»]+$/g, '');
  if (!t) throw new Error('vazio');
  if (!/9:16/.test(t)) t += `, ${estilo === 'dramatico' ? FUNDO_REGRAS_DRAMA : FUNDO_REGRAS}`; // garante as regras fixas
  return limparTravessoes(t);
}

export async function fraseReconhecimento(veu: VeuNome, apiKey: string, evitar: string[] = [], foco?: { titulo: string; exemplos: string[] }): Promise<string> {
  const s = VEU_SEMENTE[veu];
  // POÇO FUNDO: o SABER do véu (a área de estudo) dá MUITAS faces da dor, para a
  // frase ter ângulos novos infinitos em vez de repetir os poucos exemplos-semente.
  const k = SABER[veu];
  const materia = k ? `
MATÉRIA-PRIMA deste véu (a área de estudo dela; usa para encontrar um ÂNGULO NOVO da dor, NÃO copies à letra):
- comportamentos: ${k.comportamentos.join(' · ')}
- cenas do dia a dia: ${k.cenas.join(' · ')}
- custos: ${k.custos.join(' · ')}
- mecanismos: ${k.mecanismos.join(' · ')}` : '';
  // RETRATO VALIDADO pela Vivianne (veu-faces.ts): a voz EXATA dela, a verdade-mãe
  // deste véu. Mais forte que as listas largas: é o que separa o método do mercado
  // (o mercado fala do comportamento; aqui a dor carrega o MOTIVO, a fuga/culpa).
  // Âncora autoritária; a frase nasce DESTA dor, com o motivo por baixo.
  const f = VEU_FACES[veu];
  const retrato = f ? `
RETRATO VALIDADO deste véu (a VOZ EXATA da Vivianne, validada por ela; é a VERDADE-MÃE e o MOTIVO deste véu, não um molde a copiar à letra):
- a dor (a verdade-mãe, para SENTIRES, não para copiar): ${f.dor}
- o motivo por baixo (a fuga aplaudida): ${f.fuga}
- a culpa que a prende: ${f.culpa}
USO: a VOZ e o MOTIVO acima são CONSTANTES (toda a dor deste véu os carrega). Se houver um ÂNGULO DESTA SEMANA (abaixo), é ELE que escolhe QUE face concreta escrever desta vez. O retrato dá a alma; o ângulo dá a direção.
O QUE SEPARA O MÉTODO DO MERCADO: o mercado fala do comportamento; a tua dor tem de deixar SENTIR o motivo (a fuga, a culpa) por baixo, não só descrever o que ela faz.` : '';
  // CAMPO DE ESTUDO (cadeiras): conceitos reais SÓ para pensar um ângulo novo da
  // dor. NUNCA aparecem na frase (nada de nomes/termos técnicos): a frase fica
  // sempre brusca e concreta. É o que dá variedade "infinita".
  const ref = REFERENCIAS[veu];
  const campo = ref?.conceitos.length
    ? `\nCAMPO DE ESTUDO (conceitos reais, SÓ para TU encontrares uma face nova e concreta da dor; NUNCA os nomeies nem uses termos técnicos, nomes de autores, livros ou jargão na frase): ${ref.conceitos.join(' · ')}.`
    : '';
  // ÂNGULO DA SEMANA (o percurso trimestral): faz a dor SAIR pela dimensão que a
  // semana planeou. É isto que liga o trimestral ao semanal (o planeado é executado).
  const angulo = foco?.exemplos?.length
    ? `\nÂNGULO DESTA SEMANA (o foco do percurso de 3 meses; escreve a dor a partir DESTE ângulo): ${foco.titulo}. Inspira-te nestas faces para encontrares UMA nova (NÃO copies à letra): ${foco.exemplos.slice(0, 6).map((e) => `"${e}"`).join('; ')}.`
    : '';
  const sys = `Escreves UMA frase curta de RECONHECIMENTO para um reel de psicologia (Método VS). É a voz interior de uma mulher cansada, na 1.ª pessoa, que ela reconhece em 3 segundos ("isto sou eu"). Padrão: ${s.descricao}
FALA SIMPLES (regra dura): escreve como uma pessoa REAL fala a uma amiga, em voz alta. PROIBIDO metáforas, comparações ("como o/a…"), linguagem poética, filosófica, espiritual ou de coach. Nada de "alma", "universo", "tempestade", "rio", "véu". Uma frase que alguém DIZ mesmo, não que escreve num livro.
REGRAS: português europeu; máximo 12 palavras; concreta e do dia a dia (não abstrata, não aforismo). A frase tem de fazer sentido SOZINHA, sem contexto: NÃO uses pronomes ambíguos (evita "ela", "ele", "isso", "aquilo", "lá" sem dizer a quê ou a quem te referes). SEM travessões (nem — nem –); SEM hashtags; sem aspas. Tem de ser DIFERENTE destes exemplos: ${s.exemplos.map((e) => `"${e}"`).join('; ')}.
${retrato}${materia}${campo}${angulo}
ASSINATURA DO VÉU (essencial): a dor tem de ser inconfundível DESTE padrão. Se tapares o nome do véu, tem de ser óbvio que só podia ser este. Evita dores genéricas que servem qualquer pessoa; mostra a observação concreta e específica deste véu.
VARIEDADE (essencial, pensamos a LONGO PRAZO): a mesma dor tem muitas faces (o corpo, o tempo, o dinheiro, o trabalho, a casa, as relações, o futuro, a noite). NÃO voltes sempre ao mesmo exemplo nem ao mesmo tema; escolhe uma face diferente da matéria-prima de cada vez.
VARIA A FORMA: muda a ABERTURA e a estrutura. NÃO comeces várias frases da mesma maneira (ex.: não repitas frases a começar por "Sorrio" ou "Estou"). Alterna entre uma cena concreta, um hábito, um pensamento e uma fala.
${evitar.length ? `JÁ FORAM usadas estas frases nesta conta, NÃO repitas o tema nem as palavras de nenhuma (encontra outra face da dor): ${evitar.slice(-30).map((e) => `"${e}"`).join('; ')}.` : ''}
Devolve SÓ a frase, nada mais.`;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 120, system: sys, messages: [{ role: 'user', content: `Nova frase de reconhecimento do véu ${veu}.` }] }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}`);
  const t = ((await res.json())?.content?.[0]?.text ?? '').trim().replace(/^["«»]+|["«»]+$/g, '');
  if (!t) throw new Error('vazio');
  return limparTravessoes(t);
}

// FACE 2 de um reel de 2 faces (mãe): a REVELAÇÃO do MECANISMO INVISÍVEL da cena
// da Face 1. Nasce DA Face 1 (não de uma lista genérica), por isso liga-se a ela.
// Regra (da Vivianne): se a Face 1 mostra uma cena, a Face 2 revela o que a pessoa
// fez sem perceber — específico, não um aforismo bonito. É o que torna o método VS.
export async function revelacaoDaDor(veu: VeuNome, dor: string, apiKey: string): Promise<string> {
  const mecanismos = SABER[veu]?.mecanismos ?? [];
  const sys = `És a voz do Método VS. Recebes a FACE 1 de um reel: uma CENA concreta da dor (a pessoa reconhece-se nela). Escreves a FACE 2: a REVELAÇÃO do MECANISMO INVISÍVEL DAQUELA cena exata.

O QUE É (regra dura): NÃO é uma frase inspiracional, NÃO é um aforismo bonito, NÃO é "cura a tua dor". É "olha o que acabaste de fazer sem perceber". Mostras o mecanismo escondido por trás DAQUELA cena, com uma observação ESPECÍFICA que a pessoa nunca tinha percebido. Liga-te ao concreto da cena; NÃO subas para abstrato genérico ("a vida", "a alma", "o amor").

PANCADA MENTAL (essencial): tem de criar um pequeno estalo, um reframe que vira a cena do avesso. NÃO uma verdade bonita e geral. Exemplo do que EVITAR vs FAZER: EVITA "A tua vida não começa depois." → FAZ "Estás a adiar viver até mereceres viver." (nomeia o que ela faz e o porquê escondido).
ASSINATURA DO VÉU (essencial): se tapares o nome do véu, tem de ser ÓBVIO que isto só podia ser ESTE padrão. Usa o mecanismo PRÓPRIO deste véu, não algo que serviria qualquer dor. Uma revelação que pudesse estar noutro véu está ERRADA.

VOZ: português europeu, 2.ª pessoa ("tu"), brusca e direta. SEM metáforas, SEM linguagem poética/espiritual/de coach, SEM nomear jargão, conceitos ou autores. 1 a 2 frases curtas e secas. SEM travessões (nem — nem –), SEM aspas, SEM hashtags.

MECANISMO deste véu (matéria-prima para descobrires o que está POR BAIXO da cena; NÃO copiar à letra, NÃO nomear): ${mecanismos.join(' · ')}.

REGISTO CERTO (exemplo): Face 1 "Antecipo a despedida antes de o jantar acabar." -> Face 2 "Não estás a viver este jantar. Estás a tentar sofrer primeiro para doer menos depois."

Devolve SÓ a Face 2 (1 a 2 frases), nada mais.`;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 160, system: sys, messages: [{ role: 'user', content: `Face 1 (a cena): «${dor}». Escreve a Face 2: revela o mecanismo invisível desta cena.` }] }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}`);
  const t = ((await res.json())?.content?.[0]?.text ?? '').trim().replace(/^["«»]+|["«»]+$/g, '');
  if (!t) throw new Error('vazio');
  return limparTravessoes(t);
}

// Reescreve uma frase de reconhecimento para tirar a ambiguidade, SEM perder a
// dor. Para "melhorar" um post já gerado (mantendo a imagem, sem custo novo).
export async function melhorarFrase(texto: string, apiKey: string): Promise<string> {
  const sys = `Reescreves UMA frase de reconhecimento (psicologia, Método VS) para ficar CLARA e AUTÓNOMA, sem perder a dor. Tira pronomes ambíguos (evita "ela", "ele", "isso", "aquilo", "lá" sem dizer a quê ou a quem). Mantém a 1.ª pessoa e o mesmo sentido, português europeu, máximo 12 palavras, concreta, SEM travessões, SEM aspas, SEM hashtags. Devolve SÓ a frase.`;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 120, system: sys, messages: [{ role: 'user', content: `Frase a clarificar: "${texto}"` }] }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}`);
  const t = ((await res.json())?.content?.[0]?.text ?? '').trim().replace(/^["«»]+|["«»]+$/g, '');
  if (!t) throw new Error('vazio');
  return limparTravessoes(t);
}
