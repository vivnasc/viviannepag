// Método VS · gerar CLIP (image -> video) via Kling no Replicate. Anima um fundo
// JÁ existente com movimento real do conteúdo (água a ondular, névoa a derivar,
// tecido/luz a mexer), sem trabalho manual. É o que substitui o clip que a
// Vivianne fazia à mão no MidJourney. Runway está fora (câmara parada).

const MODEL = 'kwaivgi/kling-v2.5-turbo-pro';

// movimento MÍNIMO e natural: anima SÓ o que já existe na imagem (a chama treme
// devagar, a luz respira, leve movimento do que já lá está). NUNCA acrescenta
// objetos (nada de folhas/pó/fumo/cortinas a voar). Registo contemplativo do método.
export const PROMPT_MOVIMENTO =
  'Animate ONLY what already exists in this image, with very subtle, natural, almost-still motion: a flame flickers gently, light and reflections shift softly, a faint breathing of the scene. Keep the exact same composition, objects, palette and framing. Extremely slow, calm, minimal, realistic. Do NOT add anything new and do NOT invent elements: no flying leaves, no falling petals, no sparkles or glitter, no floating particles, no extra smoke, no curtains, no birds. No camera movement, no zoom.';

// o que o modelo NÃO deve fazer (evita o exagero: pó dourado, folhas a voar, etc.)
export const NEGATIVE_MOVIMENTO =
  'added objects, new elements, flying leaves, falling petals, sparkles, glitter, floating particles, gold flecks, extra smoke, fog appearing, curtains, fabric blowing, birds, butterflies, text, watermark, fast motion, dramatic motion, camera shake, zoom, pan, morphing, warping, distortion, people, faces, hands';

type Pred = { id: string; status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'; output?: string | string[]; error?: string };

// Anima `imageUrl` e devolve o URL do MP4 (remoto, do Replicate). Resiliente ao
// nome do campo da imagem (start_image / image) entre versões do modelo.
export async function gerarClipKling(imageUrl: string, token: string, prompt = PROMPT_MOVIMENTO, duracao: 5 | 10 = 5): Promise<string> {
  const criar = (imgField: 'start_image' | 'image') =>
    fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'wait=60' },
      body: JSON.stringify({ input: { prompt, negative_prompt: NEGATIVE_MOVIMENTO, duration: duracao, [imgField]: imageUrl } }),
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
