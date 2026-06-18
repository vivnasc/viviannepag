// Universo VS · gerador do REEL à ANATOMIA (texto), por personagem + véu + conta.
//
// 3 eixos: PERSONAGEM (quem, o reconhecimento) · VÉU (porquê, o mecanismo) ·
// CONTA (como, o gesto/volta). Devolve SÓ texto (5 partes da anatomia). Sem
// recipiente, sem imagem. As 3 regras de voz são DURAS (ver abaixo).

import { VeuNome, ContaId, CONTAS } from './contas';
import { VEU_SEMENTE } from './veus';
import { SABER } from './saber';
import type { Personagem } from './personagens';
import { GESTO_CONTA } from './universo';
import { limparTravessoes } from '@/lib/texto';

export interface ReelAnatomia {
  hook: string;            // 0-1s, frase-faca partida (comportamento da personagem)
  reconhecimento: string;  // 1-5s, fecha o retrato
  raiz: string;            // 5-14s, o mecanismo (véu), sem culpa
  volta: string;           // 14-18s, alívio/direção concreta (gesto da conta)
  envio: string;           // ENVIO implícito
}

const lp = (s: unknown) => limparTravessoes(String(s ?? '').replace(/^["«»]+|["«»]+$/g, '').trim());

export async function gerarReelAnatomia(conta: ContaId, veu: VeuNome, personagem: Personagem, apiKey: string, evitar: string[] = []): Promise<ReelAnatomia> {
  const s = VEU_SEMENTE[veu];
  const k = SABER[veu];
  const gesto = GESTO_CONTA[conta];
  const handle = CONTAS[conta]?.handle ?? conta;
  const mecanismo = k ? `${k.essencia} Como se mantém: ${(k.mecanismos ?? []).slice(0, 3).join(' · ')}.` : (s?.descricao ?? '');

  const sys = `Escreves um REEL curto de psicologia (Método VS, conta @${handle}) à ANATOMIA abaixo. NÃO é uma aula. A mulher reconhece-se em 1 segundo ("és tu"). Público: mulheres 35-55 que trabalham, estudam, cuidam e gerem a vida de toda a gente (carga mental de 2026).

PERSONAGEM (QUEM, o reconhecimento): ${personagem.nome}. ${personagem.essencia} Diz coisas como: ${personagem.frases.map((f) => `"${f}"`).join('; ')}. Sombra: ${personagem.sombra}
VÉU (PORQUÊ, o mecanismo por baixo, NÃO o nomeies): ${mecanismo}
GESTO DESTA CONTA (COMO fecha, a volta): ${gesto.volta}.

ANATOMIA (escreve cada parte, curta):
- hook: uma frase-faca PARTIDA a meio (falta a 2.ª parte, fica em suspenso) com um COMPORTAMENTO concreto e atual da personagem. É o que para o scroll no 1.º segundo.
- reconhecimento: 1 ou 2 frases que fecham o retrato com mais comportamentos concretos.
- raiz: 1 frase com o mecanismo (porque é que isto prende), sem culpa.
- volta: 1 frase de alívio com uma direção CONCRETA, no gesto desta conta.
- envio: um envio IMPLÍCITO (do tipo "já sabes em quem pensaste a ler isto").

REGRAS DE VOZ (DURAS, invioláveis):
1. SEM METÁFORAS. Nada de água, remos, tempestade, alma, universo, véu, luz, mar. Linguagem real, concreta, do dia a dia.
2. SEM TESTEMUNHO nem biografia. NUNCA "fui eu", nunca histórias pessoais. Fala na 2.ª pessoa (tu) ou descreve em 3.ª (ela). Nunca em 1.ª pessoa confessional.
3. Concreto e atual (consultas, prazos, reuniões, gerir a casa e a vida dos outros, adiar o que é dela). PT europeu. SEM travessões (nem — nem –). SEM aspas a abrir/fechar. SEM hashtags.
${evitar.length ? `NÃO repitas estes ângulos já usados: ${evitar.slice(-12).map((e) => `"${e}"`).join('; ')}.` : ''}

Devolve SÓ JSON válido: {"hook":"...","reconhecimento":"...","raiz":"...","volta":"...","envio":"..."}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 600, system: sys, messages: [{ role: 'user', content: `Reel novo: personagem ${personagem.nome}, véu ${veu}, conta @${handle}.` }] }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}`);
  const txt = ((await res.json())?.content?.[0]?.text ?? '').trim();

  let o: Partial<ReelAnatomia> = {};
  try { const m = txt.match(/\{[\s\S]*\}/); o = JSON.parse(m ? m[0] : txt); } catch { /* fallback abaixo */ }
  const reel: ReelAnatomia = {
    hook: lp(o.hook), reconhecimento: lp(o.reconhecimento), raiz: lp(o.raiz), volta: lp(o.volta), envio: lp(o.envio),
  };
  if (!reel.hook && !reel.reconhecimento) throw new Error('sem reel');
  return reel;
}
