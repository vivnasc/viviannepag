// SOULAB · DAR MOVIMENTO — anima a imagem de uma peça via Kling no Replicate.
//
// AUTONOMIA (decisão da Vivianne): o movimento NÃO é decidido por mim no código.
// É ELA que escolhe, na interface, o que mexe: a câmara a aproximar-se E/OU
// elementos da cena (água, folhagem, pássaro, névoa, luz, chama, tecido, fumo),
// ou descreve o movimento por palavras dela. Este ficheiro só traduz as escolhas
// dela num prompt para o Kling. SEPARADO do lib/metodo/clip.ts.

const MODEL = 'kwaivgi/kling-v2.5-turbo-pro';

// os INGREDIENTES de movimento (à escolha dela, multi-seleção). label = o que ela
// vê; en = a frase real que vai para o Kling (inglês = melhor qualidade).
export const MOTION_INGREDIENTES = [
  { id: 'agua', label: '💧 água', en: 'water gently rippling, reflections shifting on the surface' },
  { id: 'folhagem', label: '🌿 folhagem', en: 'foliage, plants and leaves swaying softly' },
  { id: 'passaro', label: '🐦 pássaro', en: 'a single bird slowly flying across, far in the distance' },
  { id: 'nevoa', label: '🌫️ névoa', en: 'mist and fog drifting slowly through the scene' },
  { id: 'luz', label: '✨ luz', en: 'light, glow and reflections softly shifting and breathing' },
  { id: 'chama', label: '🕯️ chama', en: 'a candle flame flickering gently' },
  { id: 'tecido', label: '🌬️ tecido', en: 'fabric or a curtain swaying gently in a soft breeze' },
  { id: 'fumo', label: '💨 fumo', en: 'thin smoke or steam drifting slowly upward' },
] as const;

export type IngredienteId = (typeof MOTION_INGREDIENTES)[number]['id'];

// a CÂMARA (separada dos elementos): ela escolhe se a câmara mexe e quanto.
export const CAMARA_OPCOES = [
  { id: 'nenhuma', label: 'câmara parada' },
  { id: 'suave', label: 'aproximar · suave' },
  { id: 'forte', label: 'aproximar · forte' },
] as const;
export type CamaraId = (typeof CAMARA_OPCOES)[number]['id'];

export interface MovimentoOpts {
  ingredientes?: string[];      // ids de MOTION_INGREDIENTES
  camara?: CamaraId;            // movimento de câmara
  livre?: string;              // descrição livre, nas palavras dela
  cena?: string;               // descrição da cena (para o "match real")
}

function fraseCamara(c: CamaraId): string {
  if (c === 'suave') return 'a very slow, gentle and elegant cinematic camera push-in, moving softly into the scene';
  if (c === 'forte') return 'a confident cinematic camera push-in traveling forward, entering deeper into the scene';
  return '';
}

// Constrói o prompt + negativo a partir das ESCOLHAS dela. Se ela nomear elementos
// (ou escrever movimento livre), o negativo NÃO proíbe "novos elementos" (ela quer
// o pássaro/a água); se for só câmara/nada, mantém a regra "não inventes".
export function construirMovimento(opts: MovimentoOpts): { prompt: string; negative: string } {
  const ens = (opts.ingredientes ?? [])
    .map((id) => MOTION_INGREDIENTES.find((x) => x.id === id)?.en)
    .filter(Boolean) as string[];
  const partes: string[] = [];
  const cam = fraseCamara(opts.camara ?? 'suave');
  if (cam) partes.push(cam);
  partes.push(...ens);
  if (opts.livre?.trim()) partes.push(opts.livre.trim());

  const houveElementos = ens.length > 0 || !!opts.livre?.trim();
  const movDesc = partes.length
    ? partes.join('; ')
    : 'very subtle, slow, natural motion of the elements that already exist in the image';
  const cenaCurta = opts.cena?.trim()
    ? ` Scene: ${opts.cena.trim().replace(/\s+/g, ' ').split(' ').slice(0, 16).join(' ')}.`
    : '';

  const prompt =
    `Photorealistic, cinematic, premium fine-art film look. Animate THIS exact image with: ${movDesc}.${cenaCurta} ` +
    'Keep the exact same composition, subject, palette, lighting and contemplative mood. Smooth, calm, controlled, realistic motion. ' +
    'No warping, no morphing, no distortion, no camera shake.';

  const negBase =
    'text, watermark, logo, morphing, warping, distortion, melting, body horror, glitch, extra limbs, deformed face, deformed hands, fast jittery motion, violent camera shake, strobing, flickering, low quality, blurry';
  const negative = houveElementos
    ? negBase
    : `added objects, invented new elements, people appearing, a standing person, falling petals, sparkles, glitter, floating particles, ${negBase}`;

  return { prompt, negative };
}

type Pred = { id: string; status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'; output?: string | string[]; error?: string };

// Anima `imageUrl` segundo as ESCOLHAS dela e devolve o URL do MP4 (do Replicate).
// Espera o resultado (a previsão demora ~1-3 min num clip de 5s).
export async function gerarMotionSoulab(imageUrl: string, token: string, opts: MovimentoOpts = {}, duracao: 5 | 10 = 5): Promise<string> {
  const { prompt, negative } = construirMovimento(opts);

  const criar = (imgField: 'start_image' | 'image') =>
    fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'wait=60' },
      body: JSON.stringify({ input: { prompt, negative_prompt: negative, duration: duracao, [imgField]: imageUrl } }),
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
