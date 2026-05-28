import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const maxDuration = 300;

const STYLE_BASE = `editorial photography, warm intimate atmosphere,
soft natural light, painterly quality, film-like colour grading,
shallow depth of field, golden hour or morning light;
NO text overlay, NO logos, NO watermarks, NO clickbait close-ups, NO faces glued to camera`;

const PALETTES: Record<string, string> = {
  freeme: 'warm terracotta and cream tones, brown earth palette',
  infonte: 'amber and gold tones, warm honey palette',
  synchim: 'bordeaux and rose tones, deep wine palette',
  escola: 'deep navy and lavender tones, twilight palette',
  autora: 'earthy brown and cream tones, warm sepia palette',
};

const SYSTEM_PROMPT = `You are a creative director for Vivianne dos Santos, a feminine therapeutic brand (psychology, family constellation, women's growth).

Your job: for each slide, decide if an image is needed and what would best converse with the message.

PRINCIPLES:
- Images are conversational, not decorative. They reinforce or counterpoint the text.
- NO fixed rules. Each slide is a fresh decision.
- People are welcome when they help carry the message — real women, mothers and daughters, gentle gestures, intimate interactions, hands writing, silhouettes, a back turned to camera.
- AVOID: clickbait close-ups, faces glued to camera, shocked expressions, dramatic acting.
- Objects, textures, nature, abstract — only when they truly serve the message (a candle for grief, raw linen for vulnerability, hands holding tea for presence).
- Not every slide needs an image. Pure-text slides have their own power.
- A slide CAN be intentionally text-only when the words are strong on their own.

VOICE OF THE BRAND:
- Warm, intimate, feminine, contemplative, safe
- Like entering a warm room with afternoon light
- Never clinical, never corporate, never aggressive

OUTPUT: Use the decide_slide_image tool. Either provide a prompt that converses with the text, or skip the image entirely with a reason.`;

type ClaudeDecision =
  | { precisa: true; prompt: string; justificacao: string }
  | { precisa: false; justificacao: string };

async function decidirImagem(slide: {
  texto: string; mundo: string; tipo: string; notaVisual?: string; titulo?: string;
}, apiKey: string): Promise<ClaudeDecision> {
  const userPrompt = `Slide context:

Type: ${slide.tipo}
Mundo: ${slide.mundo}
Palette: ${PALETTES[slide.mundo] ?? PALETTES.autora}
Slide text: "${slide.texto}"
${slide.titulo ? `Post title: "${slide.titulo}"` : ''}
${slide.notaVisual ? `Author's note: "${slide.notaVisual}"` : ''}

Decide:
1. Does this slide need an image? (Not every slide does — sometimes text alone is more powerful.)
2. If yes: write a Flux prompt that CONVERSES with the message. Could be people interacting, a scene, an object, a texture — whatever truly reinforces the words. Avoid clickbait close-ups.
3. If no: explain why the text stands on its own.

Use the decide_slide_image tool.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      tools: [{
        name: 'decide_slide_image',
        description: 'Decide whether this slide needs an image and provide the Flux prompt (or skip).',
        input_schema: {
          type: 'object',
          properties: {
            precisa_imagem: {
              type: 'boolean',
              description: 'true if an image enhances the slide, false if text alone is more powerful',
            },
            prompt: {
              type: 'string',
              description: 'Flux prompt in English, ~50 words. Required if precisa_imagem is true. Must converse with the slide text.',
            },
            justificacao: {
              type: 'string',
              description: 'Short explanation of the decision (1 sentence)',
            },
          },
          required: ['precisa_imagem', 'justificacao'],
        },
      }],
      tool_choice: { type: 'tool', name: 'decide_slide_image' },
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) throw new Error(`Claude API ${res.status}`);
  const json = await res.json();

  type ToolUseBlock = { type: string; input?: Record<string, unknown> };
  const toolUse = (json.content as ToolUseBlock[] | undefined)?.find(c => c.type === 'tool_use');
  if (!toolUse?.input) throw new Error('Claude: no tool_use response');

  const input = toolUse.input as { precisa_imagem: boolean; prompt?: string; justificacao: string };
  if (input.precisa_imagem) {
    if (!input.prompt) throw new Error('Claude said precisa_imagem=true but no prompt');
    return { precisa: true, prompt: input.prompt, justificacao: input.justificacao };
  }
  return { precisa: false, justificacao: input.justificacao };
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
    forcarImagem?: boolean;
  };

  if (!body.texto || !body.mundo || !body.tipo || !body.slideKey) {
    return NextResponse.json({ erro: 'campos-obrigatorios' }, { status: 400 });
  }

  const ar = body.aspectRatio ?? (body.tipo === 'capa' ? '4:5' : '1:1');

  try {
    let prompt: string;
    let justificacao = '';

    if (body.promptCustom) {
      prompt = body.promptCustom;
    } else {
      const decisao = await decidirImagem(body, anthropicKey);
      if (!decisao.precisa && !body.forcarImagem) {
        return NextResponse.json({
          imageUrl: null,
          skip: true,
          justificacao: decisao.justificacao,
        });
      }
      if (decisao.precisa) {
        prompt = decisao.prompt;
        justificacao = decisao.justificacao;
      } else {
        return NextResponse.json({
          imageUrl: null,
          skip: true,
          justificacao: decisao.justificacao,
        });
      }
    }

    const replicateUrl = await gerarImagemReplicate(prompt, ar, replicateToken, body.modelo ?? 'flux-1.1-pro');

    let finalUrl = replicateUrl;
    if (!body.semSupabase) {
      try {
        finalUrl = await guardarNoSupabase(replicateUrl, body.slideKey);
      } catch (e) {
        console.error('Supabase upload failed, returning Replicate URL:', e);
      }
    }

    return NextResponse.json({ imageUrl: finalUrl, prompt, justificacao });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ erro: 'gerar-imagem', detalhe: msg }, { status: 500 });
  }
}
