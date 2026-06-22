// SOULAB · DAR MOVIMENTO — anima a imagem de uma peça com um push-in
// cinematográfico (a CÂMARA a aproximar-se da cena), via Kling no Replicate.
//
// SEPARADO do lib/metodo/clip.ts de propósito: o motion do método é MÍNIMO e
// proíbe movimento de câmara ("No camera movement, no zoom"); aqui é o OPOSTO —
// a câmara MEXE, entra na cena, com realismo de cinema. Mesmo modelo (Kling), voz
// diferente. NÃO importar deste ficheiro a partir do método.

const MODEL = 'kwaivgi/kling-v2.5-turbo-pro';

// SUAVE (defeito): push-in lento e elegante, baixo risco de deformar.
const PROMPT_SUAVE =
  'Cinematic, photorealistic, very slow and elegant camera push-in (a gentle dolly forward) moving deeper into this exact scene, as if quietly approaching it. Subtle parallax and a real sense of depth. Keep the exact same composition, subject, palette, lighting and contemplative mood. Premium fine-art film look. Calm, hypnotic, minimal. Do NOT add or invent anything new: no new objects, no people, no text, no particles.';

// FORTE: aproximação mais pronunciada e dramática (mais imersiva, algum risco de warp).
const PROMPT_FORTE =
  'Cinematic, photorealistic camera move that travels forward INTO this exact scene, a confident dolly push-in approaching and entering the focal point (for example a doorway or a horizon), with strong depth and parallax. Keep the same composition, subject, palette, lighting and mood. Premium, dramatic, immersive film look, still smooth and controlled. Do NOT add or invent anything new: no new objects, no people, no text, no particles.';

// NEGATIVO: NÃO proíbe o movimento de câmara (é o que queremos). Proíbe só o lixo
// (inventar elementos, deformar, tremer) — nunca o push-in.
const NEGATIVE_SOULAB =
  'added objects, new elements not in the image, people appearing, a standing person, faces, hands, text, watermark, logo, morphing, warping, distortion, melting, body horror, glitch, extra limbs, deformed shapes, falling petals, sparkles, glitter confetti, floating particles, fast jittery motion, violent camera shake, strobing, flickering';

type Pred = { id: string; status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'; output?: string | string[]; error?: string };

// Anima `imageUrl` e devolve o URL do MP4 (remoto, do Replicate). Resiliente ao
// nome do campo da imagem (start_image / image) entre versões do modelo. Espera o
// resultado (a previsão demora ~1-3 min num clip de 5s).
export async function gerarMotionSoulab(
  imageUrl: string,
  token: string,
  intensidade: 'suave' | 'forte' = 'suave',
  cena?: string,
  duracao: 5 | 10 = 5,
): Promise<string> {
  // CIENTE DA CENA: dá ao Kling a descrição real para mexer só o que está lá (o
  // "match real"). Curta — prompt longo demais faz o Kling falhar.
  const cenaCurta = cena?.trim() ? cena.trim().replace(/\s+/g, ' ').split(' ').slice(0, 18).join(' ') : '';
  const base = intensidade === 'forte' ? PROMPT_FORTE : PROMPT_SUAVE;
  const prompt = cenaCurta ? `${base} Scene: ${cenaCurta}.` : base;

  const criar = (imgField: 'start_image' | 'image') =>
    fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'wait=60' },
      body: JSON.stringify({ input: { prompt, negative_prompt: NEGATIVE_SOULAB, duration: duracao, [imgField]: imageUrl } }),
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
