import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'escritos';

export const maxDuration = 120;

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ erro: 'auth' }, { status: 401 });
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ erro: 'sem-anthropic-key' }, { status: 500 });
  }

  const form = await req.formData();
  const files = form.getAll('files').filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ erro: 'sem-ficheiros' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: escritos } = await supabase
    .from('escritos')
    .select('id, slug, locale, titulo, resumo, tematica')
    .eq('locale', 'pt');

  if (!escritos || escritos.length === 0) {
    return NextResponse.json({ erro: 'sem-escritos' }, { status: 404 });
  }

  const imagensB64: { mediaType: string; data: string; nome: string; idx: number }[] = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const buf = Buffer.from(await f.arrayBuffer());
    imagensB64.push({
      mediaType: f.type || 'image/png',
      data: buf.toString('base64'),
      nome: f.name,
      idx: i,
    });
  }

  const listaEscritos = escritos
    .map((e, i) => `${i + 1}. slug="${e.slug}" | "${e.titulo}" | ${e.tematica ?? ''} | ${e.resumo}`)
    .join('\n');

  const instrucoes = `Tens ${imagensB64.length} imagens numeradas (1 a ${imagensB64.length}).

Estes são os escritos disponíveis:
${listaEscritos}

Olha para CADA imagem e decide qual escrito corresponde melhor, com base no conteúdo visual da imagem e no título/resumo do escrito.

REGRAS:
- Cada imagem corresponde a exactamente UM escrito
- Cada escrito só pode ser usado UMA vez
- Se não tiveres a certeza, faz o melhor match possível
- Responde APENAS com JSON válido, sem markdown

Formato: {"matches":[{"imagem":1,"slug":"slug-do-escrito"},{"imagem":2,"slug":"outro-slug"},...]}`;

  const content = [
    ...imagensB64.map((img) => ({
      type: 'image' as const,
      source: {
        type: 'base64' as const,
        media_type: img.mediaType,
        data: img.data,
      },
    })),
    { type: 'text' as const, text: instrucoes },
  ];

  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content }],
    }),
  });

  if (!claudeRes.ok) {
    const t = await claudeRes.text();
    return NextResponse.json({ erro: 'claude', detalhe: t.slice(0, 500) }, { status: 502 });
  }

  const cj = await claudeRes.json();
  const txt = (cj.content?.[0]?.text as string) ?? '';
  const jsonMatch = txt.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ erro: 'resposta-invalida', resposta: txt.slice(0, 500) }, { status: 502 });
  }

  let parsed: { matches: Array<{ imagem: number; slug: string }> };
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json({ erro: 'parse', resposta: txt.slice(0, 500) }, { status: 502 });
  }

  const resultados: Array<{ ficheiro: string; slug: string; ok: boolean; erro?: string }> = [];

  for (const m of parsed.matches ?? []) {
    const idx = m.imagem - 1;
    if (idx < 0 || idx >= imagensB64.length) continue;
    const img = imagensB64[idx];
    const escrito = escritos.find((e) => e.slug === m.slug);
    if (!escrito) {
      resultados.push({ ficheiro: img.nome, slug: m.slug, ok: false, erro: 'slug desconhecido' });
      continue;
    }

    const buf = Buffer.from(img.data, 'base64');
    const ext = img.mediaType.split('/')[1]?.replace(/[^a-z0-9]/g, '') || 'png';
    const storagePath = `${escrito.slug}/capa-${Date.now()}-${idx}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buf, { contentType: img.mediaType, upsert: false });

    if (upErr) {
      resultados.push({ ficheiro: img.nome, slug: m.slug, ok: false, erro: upErr.message });
      continue;
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    const capaUrl = pub.publicUrl;

    const { data: allVersions } = await supabase
      .from('escritos')
      .select('id')
      .eq('slug', escrito.slug);

    for (const v of allVersions ?? []) {
      await supabase
        .from('escritos')
        .update({ capa: capaUrl, updated_at: new Date().toISOString() })
        .eq('id', v.id);
    }

    resultados.push({ ficheiro: img.nome, slug: m.slug, ok: true });
  }

  const ok = resultados.filter((r) => r.ok).length;
  const erros = resultados.filter((r) => !r.ok);

  return NextResponse.json({ ok: true, total: resultados.length, sucesso: ok, erros, resultados });
}
