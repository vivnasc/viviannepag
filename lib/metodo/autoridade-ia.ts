// Método VS · MÃE autoridade — gerador LEVE (à maneira do Soulab: pouca instrução,
// frases CURTAS, "momentos" que desdobram UMA ideia). Cada formato dá um ARCO; o
// modelo devolve 3-6 linhas curtas + o envio. NADA hardcoded: sai do SABER do véu.
//
// A lição (jun 2026): o gerador pesado (essência + 6 regras + campos nomeados num só
// pedido) afogava o modelo e saía texto denso/partido. Aqui é mínimo e legível.

import { VeuNome } from './contas';
import { SABER, type SaberVeu } from './saber';
import { limparTravessoes } from '@/lib/texto';
import { FORMATOS_AUTORIDADE, type FormatoAutoridadeId } from './formatos-autoridade';

export interface StoryboardAut { beats: { texto: string; imagem: string }[]; envio: string }

const lp = (s: unknown) => limparTravessoes(String(s ?? '').replace(/^["«»]+|["«»]+$/g, '').trim());
const alguns = (arr?: string[], n = 5) => (arr ?? []).slice(0, n).map((x) => `· ${x}`).join('\n');

// o ARCO de cada formato (curto) + a matéria-prima (poucos itens do SABER do véu).
function arcoEmateria(formato: FormatoAutoridadeId, k: SaberVeu): string {
  switch (formato) {
    case 'veuDe':
      return `ARCO (O Véu de…): a 1.ª linha dá um NOME ao padrão ("O Véu da Que Prevê Tudo"); depois 3 sinais concretos; fecha com uma linha que pergunta se é o dela.\nNOMES possíveis:\n${alguns(k.subtipos, 4)}\nSINAIS possíveis:\n${alguns(k.comportamentos, 6)}`;
    case 'mecanismo':
      return `ARCO (O Mecanismo Invisível): linha 1 = uma pergunta sobre um comportamento ("Porque verificas o telemóvel sem motivo?"); linha 2-3 = o que está MESMO a acontecer, em linguagem da vida; última = o que isso custa.\nCOMPORTAMENTOS:\n${alguns(k.comportamentos, 6)}\nO QUE ESTÁ POR BAIXO (traduz para a vida, nunca teoria):\n${alguns(k.mecanismos, 4)}`;
    case 'origem':
      return `ARCO (A Origem): linha 1 = o que fazes hoje; linha 2-3 = de onde veio (foi proteção antiga, sem culpa); última = já não é preciso, mas continua.\nHOJE:\n${alguns(k.comportamentos, 5)}\nORIGEM:\n${alguns(k.origens, 4)}`;
    case 'erro':
      return `ARCO (O Erro de Interpretação): linha 1 = "Pensas que é X"; linha 2 = "Não é. É Y"; última = a explicação curta que liberta.\nCRENÇAS (pensa -> verdade):\n${alguns(k.crencas.map((c) => `${c.pensa}  ->  ${c.verdade}`), 5)}`;
    case 'custo':
      return `ARCO (O Custo Escondido): linha 1 = o que parece bom; linhas do meio = a troca invisível e o preço real (concreto); última = a verdade que vira.\nCUSTOS:\n${alguns(k.custos, 5)}\nCENAS:\n${alguns(k.cenas, 3)}`;
    case 'mito':
      return `ARCO (Mito vs Verdade): linha 1 = "Mito: …" (a crença comum); linha 2 = "Verdade: …" (o que corta); última = porquê, em linguagem da vida.\nCRENÇAS (mito -> verdade):\n${alguns(k.crencas.map((c) => `${c.pensa}  ->  ${c.verdade}`), 5)}`;
    case 'mapa':
      return `ARCO (O Mapa do Véu): linha 1 = uma faca que abre; depois quatro linhas "Pensas: …", "Sentes: …", "Fazes: …", "Pagas: …"; última = a saída (um gesto possível, não um sermão).\nMAPA deste véu (reescreve concreto e novo):\n· Pensas: ${k.mapa.pensa}\n· Sentes: ${k.mapa.sente}\n· Fazes: ${k.mapa.faz}\n· Pagas: ${k.mapa.paga}`;
    case 'cena':
    default:
      return `ARCO (Cena do dia-a-dia): linha 1 = uma CENA concreta que se vê (a faca); linha 2 = o gesto; última = o que isso revela, leve.\nCENAS:\n${alguns(k.cenas, 5)}`;
  }
}

const REGRAS =
  `Voz: és a autora do Método VS, que reconheceu primeiro em si o padrão e o nomeia com calma e clareza. NÃO inventes biografia nem clientes. Revela a dor e aponta uma direção; não dás aula.\n` +
  `FORMA (o que mais importa): cada linha é UMA frase curta de UMA ideia (cabe grande num reel, lê-se num instante). NUNCA um parágrafo, nunca duas frases juntas. 3 a 6 linhas no total.\n` +
  `Concreto e de HOJE (2026: telemóvel, mensagens, notificações, a casa de agora), tão específico que a mulher pensa "sou eu" em 1 segundo. Sem jargão (padrão, consciência, energia, cura, jornada, véu, mecanismo), sem travessões, sem aspas, sem metáforas. Português europeu.\n` +
  `A 1.ª linha é a FACA (a mais afiada, o murro que para o scroll). O envio é um CTA forte (marca quem precisa / guarda / partilha), nunca morno.`;

// Gera UM formato de autoridade para um véu. Lança se o véu ainda não tem SABER.
export async function gerarAutoridade(formato: FormatoAutoridadeId, veu: VeuNome, apiKey: string, evitar: string[] = []): Promise<StoryboardAut> {
  const k = SABER[veu];
  if (!k) throw new Error(`sem SABER para o véu ${veu} (preenche lib/metodo/saber.ts primeiro)`);
  const f = FORMATOS_AUTORIDADE[formato];

  const sys =
    `Escreves o texto de um REEL curto (9:16) da conta-mãe do Método VS — o formato "${f.nome}".\n` +
    `O padrão de fundo (para TI; nunca o nomeies no texto): ${k.essencia}\n\n` +
    `${arcoEmateria(formato, k)}\n\n${REGRAS}\n` +
    (evitar.length ? `\nNÃO repitas estes arranques já usados: ${evitar.slice(-8).map((e) => `"${e}"`).join('; ')}.\n` : '') +
    `\nDevolve APENAS JSON válido, sem texto à volta: {"momentos":["linha 1 (a faca)","linha 2","…"],"envio":"CTA forte"}. As linhas seguem o ARCO acima, curtas, uma ideia cada.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 700, system: sys, messages: [{ role: 'user', content: `${f.nome} para o véu ${veu}.` }] }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}`);
  const txt = ((await res.json())?.content?.[0]?.text ?? '').trim();
  let o: { momentos?: unknown; envio?: unknown } = {};
  try { const m = txt.match(/\{[\s\S]*\}/); o = JSON.parse(m ? m[0] : txt); } catch { /* fallback */ }

  const momentos = Array.isArray(o.momentos) ? o.momentos.map((x) => lp(x)).filter(Boolean) : [];
  if (!momentos.length) throw new Error('sem storyboard de autoridade');
  const beats = momentos.map((texto) => ({ texto, imagem: '' }));
  return { beats, envio: lp(o.envio) };
}
