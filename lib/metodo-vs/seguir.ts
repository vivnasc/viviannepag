// MÉTODO VS · o CONVITE A SEGUIR (o fecho que faltava). Decisão da Vivianne: as
// peças de 1 frame levam-no só na LEGENDA; as de vários frames levam-no também
// como ÚLTIMO FRAME. O texto é GERADO das fontes dela (a sensação-mãe + a chegada
// de cada conta + o véu do dia), nunca escrito à mão, e VARIA. Sem travessões.

import { getConta, type VeuNome, type ContaId } from '@/lib/metodo/contas';
import { limparTravessoes } from '@/lib/texto';

const lp = (s: unknown) => limparTravessoes(String(s ?? '').replace(/^["«»]+|["«»]+$/g, '').trim());

// Gera UMA linha de convite a seguir, na voz da conta. Devolve '' se falhar (a peça
// sai à mesma, só sem o convite) — nunca rebenta a geração da peça.
export async function gerarSeguir(conta: ContaId, veu: VeuNome, apiKey: string): Promise<string> {
  const c = getConta(conta);
  if (!c) return '';
  const sys =
`Escreves a ÚLTIMA linha de uma peça da Vivianne dos Santos (Método VS · Ver e Soltar): o CONVITE A SEGUIR. NÃO é um pedido mendigado ("segue-me"), é a promessa de que isto continua: há um caminho, um véu de cada vez, e seguir é não perder o fio.

A VOZ desta conta (só para ti, NUNCA a cites nem a copies): a sensação que a une é "${c.fraseMae ?? ''}"; o movimento de chegada é ${c.chegada ?? 'soltar sem força'}.

REGRAS:
- UMA linha curta (4 a 12 palavras). Calorosa e firme, nunca uma ordem nem súplica.
- Diz, à TUA maneira, que há MAIS disto e que vale a pena ficar/seguir. Podes tocar de leve a sensação acima, sem a repetir à letra.
- Português europeu. SEM travessões, SEM aspas, SEM hashtags, SEM emojis, SEM "@".
- NÃO nomeies o véu nem uses jargão (padrão, mecanismo, véu, cura, trauma). Linguagem da vida.

Devolve APENAS JSON válido: {"seguir":"a linha do convite a seguir"}`;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 120, system: sys, messages: [{ role: 'user', content: `O convite a seguir. Conta ${conta}; véu do dia ${veu} (varia por aqui, mas não o nomeies).` }] }),
    });
    if (!res.ok) return '';
    const txt = ((await res.json())?.content?.[0]?.text ?? '').trim();
    let o: { seguir?: unknown } = {};
    try { const m = txt.match(/\{[\s\S]*\}/); o = JSON.parse(m ? m[0] : txt); } catch { /* fica sem convite */ }
    return lp(o.seguir);
  } catch { return ''; }
}
