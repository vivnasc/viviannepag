// Método VS · gerar CLIP (image -> video) via Kling no Replicate. Anima um fundo
// JÁ existente com movimento real do conteúdo (água a ondular, névoa a derivar,
// tecido/luz a mexer), sem trabalho manual. É o que substitui o clip que a
// Vivianne fazia à mão no MidJourney. Runway está fora (câmara parada).

const MODEL = 'kwaivgi/kling-v2.5-turbo-pro';

// movimento subtil e fotorrealista, mantendo composição/paleta; sem objetos
// novos, sem pessoas, sem texto. É o registo do Método VS (contemplativo).
export const PROMPT_MOVIMENTO =
  'Bring this still painting to life with subtle, natural, cinematic motion: water ripples gently, mist and light drift, leaves, fabric and clouds sway slowly. Keep the exact composition, palette, mood and framing. Calm, slow, atmospheric, contemplative. No new objects, no people appearing, no text, no camera shake.';

type Pred = { id: string; status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'; output?: string | string[]; error?: string };

// Anima `imageUrl` e devolve o URL do MP4 (remoto, do Replicate). Resiliente ao
// nome do campo da imagem (start_image / image) entre versões do modelo.
export async function gerarClipKling(imageUrl: string, token: string, prompt = PROMPT_MOVIMENTO, duracao: 5 | 10 = 5): Promise<string> {
  const criar = (imgField: 'start_image' | 'image') =>
    fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'wait=60' },
      body: JSON.stringify({ input: { prompt, duration: duracao, [imgField]: imageUrl } }),
    });

  let res = await criar('start_image');
  if (res.status === 422) res = await criar('image'); // algumas versões usam 'image'
  if (!res.ok) throw new Error(`Replicate ${res.status}: ${(await res.text()).slice(0, 200)}`);

  let pred = (await res.json()) as Pred;
  let polls = 0;
  while (!['succeeded', 'failed', 'canceled'].includes(pred.status) && polls < 95) {
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
