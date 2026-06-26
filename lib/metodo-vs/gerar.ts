// MÉTODO VS · gerador NOVO, do zero, espelho do Soulab — a VOZ DA REVELAÇÃO.
//
// Uma peça = um reel 9:16 kinético (a mesma moldura limpa do Soulab): uma imagem
// conceptual clara + as linhas da revelação que se revelam uma a uma. NÃO descreve
// comportamentos, NÃO explica: RENOMEIA um padrão humano invisível e muda o
// significado da história. A pessoa pensa "nunca tinha visto isto assim".
//
// VÁRIOS FORMATOS (ângulos), como os tipos do Soulab — para os posts diários serem
// diferentes. Lê SÓ a matéria da Vivianne (o SABER). Zero código do motor velho.

import { SABER } from '@/lib/metodo/saber';
import { type VeuNome, type ContaId } from '@/lib/metodo/contas';
import { hashtagsMetodo } from '@/lib/metodo/hashtags';
import { limparTravessoes } from '@/lib/texto';
import { FORMATOS, type FormatoId, ancoraConta, ancoraContaManha } from './formatos';

export const VEUS_VS = Object.keys(SABER) as VeuNome[];

export interface PecaVS {
  veu: VeuNome;
  formato: FormatoId;
  momentos: string[];   // as linhas da revelação (a 1.ª é o nome comum / a faca)
  destaque: string[];
  fundoPrompt: string;  // imagem conceptual (Flux), em inglês
  legenda: string;
  hashtags: string[];
  conceito: string;     // selo curto
  seguir?: string;      // o convite a seguir (gerado à parte; legenda sempre, frame só se multi)
}

const lp = (s: unknown) => limparTravessoes(String(s ?? '').replace(/^["«»]+|["«»]+$/g, '').trim());

// A IMAGEM, em DUAS camadas separadas (decisão jun 2026, para parar de queimar dinheiro):
//  1) a CENA — o QUE se vê — é o ÚNICO que o Claude escreve (uma frase curta que encarna a
//     frase). Vive em fundoPrompt/notaVisual.
//  2) o ESTILO + os BANIMENTOS — o COMO — são acrescentados AQUI, no servidor, na hora do
//     Flux (promptImagemVS). Assim mudar a estética NÃO obriga a re-gerar texto/voz/vídeo:
//     a Vivianne carrega só "outra imagem" e re-corre o Flux, barato.
// Os clichés gastos (chávenas, velas, cadeiras, mulheres à janela) E o tecido/pano (que
// virou o novo cliché) ficam BANIDOS aqui, num só sítio.
// CENA NOVA a partir do TEXTO do post (modelo barato, haiku) — para o "outra imagem"
// INVENTAR uma cena nova em vez de repetir a cena guardada (peças antigas têm cenas de
// tecido lá gravadas). Devolve SÓ a cena (uma frase), sem estilo (isso é promptImagemVS).
export async function gerarCenaImagem(texto: string, apiKey: string, evitar: string[] = []): Promise<string> {
  const sys = `Dás UMA cena de imagem em INGLÊS, numa frase curta (no máximo 14 palavras), para acompanhar um post. UM sujeito concreto, específico e INESPERADO que encarne o SENTIDO do texto pela sensação (não à letra). Procura sítios e objetos fora do óbvio. SEMPRE QUE SERVIR A FRASE, prefere uma cena com MOVIMENTO natural (água a correr ou chuva, vento na erva ou nas árvores, fumo/vapor/névoa a subir, nuvens, luz a tremeluzir, areia ao vento) — para a imagem poder ganhar vida em vídeo; não forces se não servir. EVITA por completo (e nem menciones estas palavras na resposta): interiores domésticos aconchegantes, salas, cozinhas, janelas, cortinas, panos ou tecidos, chávenas, velas, pessoas — escolhe outra coisa qualquer. Devolve SÓ a frase da cena (o sujeito + onde), sem aspas, sem estilo, sem luz.${evitar.length ? ` E diferente destas, que já saíram: ${evitar.slice(-6).map((e) => `"${e}"`).join('; ')}.` : ''}`;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-haiku-4-5', max_tokens: 80, system: sys, messages: [{ role: 'user', content: String(texto ?? '').slice(0, 400) }] }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const t = ((await res.json())?.content?.[0]?.text ?? '').trim();
  return lp(t).replace(/^["'«»]+|["'«»]+$/g, '').trim();
}

// O que vai ao FLUX. DUAS regras aprendidas à força:
//  1) o Flux NÃO tem prompt negativo: escrever "no fabric/no cups" INVOCA tecido e chávenas
//     (lê os nomes como o que deve desenhar). Por isso AQUI é tudo POSITIVO, zero proibições;
//     o que evitar diz-se só ao Claude (que percebe o "não" e escreve outra cena).
//  2) a Vivianne NÃO pediu estilo nenhum — pediu VIDA e VARIEDADE. Por isso NÃO impomos uma
//     estética (nada de "muted/moody/film dos anos 70/desbotado"): só garantimos um sujeito
//     claro, luz bonita, profundidade e que esteja VIVO. A variedade vem da cena (do Claude).
// O REGISTO VISUAL de cada conta — a IDENTIDADE (o que distingue as imagens das contas
// umas das outras), LEVE e ligado à voz/chegada de cada uma, não um estilo rígido. Mantém
// sempre a vida e a variedade; só inclina a luz/o ambiente para o mundo daquela conta.
const REGISTO_CONTA: Record<ContaId, string> = {
  mae: 'honest, grounded and alive, real and lived-in',
  ver: 'lucid and luminous, clear light and air, calm and present, a sense of seeing clearly, stillness',
  vir: 'movement and thresholds, doorways, paths and in-between places, a restless gentle motion, the feeling of returning',
  viver: 'vivid and full of life, present and energetic, fully in the moment',
};

export function promptImagemVS(cena: string, conta: ContaId = 'mae'): string {
  const c = String(cena ?? '').trim().replace(/\s+/g, ' ');
  const reg = REGISTO_CONTA[conta] ?? REGISTO_CONTA.mae;
  return `${c}. A single clear, specific subject, alive and full of atmosphere, with real depth and dimension; ${reg}; the natural light, the time of day and the colours belong to THIS particular scene and moment, and vary freely from piece to piece (not one repeated tone across everything); cinematic, evocative, high quality, with some breathing space around it. Vertical 9:16 portrait.`;
}

const REVELACAO =
`O QUE ISTO É (o mais importante de tudo): isto é uma LEITURA, não um reconhecimento. Pegas numa coisa que a pessoa viveu a vida inteira sem nunca lhe ter dado um nome, e dás-lhe um nome novo, vestido de vida, até a história dela mudar de significado à frente dela. O objetivo não é que ela pense "isto acontece-me" (isso é reconhecimento, qualquer conta o faz). O objetivo é que ela pense "nunca tinha visto isto assim" (isso é revelação, só tu o fazes). Não explicas porque ela faz o que faz: mudas o que aquilo SIGNIFICA.

O QUE NÃO É (e arruína a peça):
- NÃO é descrever um comportamento (contar o que ela faz já ela sabe).
- NÃO é interpretar um episódio (isto aconteceu logo quer dizer aquilo).
- NÃO é explicar com causa (fazes isto por causa daquilo da tua infância).
- NÃO é conselho, lição, nem aviso. Não há "deves", não há moral no fim.
- Se a frase pudesse viver numa conta qualquer de ansiedade, psicologia ou desenvolvimento pessoal, está ERRADA. Tem de ser uma LEITURA que muda o significado, não mais uma frase que descreve a dor.

REGRAS DA VOZ:
- 3.ª pessoa ou universal ("há pessoas que…", "há quem…", "chamam-lhe…", "aprendeu-se cedo que…"), nunca "tu fazes". A pessoa reconhece-se de dentro, não é apontada de fora.
- Descoberta em vez de explicação, com suavidade. Tira a vergonha: nunca é drama, defeito nem diagnóstico.
- PROIBIDO o jargão de terapeuta: trauma, mecanismo, padrão, parentificação, sobrevivência, estratégia, hipervigilância, regulação, ego, consciência, cura, jornada, véu. Linguagem da vida real, sempre.
- POUCOS MOMENTOS, cheios: 4 a 6 momentos NO TOTAL (cada momento = UM slide do reel; NUNCA mais de 6). Um reel curto que se vê todo, não dez migalhas que ninguém tem paciência de ver.
- Cada momento é um BATIMENTO COMPLETO que se aguenta sozinho e faz a revelação avançar. NUNCA partas a MESMA frase em vários momentos seguidos, cada um com um pedacinho cortado por vírgulas (isso é fragmento e cansa): ou juntas o pensamento todo num momento, ou cortas o pensamento. Cada momento pode ter 1 a 9 palavras.
- A 1.ª linha é uma FACA (para o scroll em meio segundo), nunca morna nem descritiva. O ÚLTIMO momento é a viragem que muda o significado.
- Português europeu, sem travessões, sem aspas.

ANTI-SATURAÇÃO (a Vivianne gera isto todos os dias; ao fim de uma semana não pode soar tudo igual). A FORMA tem de variar muito de peça para peça, não só as palavras:
- PROIBIDO abrir com "Talvez". É a muleta mais gasta; não a uses como arranque.
- PROIBIDO repetir o mesmo TIPO de arranque que as peças anteriores (ver a lista de arranques já usados, em baixo). Se a última começou com pergunta, esta não começa com pergunta.
- Faz ROTAR a forma de abrir entre tipos bem diferentes: uma afirmação seca e direta · uma pergunta que vira por dentro · uma imagem ou cena concreta · uma inversão (pôr ao contrário o que se assume) · "há quem…" / "há pessoas que…" · um nome comum que se vira · uma constatação serena. Escolhe a forma que MENOS se parece com as recentes.
- Varia também a ARQUITETURA da peça: umas vezes a faca abre e o resto desdobra; outras a peça constrói até uma viragem só no fim; outras é uma cena seguida do que ela sempre foi. Nunca o mesmo esqueleto dois dias seguidos.`;

// As FORMAS de abrir a faca (descritas pela FORMA, nunca por frase-exemplo, para o modelo
// não copiar). Rotam-se por peça para nenhuma 1.ª linha se parecer com a anterior.
const ABERTURAS_FACA = [
  'uma AFIRMAÇÃO seca e direta, que nomeia o padrão de chofre, sem rodeios',
  'um "há quem…" ou "há pessoas que…", a 3.ª pessoa que deixa quem lê reconhecer-se de dentro',
  'um NOME COMUM virado ("chamam-lhe X…"), para o renomear logo a seguir',
  'uma PERGUNTA que vira por dentro (não retórica nem vazia: uma que abre uma porta)',
  'uma CENA mínima e concreta, pousada sem comentário, que só depois se revela',
  'uma INVERSÃO: pega no que toda a gente assume como bom ou normal e põe-no ao contrário',
  'uma CONSTATAÇÃO serena e inesperada, dita quase em voz baixa',
];

// SÓ a CENA (o estilo e os banimentos são acrescentados no servidor — promptImagemVS).
const lp_img = `IMAGEM (campo "fundoPrompt", em INGLÊS, UMA frase curta): descreve UM sujeito concreto, específico e INESPERADO que encarne o SENTIDO da frase (pela sensação, não à letra; um fundo sem ligação está ERRADO). VARIA muito de dia para dia. SEMPRE QUE SERVIR, prefere uma cena com movimento natural (água, chuva, vento na erva/árvores, fumo/vapor/névoa, luz a tremeluzir) para a imagem ganhar vida em vídeo. EVITA por completo e nem menciones: interiores domésticos aconchegantes, salas, cozinhas, janelas, cortinas, panos/tecidos, chávenas, velas, pessoas — procura outra coisa qualquer, fora do óbvio. Escreve SÓ a cena, em poucas palavras, SEM estilo, SEM luz, SEM câmara (isso é acrescentado automaticamente).`;

// A MANHÃ (formato 'dissolucao'): NÃO um reel da revelação, mas UM frame, UMA frase —
// o sinal de um véu a dissolver-se. O lado do SOLTAR: nu, sereno, leve. Tratado à parte.
async function gerarDissolucao(veu: VeuNome, apiKey: string, evitar: string[], conta: ContaId): Promise<PecaVS> {
  const k = SABER[veu];
  if (!k) throw new Error(`sem SABER para o véu ${veu}`);
  const f = FORMATOS.dissolucao;
  const ancora = ancoraContaManha(conta);
  // Anti-saturação ESTRUTURAL: a manhã sai todos os dias, por isso a FORMA tem de
  // rodar. Escolhe-se uma estrutura por um índice determinístico (quantos sinais já
  // foram gerados), para dias seguidos caírem em moldes diferentes (não só palavras
  // trocadas). Cada estrutura é descrita pela SUA FORMA, nunca por uma frase-exemplo.
  const ESTRUTURAS = [
    'PERMISSÃO DIRETA: uma licença serena para pousar o peso, na forma "podes…" ou "não tens de…". Curta, calorosa, sem justificar.',
    'CONSTATAÇÃO SOBRE QUEM SE É: nomeia, com calma, quem a pessoa é por baixo daquilo que aprendeu a fazer ou a parecer. Separa o que ela faz de quem ela é.',
    'A IMAGEM DO QUOTIDIANO: parte de um objeto ou gesto pequeno e concreto da manhã (a luz, a chávena, o silêncio da casa) e deixa cair, ao lado, a verdade que liberta. A imagem carrega o sentido.',
    'A PEQUENA INVERSÃO: pega numa coisa que se assume como esforço ou virtude e vira-a do avesso com suavidade, mostrando que o oposto é que liberta. Uma viragem só, clara.',
    'A AFIRMAÇÃO SECA: uma única frase declarativa, firme e curta, que afirma a verdade que solta sem rodeios nem amparo. Acaba e fica.',
    'A PERGUNTA QUE ABRE: uma pergunta leve que faz a pessoa olhar para o que nunca questionou. Não retórica vazia: uma pergunta que dá ar, não aperto.',
  ];
  const estrutura = ESTRUTURAS[((evitar.length % ESTRUTURAS.length) + ESTRUTURAS.length) % ESTRUTURAS.length];
  const sys =
`Escreves o SINAL DA MANHÃ da Vivianne dos Santos (Método VS · Ver e Soltar): UM frame, UMA frase, nada mais. É o lado do SOLTAR, uma verdade pequena que se pousa ao acordar. Sereno e nu, não um diagnóstico.

A MATÉRIA (só para TI; nunca a nomeies nem a copies):
${f.materia(k)}
${ancora ? `\n${ancora}\n` : ''}
A ESTRUTURA DE HOJE (segue ESTA forma, é o que evita que as manhãs soem todas iguais): ${estrutura}

REGRAS:
- UMA frase só (1 a 2 linhas curtas, no máximo). Sem listas, sem sequência, sem "chamam-lhe".
- CLARA, não enigmática: a pessoa entende à PRIMEIRA leitura. Concreta, da vida real, explica-se sozinha. PROIBIDOS os jogos de palavras vagos e abstratos que ninguém percebe (oposições simétricas espertas, frases que parecem profundas mas não dizem nada).
- Uma verdade pequena que liberta: o peso que se pode pousar, a permissão de não merecer o cuidado, quem se é por baixo do que se aprendeu a ser.
- 3.ª pessoa ou universal, serena, sem certeza fria.
- PROIBIDO abrir com "Talvez" (gastou-se até ao osso). E NUNCA uses "talvez" duas vezes na mesma frase. Segue a estrutura de hoje, não a muleta do "talvez".
- PROIBIDO jargão de terapeuta (trauma, sobrevivência, padrão, mecanismo, véu, cura). Linguagem da vida.
- Português europeu, sem travessões, sem aspas.
${evitar.length ? `\nJÁ FORAM USADAS estas (NÃO repitas a frase nem o mesmo arranque/molde de nenhuma delas; faz diferente das mais recentes): ${evitar.slice(-40).map((e) => `"${e}"`).join('; ')}.` : ''}

${lp_img}

Devolve APENAS JSON válido: {"frase":"a frase única","destaque":["1 a 2 palavras a realçar"],"conceito":"selo curto","fundoPrompt":"a CENA da imagem em inglês, só a cena","legenda":"legenda curta do Instagram na mesma voz serena, termina com um convite leve"}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 500, system: sys, messages: [{ role: 'user', content: `O sinal da manhã, véu ${veu}.` }] }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const txt = ((await res.json())?.content?.[0]?.text ?? '').trim();
  let o: { frase?: unknown; destaque?: unknown; conceito?: unknown; fundoPrompt?: unknown; legenda?: unknown } = {};
  try { const m = txt.match(/\{[\s\S]*\}/); o = JSON.parse(m ? m[0] : txt); } catch { /* fallback */ }
  const frase = lp(o.frase);
  if (!frase) throw new Error('sem frase da manhã');
  return {
    veu, formato: 'dissolucao',
    momentos: [frase],
    destaque: Array.isArray(o.destaque) ? o.destaque.map(lp).filter(Boolean).slice(0, 2) : [],
    fundoPrompt: lp(o.fundoPrompt), legenda: lp(o.legenda),
    hashtags: hashtagsMetodo(veu), conceito: lp(o.conceito),
  };
}

export async function gerarPecaVS(veu: VeuNome, formato: FormatoId, apiKey: string, evitar: string[] = [], conta: ContaId = 'mae'): Promise<PecaVS> {
  const k = SABER[veu];
  if (!k) throw new Error(`sem SABER para o véu ${veu}`);
  if (formato === 'dissolucao') return gerarDissolucao(veu, apiKey, evitar, conta);
  const f = FORMATOS[formato];
  if (!f) throw new Error(`formato desconhecido: ${formato}`);
  const ancora = ancoraConta(conta);
  // A FACA (1.ª linha) é o que mais tende a virar fórmula. Rotamos a FORMA de abrir de
  // peça para peça, determinístico (pelo nº de peças já feitas), para nunca soarem iguais
  // — o mesmo mecanismo que funciona na manhã. NÃO muda a voz; só a forma do gancho.
  const abertura = ABERTURAS_FACA[((evitar.length % ABERTURAS_FACA.length) + ABERTURAS_FACA.length) % ABERTURAS_FACA.length];

  const sys =
`Escreves UMA peça (reel 9:16) da Vivianne dos Santos, criadora do Método VS (Ver e Soltar). A voz é a da REVELAÇÃO. O formato de hoje é "${f.nome}".

O ÂNGULO de hoje (segue-o): ${f.angulo}

A MATÉRIA (só para TI perceberes o padrão; NUNCA a nomeies nem a copies no texto):
${f.materia(k)}
${ancora ? `\n${ancora}\n` : ''}
${REVELACAO}

A ABERTURA DE HOJE (a 1.ª linha, a faca, abre ASSIM — é o que impede que as primeiras linhas se pareçam todas): ${abertura}. As linhas seguintes seguem a voz, sem repetir a forma da faca.

IMAGEM (campo "fundoPrompt", em INGLÊS, UMA frase curta): descreve UM sujeito concreto, específico e INESPERADO que encarne o SENTIDO da 1.ª linha (a faca), pela sensação (um fundo sem ligação está ERRADO). VARIA muito de peça para peça. SEMPRE QUE SERVIR, prefere uma cena com movimento natural (água, chuva, vento na erva/árvores, fumo/vapor/névoa, luz a tremeluzir) para a imagem ganhar vida em vídeo. EVITA por completo e nem menciones: interiores domésticos aconchegantes, salas, cozinhas, janelas, cortinas, panos/tecidos, chávenas, velas, pessoas — procura outra coisa qualquer, fora do óbvio. Escreve SÓ a cena, em poucas palavras, SEM estilo, SEM luz, SEM câmara (isso é acrescentado automaticamente).
${evitar.length ? `\nNÃO repitas estes arranques já usados: ${evitar.slice(-40).map((e) => `"${e}"`).join('; ')}.` : ''}

O array "momentos" tem 4 a 6 entradas, NUNCA mais (a 1.ª é a faca, a última é a viragem).
Devolve APENAS JSON válido, sem texto à volta: {"momentos":["a faca","…","a viragem"],"destaque":["1 a 3 palavras-chave a realçar"],"conceito":"selo curto, 1 a 3 palavras","fundoPrompt":"a CENA da imagem em inglês, só a cena","legenda":"legenda do Instagram em parágrafos curtos separados por linha em branco, na mesma voz da revelação, sem explicar nem usar jargão; termina com um convite leve"}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 900, system: sys, messages: [{ role: 'user', content: `Formato "${f.nome}", véu ${veu}.` }] }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const txt = ((await res.json())?.content?.[0]?.text ?? '').trim();
  let o: { momentos?: unknown; destaque?: unknown; conceito?: unknown; fundoPrompt?: unknown; legenda?: unknown } = {};
  try { const m = txt.match(/\{[\s\S]*\}/); o = JSON.parse(m ? m[0] : txt); } catch { /* fallback */ }

  const momentos = Array.isArray(o.momentos) ? o.momentos.map(lp).filter(Boolean) : [];
  if (!momentos.length) throw new Error('sem momentos da revelação');
  const destaque = Array.isArray(o.destaque) ? o.destaque.map(lp).filter(Boolean).slice(0, 3) : [];
  return {
    veu, formato,
    momentos, destaque,
    fundoPrompt: lp(o.fundoPrompt),
    legenda: lp(o.legenda),
    hashtags: hashtagsMetodo(veu),
    conceito: lp(o.conceito),
  };
}
