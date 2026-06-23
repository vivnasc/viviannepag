// veu.a.veu · gerar a DEMONSTRAÇÃO física em vídeo — Runway Gen-4.5 via Replicate
// (pay-per-use, o mesmo REPLICATE_API_TOKEN do Kling). Texto→vídeo, vertical 9:16.
// SEPARADO do lib/soulab/motion.ts (Kling). Devolve o URL do MP4.
//
// NOTA (integração às cegas, sem chave no dev): se um campo do input estiver errado,
// o Replicate devolve 422 com a lista de campos — surfaçamos o texto do erro para
// afinar UMA linha. 422 = input inválido = NÃO corre = NÃO cobra créditos.

const MODEL = 'runwayml/gen-4.5';

type Pred = { id: string; status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'; output?: string | string[]; error?: string };

// duração: o Gen-4.5 no Replicate só aceita 5 ou 10 segundos (confirmado por 422).
export async function gerarVideoDemonstracao(prompt: string, token: string, duracao: 5 | 10 = 5): Promise<string> {
  // REALISMO (pedido da Vivianne: "nada atual, zero ambiente natural, algo mais
  // realístico"). Prefixo autoritário: filmagem documental fotorrealista, luz natural,
  // ambiente real e contemporâneo — NUNCA estúdio, fundo preto ou ar de CGI.
  const REAL = 'Photorealistic documentary footage filmed handheld on a real camera in soft natural daylight, set in a real contemporary everyday environment, authentic real materials and textures, candid and natural, absolutely NOT a studio shot, NOT a black void background, NOT CGI, NOT a 3D render. ';
  // input no formato mais comum do Replicate; se a ficha do modelo usar outros nomes,
  // o 422 abaixo diz-nos quais (afinação de 1 linha).
  const input: Record<string, unknown> = { prompt: `${REAL}${prompt}`, duration: duracao, aspect_ratio: '9:16' };

  const res = await fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'wait=60' },
    body: JSON.stringify({ input }),
  });
  if (!res.ok) throw new Error(`Replicate ${res.status}: ${(await res.text()).slice(0, 300)}`);

  let pred = (await res.json()) as Pred;
  let polls = 0;
  while (!['succeeded', 'failed', 'canceled'].includes(pred.status) && polls < 120) {
    await new Promise((r) => setTimeout(r, 3000));
    const pr = await fetch(`https://api.replicate.com/v1/predictions/${pred.id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!pr.ok) throw new Error(`Replicate poll ${pr.status}`);
    pred = (await pr.json()) as Pred;
    polls++;
  }
  if (pred.status !== 'succeeded') throw new Error(`Replicate: ${pred.error ?? pred.status}`);
  const out = Array.isArray(pred.output) ? pred.output[0] : pred.output;
  if (!out) throw new Error('Replicate: sem output');
  return out;
}
