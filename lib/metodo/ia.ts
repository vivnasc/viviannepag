// Método VS · geração de frase de reconhecimento com Claude (servidor)
//
// Partilhado entre /gerar-ia (um) e /gerar-lote (vários). Escreve UMA frase de
// reconhecimento nova do véu, na voz dela, sem travessões.

import { VeuNome } from './contas';
import { VEU_SEMENTE } from './veus';
import { limparTravessoes } from '@/lib/texto';

export async function fraseReconhecimento(veu: VeuNome, apiKey: string): Promise<string> {
  const s = VEU_SEMENTE[veu];
  const sys = `Escreves UMA frase curta de RECONHECIMENTO para um reel de psicologia (Método VS). É a voz interior de uma mulher cansada, na 1.ª pessoa, que ela reconhece em 3 segundos ("isto sou eu"). Padrão: ${s.descricao}
REGRAS: português europeu; máximo 12 palavras; concreta e do dia a dia (não abstrata, não aforismo). A frase tem de fazer sentido SOZINHA, sem contexto: NÃO uses pronomes ambíguos (evita "ela", "ele", "isso", "aquilo", "lá" sem dizer a quê ou a quem te referes). SEM travessões (nem — nem –); SEM hashtags; sem aspas. Tem de ser DIFERENTE destes exemplos: ${s.exemplos.map((e) => `"${e}"`).join('; ')}.
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
