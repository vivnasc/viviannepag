// Método VS · gerar CLIP (image -> video) via Kling no Replicate. Anima um fundo
// JÁ existente com movimento real do conteúdo (água a ondular, névoa a derivar,
// tecido/luz a mexer), sem trabalho manual. É o que substitui o clip que a
// Vivianne fazia à mão no MidJourney. Runway está fora (câmara parada).

const MODEL = 'kwaivgi/kling-v2.5-turbo-pro';

// movimento MÍNIMO e natural: anima SÓ o que JÁ EXISTE na imagem. SEM exemplos
// fixos (era o "a chama treme" que punha o Kling a inventar fogo numa almofada!):
// move só os elementos realmente presentes, e nunca acrescenta nada.
export const PROMPT_MOVIMENTO =
  'Animate ONLY what is truly already present in this exact image, with very subtle, slow, natural motion of the elements that actually exist in it (water rippling, fabric or a curtain swaying, light and reflections shifting, steam or mist drifting, foliage moving) and ONLY if they are really there. Keep the exact same composition, objects, palette and framing. Extremely slow, calm, minimal, realistic. Do NOT invent or add ANYTHING that is not already in the image: no new flames, no fire, no falling petals, no sparkles, no glitter, no floating particles, no smoke or fog appearing. No camera movement, no zoom.';

// o que o modelo NÃO deve fazer (evita inventar elementos que não estão na cena).
export const NEGATIVE_MOVIMENTO =
  'added objects, new elements, invented fire, new flames, flying leaves, falling petals, sparkles, glitter, floating particles, gold flecks, smoke appearing, fog appearing, new curtains, birds, butterflies, text, watermark, fast motion, dramatic motion, camera shake, zoom, pan, morphing, warping, distortion, people appearing, faces, hands';

// movimento DRAMÁTICO (tarde): anima SÓ o que está na cena (a luz/energia/atmosfera
// presentes), sem assumir objetos que podem não existir. FORTE mas sem inventar lixo
// nem deformar o que existe.
export const PROMPT_MOVIMENTO_DRAMA =
  'Animate the luminous energy and particles of light that are already in this image: the light flows, swirls, rises, pulses and opens, sparks and dust drift, filaments shimmer. Continuous, hypnotic, elegant motion of the light itself. Keep the dark background and the composition. Do NOT add new objects; do NOT morph or distort. No camera shake.';
export const NEGATIVE_MOVIMENTO_DRAMA =
  'added objects, new elements not in the image, a standing person, morphing body, distorted figure, extra limbs, deformed face, body horror, glitch, warping, text, watermark, logo, glitter confetti, fast jittery motion, camera shake';

type Pred = { id: string; status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'; output?: string | string[]; error?: string };

// CRIA a previsão e devolve JÁ o id (sem esperar). É o que torna a animação
// independente da aba: o trabalho corre no Replicate, gravamos o id, e o clip é
// COLHIDO mais tarde (colher/route). Assim mudar de conta/fechar NÃO perde nada.
export async function criarPredicaoClip(imageUrl: string, token: string, prompt = PROMPT_MOVIMENTO, duracao: 5 | 10 = 5, negative = NEGATIVE_MOVIMENTO, cena?: string): Promise<string> {
  // CIENTE DA CENA: junta a descrição real da imagem para o Kling animar o que
  // ESTÁ lá (e não inventar fogo numa almofada). É o "match real" do motion.
  // cena curta (prompt longo demais faz o Kling falhar). Só as primeiras palavras.
  const cenaCurta = cena?.trim() ? cena.trim().replace(/\s+/g, ' ').split(' ').slice(0, 22).join(' ') : '';
  const promptFinal = cenaCurta ? `${prompt} Scene: ${cenaCurta}. Animate only what is really there.` : prompt;
  const criar = (imgField: 'start_image' | 'image') =>
    fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: { prompt: promptFinal, negative_prompt: negative, duration: duracao, [imgField]: imageUrl } }),
    });
  // o Replicate limita pedidos simultâneos (429). Retry com espera para a 2.ª face
  // não falhar quando se animam as duas (criar é rápido; só o processamento é longo).
  let ultimo = '';
  for (let t = 0; t < 5; t++) {
    let res = await criar('start_image');
    if (res.status === 422) res = await criar('image'); // algumas versões usam 'image'
    if (res.ok) {
      const pred = (await res.json()) as Pred;
      if (!pred.id) throw new Error('Replicate: sem id de previsão');
      return pred.id;
    }
    ultimo = `Replicate ${res.status}: ${(await res.text()).slice(0, 200)}`;
    if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 2500 * (t + 1))); continue; }
    throw new Error(ultimo); // erro não recuperável (ex.: 400/401)
  }
  throw new Error(ultimo || 'Replicate: falhou a criar previsão');
}

// Lê o estado de uma previsão (para a COLHER quando ficar pronta).
export async function estadoPredicao(predId: string, token: string): Promise<{ status: Pred['status']; url: string | null; erro?: string }> {
  const pr = await fetch(`https://api.replicate.com/v1/predictions/${predId}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!pr.ok) throw new Error(`Replicate poll ${pr.status}`);
  const pred = (await pr.json()) as Pred;
  const out = Array.isArray(pred.output) ? pred.output[0] : pred.output;
  return { status: pred.status, url: out ?? null, erro: pred.error };
}

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
