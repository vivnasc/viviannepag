// Método VS · MÃE autoridade — gera UM dos 8 formatos a partir do SABER do véu.
// Campos NOMEADOS -> vários slides garantidos (a lição do banda/heroi). Devolve
// beats (texto por slide) + envio. SÓ texto; a imagem gera-se depois (par com o
// texto, na rota /imagens). NADA hardcoded: tudo sai do SABER + a IA, no tom dela.

import { VeuNome } from './contas';
import { SABER, type SaberVeu } from './saber';
import { REFERENCIAS } from './referencias';
import { limparTravessoes } from '@/lib/texto';
import { FORMATOS_AUTORIDADE, type FormatoAutoridadeId } from './formatos-autoridade';

export interface StoryboardAut { beats: { texto: string; imagem: string }[]; envio: string }

const lp = (s: unknown) => limparTravessoes(String(s ?? '').replace(/^["«»]+|["«»]+$/g, '').trim());
const lista = (arr?: string[], n = 6) => (arr ?? []).slice(0, n).map((x) => `"${x}"`).join(' · ');

// A VOZ da mãe (autoridade) + as regras duras de sempre. A mãe nomeia o padrão
// INTEIRO, com clareza serena (a vista de cima), na linguagem das dores da vida —
// NÃO dá aula (isso é a veu.a.veu), revela a dor e aponta a direção.
const REGRAS =
  `Voz: és a MÃE do Método VS — a autora que reconheceu primeiro em si o padrão e o nomeia com clareza serena, a vista de cima. NÃO inventes biografia, marcos nem clientes. NÃO é aula nem didática: revela a DOR e aponta uma DIREÇÃO, na linguagem da vida.\n` +
  `CONCRETO OU NADA: cada linha nomeia um momento observável do dia a dia de HOJE (2026: telemóvel, mensagens por ler, notificações, apps, a casa de agora), tão específico que a mulher pensa "isto sou eu" em 1 segundo. Se servisse para qualquer pessoa ou soasse a coach/horóscopo, está errado.\n` +
  `PROIBIDO no texto: jargão e abstrações (padrão, presença, consciência, lealdade, vazio, alma, jornada, energia, cura, transformação, essência, propósito, véu, mecanismo) e nomear o véu. SEM travessões. SEM aspas. SEM hashtags. SEM metáforas. Português europeu. Cada frase faz sentido SOZINHA (sem "isto"/"aquilo"/"ela" ambíguos).\n` +
  `CAPA (1.º slide): uma FACA — UMA frase curta (máx. 12 palavras), a mais afiada, o murro que para o scroll. Nunca um parágrafo nem arranque morno.\n` +
  `BREVIDADE: cada slide é UMA frase curta, UMA ideia; o reel revela uma linha de cada vez, nunca um bloco de texto.\n` +
  `ENVIO/CTA obrigatório e FORTE (marcar uma pessoa concreta / guardar / partilhar a quem precisa), nunca morno.`;

// a estrutura + o JSON de cada formato (a matéria-prima vem do SABER do véu).
function spec(formato: FormatoAutoridadeId, k: SaberVeu): { estrutura: string; json: string; montar: (o: Rec) => string[] } {
  switch (formato) {
    case 'veuDe':
      return {
        estrutura: `Formato "O Véu de…" (identificação rápida, alcance). Dá um NOME ao padrão e lista os sinais. Matéria-prima — nomes possíveis: ${lista(k.subtipos)}; sinais (comportamentos): ${lista(k.comportamentos, 8)}. Escolhe/cria UM nome forte e 3 a 4 sinais concretos e NOVOS (não copies à letra).`,
        json: `{"capa":"O Véu da … (um nome forte, curto)","sinais":["sinal concreto 1","sinal 2","sinal 3"],"envio":"CTA forte"}`,
        montar: (o) => [str(o.capa), ...(arr(o.sinais))],
      };
    case 'mecanismo':
      return {
        estrutura: `Formato "O Mecanismo Invisível": comportamento observado → explicação inesperada → o que está mesmo a acontecer → consequência. Matéria — comportamentos: ${lista(k.comportamentos, 8)}; o que está por baixo: ${lista(k.mecanismos)}. Traduz o mecanismo em linguagem da vida (nunca teoria).`,
        json: `{"comportamento":"o que ela faz, concreto","inesperado":"a explicação que não esperava","mecanismo":"o que está mesmo a acontecer, em linguagem da vida","consequencia":"o que isso lhe custa","envio":"CTA forte"}`,
        montar: (o) => [str(o.comportamento), str(o.inesperado), str(o.mecanismo), str(o.consequencia)],
      };
    case 'origem':
      return {
        estrutura: `Formato "A Origem": comportamento atual → função protetora antiga (de onde veio, sem culpa) → porque continua hoje (já não é preciso). Matéria — comportamentos: ${lista(k.comportamentos, 6)}; origens: ${lista(k.origens)}. Honra a origem (foi como sobreviveste), não a julgues.`,
        json: `{"atual":"o que fazes hoje, concreto","origem":"de onde isso veio (a função protetora antiga, sem culpa)","hoje":"porque continuas, mesmo já não sendo preciso","envio":"CTA forte"}`,
        montar: (o) => [str(o.atual), str(o.origem), str(o.hoje)],
      };
    case 'erro':
      return {
        estrutura: `Formato "O Erro de Interpretação": pensas que é X → na verdade é Y → a explicação que liberta. Matéria — crenças (pensa→verdade): ${lista(k.crencas.map((c) => `${c.pensa} -> ${c.verdade}`), 5)}. Escolhe UMA e escreve-a nova, concreta.`,
        json: `{"pensa":"pensas que é X (a leitura errada)","verdade":"na verdade é Y","explica":"a explicação concreta que liberta","envio":"CTA forte"}`,
        montar: (o) => [str(o.pensa), str(o.verdade), str(o.explica)],
      };
    case 'custo':
      return {
        estrutura: `Formato "O Custo Escondido": benefício aparente → a troca invisível → a ilusão → o preço real que pagas → a verdade que vira. Matéria — custos: ${lista(k.custos)}; cenas: ${lista(k.cenas, 4)}. Concreto e sentido, nunca moral.`,
        json: `{"aparente":"o benefício aparente (o que parece bom)","troca":"o que dás em troca, sem ver","ilusao":"a ilusão que te mantém aí","custo":"o preço real, concreto","verdade":"a verdade que vira o jogo","envio":"CTA forte"}`,
        montar: (o) => [str(o.aparente), str(o.troca), str(o.ilusao), str(o.custo), str(o.verdade)],
      };
    case 'mito':
      return {
        estrutura: `Formato "Mito vs Verdade" (autoridade pura): derruba a crença. Mito (o que toda a gente repete) vs Verdade (o que tu sabes). Matéria — crenças: ${lista(k.crencas.map((c) => `${c.pensa} -> ${c.verdade}`), 5)}. Escolhe UMA; a verdade tem de cortar.`,
        json: `{"mito":"Mito: a crença comum","verdade":"Verdade: o que realmente acontece","porque":"porquê, em linguagem da vida","envio":"CTA forte"}`,
        montar: (o) => [`Mito: ${str(o.mito).replace(/^mito:\s*/i, '')}`, `Verdade: ${str(o.verdade).replace(/^verdade:\s*/i, '')}`, str(o.porque)],
      };
    case 'mapa':
      return {
        estrutura: `Formato "O Mapa do Véu" (o diagnóstico, o mais forte): "Quando estás neste padrão: pensas… sentes… fazes… pagas…" + a saída. Matéria — mapa: pensa "${k.mapa.pensa}", sente "${k.mapa.sente}", faz "${k.mapa.faz}", paga "${k.mapa.paga}". Reescreve cada um concreto e novo; a saída é UM gesto possível, não um sermão.`,
        json: `{"capa":"a faca que abre (máx 12 palavras)","pensa":"o que pensas","sente":"o que sentes (no corpo)","faz":"o que fazes","paga":"o que isso te custa","saida":"a direção: um gesto possível","envio":"CTA forte"}`,
        montar: (o) => [str(o.capa), `Pensas: ${str(o.pensa)}`, `Sentes: ${str(o.sente)}`, `Fazes: ${str(o.faz)}`, `Pagas: ${str(o.paga)}`, str(o.saida)],
      };
    case 'cena':
    default:
      return {
        estrutura: `Formato "Cena do dia-a-dia": uma cena concreta → o comportamento → a leitura (o que essa cena revela), leve. Matéria — cenas: ${lista(k.cenas)}; comportamentos: ${lista(k.comportamentos, 5)}. A cena entra antes da ideia (faz VER antes de pensar).`,
        json: `{"cena":"uma cena concreta que se VÊ (a faca)","comportamento":"o gesto que ela faz","leitura":"o que isto revela, leve","envio":"CTA forte"}`,
        montar: (o) => [str(o.cena), str(o.comportamento), str(o.leitura)],
      };
  }
}

type Rec = Record<string, unknown>;
const str = (v: unknown) => lp(v);
const arr = (v: unknown) => (Array.isArray(v) ? v.map((x) => lp(x)).filter(Boolean) : []);

// Gera UM formato de autoridade para um véu. Lança se o véu ainda não tem SABER
// (a Vivianne preenche os véus um a um) — a rota reporta isso.
export async function gerarAutoridade(formato: FormatoAutoridadeId, veu: VeuNome, apiKey: string, evitar: string[] = []): Promise<StoryboardAut> {
  const k = SABER[veu];
  if (!k) throw new Error(`sem SABER para o véu ${veu} (preenche lib/metodo/saber.ts primeiro)`);
  const f = FORMATOS_AUTORIDADE[formato];
  const s = spec(formato, k);
  const ref = REFERENCIAS[veu];

  const sys =
    `Escreves o texto de um REEL curto (9:16) da conta-mãe do Método VS — o formato "${f.nome}". ` +
    `O padrão de fundo (NUNCA o nomeies no texto): ${k.essencia}\n\n` +
    `${s.estrutura}\n\n${REGRAS}\n` +
    (ref?.conceitos?.length ? `\nCAMPO DE ESTUDO (só para TU pensares mais fundo, NUNCA citar no texto): ${ref.conceitos.slice(0, 8).join(' · ')}.\n` : '') +
    (evitar.length ? `\nNÃO repitas estes ângulos/frases já usados: ${evitar.slice(-10).map((e) => `"${e}"`).join('; ')}.\n` : '') +
    `\nDevolve SÓ JSON válido, sem texto à volta: ${s.json}. Preenche TODOS os campos (é isto que faz os vários slides); o "envio" é OBRIGATÓRIO e nunca vazio.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 900, system: sys, messages: [{ role: 'user', content: `${f.nome} para o véu ${veu}.` }] }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}`);
  const txt = ((await res.json())?.content?.[0]?.text ?? '').trim();
  let o: Rec = {};
  try { const m = txt.match(/\{[\s\S]*\}/); o = JSON.parse(m ? m[0] : txt); } catch { /* fallback */ }

  const textos = s.montar(o).filter(Boolean);
  if (!textos.length) throw new Error('sem storyboard de autoridade');
  const beats = textos.map((texto) => ({ texto, imagem: '' }));
  return { beats, envio: lp(o.envio) };
}
