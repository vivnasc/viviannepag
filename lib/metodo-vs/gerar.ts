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
}

const lp = (s: unknown) => limparTravessoes(String(s ?? '').replace(/^["«»]+|["«»]+$/g, '').trim());

// A IDENTIDADE VISUAL do Método VS — é isto que torna as imagens DELA e não stock.
// Usa-se em TODAS as imagens (reel e manhã), por cima da conexão com a frase.
const METODO_IDENTIDADE =
`IDENTIDADE VISUAL DO MÉTODO VS (uma assinatura FIXA, repetível, obrigatória em TODA a imagem; é a MARCA. Duas peças sem relação têm de parecer o mesmo mundo, como páginas do mesmo lookbook. NÃO é "fine-art photography" genérico):

LUZ (sempre a mesma): UMA só fonte de luz natural, lateral e baixa, a entrar por uma janela e a atravessar um tecido fino (cortina de linho, voile, um pano leve), criando um feixe suave e sombras longas e macias. Sem flash, sem luz de estúdio, sem luz de topo. A divisão fica mais escura nas bordas, a luz pousa num só sítio (o objeto da frase).

PALETA (apertada, sempre estas): linho, aveia, creme, areia, terracota desbotado, castanho-rúcula, um toque de ouro velho. Tons quentes e poeirentos, dessaturados, nunca cores berrantes nem frias nem digitais. Branco nunca puro: sempre creme.

ESPAÇO e OBJETOS (sempre o mesmo universo doméstico): interiores íntimos e reais de uma casa vivida (mesa de madeira gasta, peitoril de janela, cama por fazer, cadeira de palha, chão de soalho, loiça de barro, pano de linho amarrotado, copo de água, livro pousado, chávena a arrefecer, fruta numa taça, cortina a oscilar). Imperfeito, com pó e marcas, com história. Composição respirada, muito espaço vazio em volta de um único objeto.

LENTE e GRÃO (sempre o mesmo tratamento): profundidade de campo curta, foco suave, grão de filme analógico fino e quente, leve halação na luz, como uma fotografia de filme dos anos 70. Nunca nítido e limpo como digital.

É SEMPRE este mundo, reconhecível ao primeiro olhar. NUNCA stock limpo e polido.`;

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
- Ritmo de RESPIRAÇÃO: linhas de 1 a 8 palavras. 6 a 10 linhas. A 1.ª linha é uma FACA (para o scroll em meio segundo) e nunca é morna nem descritiva.
- Português europeu, sem travessões, sem aspas.

ANTI-SATURAÇÃO (a Vivianne gera isto todos os dias; ao fim de uma semana não pode soar tudo igual). A FORMA tem de variar muito de peça para peça, não só as palavras:
- PROIBIDO abrir com "Talvez". É a muleta mais gasta; não a uses como arranque.
- PROIBIDO repetir o mesmo TIPO de arranque que as peças anteriores (ver a lista de arranques já usados, em baixo). Se a última começou com pergunta, esta não começa com pergunta.
- Faz ROTAR a forma de abrir entre tipos bem diferentes: uma afirmação seca e direta · uma pergunta que vira por dentro · uma imagem ou cena concreta · uma inversão (pôr ao contrário o que se assume) · "há quem…" / "há pessoas que…" · um nome comum que se vira · uma constatação serena. Escolhe a forma que MENOS se parece com as recentes.
- Varia também a ARQUITETURA da peça: umas vezes a faca abre e o resto desdobra; outras a peça constrói até uma viragem só no fim; outras é uma cena seguida do que ela sempre foi. Nunca o mesmo esqueleto dois dias seguidos.`;

const lp_img = `A imagem ENCARNA a frase desta peça: lê a frase, encontra o único objeto ou canto da casa que vive por baixo dela, e é ESSE que a luz da manhã ilumina. Nunca um objeto bonito ao acaso (regra dura anti-desligado: um fundo bonito sem ligação à frase está ERRADO). É sempre cedo, luz de manhã a entrar pela janela. ${METODO_IDENTIDADE} PROIBIDO: velas, chamas, halos, auréolas, santos, sagrado, escuro ou soturno, pessoas a posar, rostos, texto, ar de stock. Termina SEMPRE com este sufixo, exatamente: intimate analog film-grain photography, single soft low side daylight through sheer linen, warm dusty neutral palette of linen oat cream sand faded terracotta, shallow depth of field, 1970s film look with fine warm grain, vertical 9:16.`;

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
${evitar.length ? `\nJÁ FORAM USADAS estas (NÃO repitas a frase nem o mesmo arranque/molde de nenhuma delas; faz diferente das mais recentes): ${evitar.slice(-10).map((e) => `"${e}"`).join('; ')}.` : ''}

IMAGEM (campo "fundoPrompt", em INGLÊS, luz de manhã): ${lp_img}

Devolve APENAS JSON válido: {"frase":"a frase única","destaque":["1 a 2 palavras a realçar"],"conceito":"selo curto","fundoPrompt":"prompt da imagem em inglês","legenda":"legenda curta do Instagram na mesma voz serena, termina com um convite leve"}`;

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

  const sys =
`Escreves UMA peça (reel 9:16) da Vivianne dos Santos, criadora do Método VS (Ver e Soltar). A voz é a da REVELAÇÃO. O formato de hoje é "${f.nome}".

O ÂNGULO de hoje (segue-o): ${f.angulo}

A MATÉRIA (só para TI perceberes o padrão; NUNCA a nomeies nem a copies no texto):
${f.materia(k)}
${ancora ? `\n${ancora}\n` : ''}
${REVELACAO}

IMAGEM (campo "fundoPrompt", em INGLÊS): a imagem TEM de ENCARNAR a frase desta peça, nunca um objeto bonito ao acaso. Lê a 1.ª linha (a faca), encontra a CENA concreta que vive por baixo dela (o canto da casa, o objeto pousado, o momento de vida) e descreve ESSE único objeto banhado pela luz da assinatura. REGRA DURA (anti-desligado): um fundo bonito que NÃO tenha a ver com a frase está ERRADO. Traduz a emoção da frase num objeto físico do quotidiano (algo deixado a meio, algo que arrefece, um limiar, uma mesa por arrumar, uma janela): a imagem fala da frase sem a ilustrar à letra. Concreto e sensorial, UM só foco, muito espaço em volta, SEM pessoas, SEM rostos. ${METODO_IDENTIDADE} PROIBIDO: velas, chamas, halos, auréolas, santos, sagrado, escuro ou soturno, texto, ar de stock. Termina SEMPRE com este sufixo, exatamente: intimate analog film-grain photography, single soft low side daylight through sheer linen, warm dusty neutral palette of linen oat cream sand faded terracotta, shallow depth of field, 1970s film look with fine warm grain, vertical 9:16.
${evitar.length ? `\nNÃO repitas estes arranques já usados: ${evitar.slice(-10).map((e) => `"${e}"`).join('; ')}.` : ''}

Devolve APENAS JSON válido, sem texto à volta: {"momentos":["linha 1 (a faca)","linha 2","…"],"destaque":["1 a 3 palavras-chave a realçar"],"conceito":"selo curto, 1 a 3 palavras","fundoPrompt":"prompt da imagem em inglês","legenda":"legenda do Instagram em parágrafos curtos separados por linha em branco, na mesma voz da revelação, sem explicar nem usar jargão; termina com um convite leve"}`;

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
