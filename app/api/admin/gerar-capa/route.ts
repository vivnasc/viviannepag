import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { promptParaSlug } from '@/lib/prompts-capa';

const BUCKET = 'escritos';

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ erro: 'auth' }, { status: 401 });
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ erro: 'sem-openai-key' }, { status: 500 });
  }

  const body = (await req.json()) as {
    id?: string;
    slug?: string;
    prompt?: string;
    qualidade?: 'low' | 'medium' | 'high';
  };

  if (!body.slug) {
    return NextResponse.json({ erro: 'slug-obrigatorio' }, { status: 400 });
  }

  const prompt = promptParaSlug(body.slug, body.prompt);
  if (!prompt) {
    return NextResponse.json(
      { erro: 'sem-prompt-para-slug', detalhe: 'Sem prompt em prompts-capa.ts e sem override no body.' },
      { status: 400 }
    );
  }

  const oaiRes = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size: '1536x1024',
      quality: body.qualidade ?? 'high',
      n: 1,
    }),
  });

  if (!oaiRes.ok) {
    const txt = await oaiRes.text();
    return NextResponse.json({ erro: 'openai', detalhe: txt }, { status: 502 });
  }

  const json = (await oaiRes.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
  const first = json.data?.[0];
  if (!first) {
    return NextResponse.json({ erro: 'sem-imagem' }, { status: 502 });
  }

  let imageBuf: Buffer;
  if (first.b64_json) {
    imageBuf = Buffer.from(first.b64_json, 'base64');
  } else if (first.url) {
    const r = await fetch(first.url);
    imageBuf = Buffer.from(await r.arrayBuffer());
  } else {
    return NextResponse.json({ erro: 'sem-conteudo' }, { status: 502 });
  }

  const supabase = getSupabaseAdmin();
  const storagePath = `${body.slug}/capa-${Date.now()}.png`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, imageBuf, { contentType: 'image/png', upsert: false });
  if (upErr) {
    return NextResponse.json({ erro: upErr.message }, { status: 500 });
  }
  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  const capaUrl = pub.publicUrl;

  if (body.id) {
    await supabase
      .from('escritos')
      .update({ capa: capaUrl, updated_at: new Date().toISOString() })
      .eq('id', body.id);
  }

  return NextResponse.json({ url: capaUrl, path: storagePath, prompt });
}
