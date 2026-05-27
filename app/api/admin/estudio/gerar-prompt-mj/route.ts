import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';

export const maxDuration = 60;

const STYLE_BASE = `editorial feminine photography, warm intimate atmosphere,
fixed palette adapted per mundo: FreeMe (terracotta #8C4A36, cream #F2E8DC, gold #EBAE4A),
Infonte (amber #B8843D, cream, gold), SyncHim (bordeaux #5A1A2A, cream, rose #E08496),
Escola dos Véus (deep navy #1A1A2E, cream, lavender #C9B6FA), Autora (earth #3A2818, cream, gold);
painterly quality, soft natural light, golden hour or morning light preferred;
textures: raw linen, dried flowers, warm wood, ceramic, natural stone, handmade paper;
botanicals: olive branches, dried lavender, eucalyptus, wildflowers, cotton;
colour grading: warm, desaturated, film-like;
NO people, NO faces, NO hands, NO text, NO logos, NO watermarks, NO canva-style graphics;
aspect ratio for social slides, high quality`;

const SYSTEM = `You are a Midjourney prompt specialist for Vivianne dos Santos, a feminine therapeutic brand.
You generate prompts for social media slide backgrounds (Instagram carousels and stories).

VISUAL IDENTITY:
- Warm, intimate, feminine, earthy — never clinical, never corporate, never masculine
- Think: morning light through linen curtains, warm ceramics, dried botanicals, natural textures
- Mood: contemplative, gentle, safe, like entering a warm room
- NO people, faces, or hands — always objects, textures, nature, still life
- Each prompt must be visually DISTINCT — vary between: macro textures, still life, nature scenes, abstract warmth, light studies

STYLE BASE (append to every prompt):
${STYLE_BASE}

OUTPUT: Return ONLY the Midjourney prompt in English. No explanations. End with the aspect ratio parameter.`;

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ erro: 'auth' }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });
  }

  const body = (await req.json()) as {
    texto: string;
    mundo: string;
    tipo: string;
    notaVisual?: string;
    titulo?: string;
    aspectRatio?: string;
  };

  const ar = body.aspectRatio ?? (body.tipo === 'capa' ? '4:5' : '1:1');

  const userPrompt = `Generate a Midjourney prompt for a social media slide background.

CONTEXT:
- Slide type: ${body.tipo}
- Mundo/brand: ${body.mundo}
- Slide text: "${body.texto}"
${body.titulo ? `- Post title: "${body.titulo}"` : ''}
${body.notaVisual ? `- Visual direction from author: "${body.notaVisual}"` : ''}
- Aspect ratio: ${ar}

RULES:
- Capture the EMOTIONAL essence of the text, not a literal illustration
- Use the palette of the "${body.mundo}" mundo
- For "capa" slides: more dramatic, editorial, attention-grabbing
- For "conteudo" slides: subtle, textural, doesn't compete with overlay text
- For "citacao" slides: moody, contemplative, minimal
- For "cta" slides: light, warm, inviting (text will be dark on this background)
- The image will have text overlaid, so avoid busy centres — leave breathing room
- End with --ar ${ar} --v 6.1

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
      max_tokens: 500,
      system: SYSTEM,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ erro: 'anthropic', detalhe: text }, { status: 500 });
  }

  const json = await res.json();
  const prompt = (json.content?.[0]?.text as string | undefined) ?? '';

  return NextResponse.json({ prompt: prompt.trim() });
}
