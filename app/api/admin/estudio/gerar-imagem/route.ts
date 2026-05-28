import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const maxDuration = 300;

const STYLE_BASE = `editorial feminine photography, warm intimate atmosphere,
painterly quality, soft natural light, golden hour or morning light;
textures: raw linen, dried flowers, warm wood, ceramic, natural stone, handmade paper;
botanicals: olive branches, dried lavender, eucalyptus, wildflowers, cotton;
colour grading: warm, desaturated, film-like;
NO people, NO faces, NO hands, NO text, NO logos, NO watermarks`;

const PALETTES: Record<string, string> = {
  freeme: 'warm terracotta and cream palette, brown earth tones',
  infonte: 'amber and gold palette, warm honey tones',
  synchim: 'bordeaux and rose palette, deep wine tones',
  escola: 'deep navy and lavender palette, twilight tones',
  autora: 'earthy brown and cream palette, warm sepia',
};

const SYSTEM_PROMPT = `You are a Midjourney/Flux prompt specialist for Vivianne dos Santos, a feminine therapeutic brand.
Generate prompts for social media slide backgrounds.

VISUAL IDENTITY:
- Warm, intimate, feminine, earthy
- Morning light, warm ceramics, dried botanicals, natural textures
- Mood: contemplative, gentle, safe
- NO people, faces, or hands
- Compose with breathing room for text overlay (avoid busy centres)

OUTPUT: Return ONLY the prompt in English. No explanations. ~50 words max.`;

async function gerarPrompt(slide: {
  texto: string; mundo: string; tipo: string; notaVisual?: string; titulo?: string;
}, apiKey: string): Promise<string> {
  const userPrompt = `Generate a prompt for a slide background image.

Slide type: ${slide.tipo}
Mundo: ${slide.mundo}
Palette: ${PALETTES[slide.mundo] ?? PALETTES.autora}
Slide text: "${slide.texto}"
${slide.titulo ? `Post title: "${slide.titulo}"` : ''}
${slide.notaVisual ? `Visual direction: "${slide.notaVisual}"` : ''}

Capture the EMOTIONAL essence of the text. Compose with breathing room.
Return ONLY the prompt.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) throw new Error(`Claude API ${res.status}`);
  const json = await res.json();
  const text = (json.content?.[0]?.text as string | undefined) ?? '';
  return text.trim();
}

type ReplicatePrediction = {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string | string[];
  error?: string;
};

type Modelo = 'flux-1.1-pro' | 'flux-1.1-pro-ultra';

const MODELO_URLS: Record<Modelo, string> = {
  'flux-1.1-pro': 'https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions',
  'flux-1.1-pro-ultra': 'https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro-ultra/predictions',
};

async function gerarImagemReplicate(prompt: string, aspectRatio: string, token: string, modelo: Modelo = 'flux-1.1-pro'): Promise<string> {
  const fullPrompt = `${prompt}\n\n${STYLE_BASE}`;

  const isUltra = modelo === 'flux-1.1-pro-ultra';

  const createRes = await fetch(MODELO_URLS[modelo], {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'wait=60',
    },
    body: JSON.stringify({
      input: isUltra ? {
        prompt: fullPrompt,
        aspect_ratio: aspectRatio,
        output_format: 'jpg',
        safety_tolerance: 5,
        raw: false,
      } : {
        prompt: fullPrompt,
        aspect_ratio: aspectRatio,
        output_format: 'jpg',
        output_quality: 90,
        safety_tolerance: 5,
      },
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Replicate API ${createRes.status}: ${errText.substring(0, 200)}`);
  }

  let prediction = await createRes.json() as ReplicatePrediction;

  const maxPolls = 60;
  let polls = 0;
  while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && prediction.status !== 'canceled' && polls < maxPolls) {
    await new Promise(r => setTimeout(r, 2000));
    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!pollRes.ok) throw new Error(`Replicate poll ${pollRes.status}`);
    prediction = await pollRes.json() as ReplicatePrediction;
    polls++;
  }

  if (prediction.status !== 'succeeded') {
    throw new Error(`Replicate failed: ${prediction.error ?? prediction.status}`);
  }

  const output = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  if (!output) throw new Error('Replicate: empty output');
  return output;
}

async function guardarNoSupabase(imageUrl: string, slideKey: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  const bucket = 'estudio-imagens';

  await supabase.storage.createBucket(bucket, { public: true }).catch(() => {});

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Download imagem ${imgRes.status}`);
  const blob = await imgRes.blob();
  const buffer = Buffer.from(await blob.arrayBuffer());

  const path = `${slideKey}-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (error) throw new Error(`Supabase upload: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ erro: 'auth' }, { status: 401 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  if (!anthropicKey) return NextResponse.json({ erro: 'sem-anthropic-key' }, { status: 500 });
  if (!replicateToken) return NextResponse.json({ erro: 'sem-replicate-token' }, { status: 500 });

  const body = (await req.json()) as {
    texto: string;
    mundo: string;
    tipo: string;
    notaVisual?: string;
    titulo?: string;
    aspectRatio?: string;
    slideKey: string;
    promptCustom?: string;
    semSupabase?: boolean;
    modelo?: Modelo;
  };

  if (!body.texto || !body.mundo || !body.tipo || !body.slideKey) {
    return NextResponse.json({ erro: 'campos-obrigatorios' }, { status: 400 });
  }

  const ar = body.aspectRatio ?? (body.tipo === 'capa' ? '4:5' : '1:1');

  try {
    const prompt = body.promptCustom ?? await gerarPrompt(body, anthropicKey);
    const replicateUrl = await gerarImagemReplicate(prompt, ar, replicateToken, body.modelo ?? 'flux-1.1-pro');

    let finalUrl = replicateUrl;
    if (!body.semSupabase) {
      try {
        finalUrl = await guardarNoSupabase(replicateUrl, body.slideKey);
      } catch (e) {
        console.error('Supabase upload failed, returning Replicate URL:', e);
      }
    }

    return NextResponse.json({ imageUrl: finalUrl, prompt });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ erro: 'gerar-imagem', detalhe: msg }, { status: 500 });
  }
}
