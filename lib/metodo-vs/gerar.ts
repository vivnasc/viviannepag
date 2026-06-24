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
`IDENTIDADE VISUAL DO MÉTODO VS (obrigatória em TODA a imagem; é a MARCA, é o que a distingue de stock genérico): luz natural suave e difusa, muitas vezes a atravessar cortinas finas, tecido leve ou um véu; paleta quente e neutra (linho, aveia, creme, areia, um toque de ouro velho); espaços íntimos do dia-a-dia (casa, quarto, mesa, janela, chão), vividos e imperfeitos, com história; a sensação de algo a ser suavemente desvelado; grão de filme subtil e calor analógico, com ALMA. NUNCA foto de stock limpa, polida e sem vida. É sempre este mundo, reconhecível.`;

const REVELACAO =
`O QUE ISTO É (o mais importante): revelas um padrão humano invisível. NÃO descreves comportamentos ("releste a mensagem"), NÃO interpretas um episódio, NÃO explicas ("é uma estratégia de sobrevivência"). Dás um NOME NOVO a algo que a pessoa viveu a vida inteira, vestido de vida, até a história mudar de significado. A pessoa pensa "nunca tinha visto isto assim", nunca "isto acontece-me".

REGRAS:
- 3.ª PESSOA ("há pessoas que…", "chamam-lhe…", "chamaram-te…"), NUNCA "tu fazes". O reconhecimento nasce de dentro de quem lê.
- DESCOBERTA em vez de explicação, com suavidade. VARIA os arranques: NÃO comeces sempre por "Talvez" nem repitas a mesma fórmula; abre de formas diferentes (uma afirmação serena, uma imagem, uma pergunta, "há quem…"). "Talvez" no máximo de longe a longe.
- Tira a vergonha: nunca é drama nem defeito.
- PROIBIDO o jargão de terapeuta: trauma, mecanismo, padrão, parentificação, sobrevivência, estratégia, hipervigilância, regulação, ego, consciência, cura, jornada, véu. Linguagem da vida, sempre.
- Ritmo de RESPIRAÇÃO: linhas de 1 a 8 palavras. 6 a 10 linhas. A 1.ª linha agarra (o scroll dura meio segundo).
- Português europeu, sem travessões, sem aspas.
- TESTE: se a peça pudesse estar numa conta qualquer de ansiedade, psicologia ou desenvolvimento, está ERRADA.`;

const lp_img = `A imagem ENCARNA a frase (a cena concreta que ela evoca: o sítio, o objeto, o momento), nunca um objeto bonito ao acaso. ${METODO_IDENTIDADE} PROIBIDO: velas, chamas, halos, auréolas, santos, sagrado, escuro ou soturno, pessoas a posar, rostos, texto, ar de stock. Termina com: intimate film-grain fine-art photography, soft natural daylight through sheer fabric, warm neutral palette, analog warmth, vertical 9:16.`;

// A MANHÃ (formato 'dissolucao'): NÃO um reel da revelação, mas UM frame, UMA frase —
// o sinal de um véu a dissolver-se. O lado do SOLTAR: nu, sereno, leve. Tratado à parte.
async function gerarDissolucao(veu: VeuNome, apiKey: string, evitar: string[], conta: ContaId): Promise<PecaVS> {
  const k = SABER[veu];
  if (!k) throw new Error(`sem SABER para o véu ${veu}`);
  const f = FORMATOS.dissolucao;
  const ancora = ancoraContaManha(conta);
  const sys =
`Escreves o SINAL DA MANHÃ da Vivianne dos Santos (Método VS · Ver e Soltar): UM frame, UMA frase, nada mais. É o lado do SOLTAR — um véu a dissolver-se ao acordar. Sereno e nu, não um diagnóstico.

A MATÉRIA (só para TI; nunca a nomeies nem a copies):
${f.materia(k)}
${ancora ? `\n${ancora}\n` : ''}
REGRAS:
- UMA frase só (1 a 2 linhas curtas, no máximo). Sem "chamam-lhe", sem listas, sem sequência.
- CLARA, não enigmática: a pessoa entende à primeira leitura. Concreta, da vida real. Se uma amiga perguntasse "isso quer dizer o quê?", a frase já se explicava sozinha. NADA de jogos de palavras vagos do tipo "estás de fora ou ainda não entraste", que ninguém percebe.
- Uma verdade pequena que liberta: o peso que se pode pousar, a permissão de não merecer o cuidado, quem se é por baixo do que se aprendeu a ser.
- 3.ª pessoa ou universal, serena, sem certeza fria.
- VARIA o arranque, é o mais importante: NÃO comeces por "Talvez" (gastou-se) e NUNCA uses "talvez" duas vezes na mesma frase. Cada dia abre de uma forma diferente: umas vezes uma afirmação calma, outras uma permissão direta ("podes…"), outras uma constatação serena, outras uma imagem do dia-a-dia, outras uma pergunta leve. "Talvez" só de longe a longe, no máximo.
- PROIBIDO jargão de terapeuta (trauma, sobrevivência, padrão, mecanismo, véu, cura). Linguagem da vida.
- Português europeu, sem travessões, sem aspas.
${evitar.length ? `\nNÃO repitas estas já usadas: ${evitar.slice(-10).map((e) => `"${e}"`).join('; ')}.` : ''}

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

IMAGEM (campo "fundoPrompt", em INGLÊS): a imagem TEM de ENCARNAR a frase desta peça, nunca um objeto bonito ao acaso. Lê a 1.ª linha (a faca) e escolhe a CENA concreta que ela evoca: o sítio, o objeto, o momento de vida de hoje que vive por baixo da frase. REGRA DURA (anti-desligado): é PROIBIDO um fundo bonito que NÃO tenha a ver com a frase. Ex.: frase sobre não saber parar -> uma chávena de café a arrefecer numa secretária cheia ao fim do dia; sobre adiar a vida -> uma porta entreaberta, um limiar; sobre carregar tudo -> uma mesa por arrumar depois de todos saírem. Concreto e sensorial, SEM pessoas, SEM rostos. ${METODO_IDENTIDADE} PROIBIDO: velas, chamas, halos, auréolas, santos, sagrado, escuro ou soturno, texto, ar de stock. Termina com: intimate film-grain fine-art photography, soft natural daylight through sheer fabric, warm neutral palette, analog warmth, vertical 9:16.
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
