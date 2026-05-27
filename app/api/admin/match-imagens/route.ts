import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'escritos';
const BATCH_SIZE = 4;

export const maxDuration = 300;

type Match = { imagem: number; slug: string };

async function matchBatch(
  imagens: Array<{ mediaType: string; data: string; nome: string; globalIdx: number }>,
  listaEscritos: string,
  apiKey: string
): Promise<Match[]> {
  const content = [
    ...imagens.map((img) => ({
      type: 'image' as const,
      source: { type: 'base64' as const, media_type: img.mediaType, data: img.data },
    })),
    {
      type: 'text' as const,
      text: `Tens ${imagens.length} imagens numeradas (1 a ${imagens.length}).

Escritos disponíveis:
${listaEscritos}

Para CADA imagem, decide qual escrito corresponde melhor pelo conteúdo visual.
Cada escrito só pode ser usado UMA vez.
Responde APENAS com JSON: {"matches":[{"imagem":1,"slug":"..."},{"imagem":2,"slug":"..."}]}`,
    },
  ];

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content }],
    }),
  });

  if (!res.ok) return [];
  const json = await res.json();
  const txt = (json.content?.[0]?.text as string) ?? '';
  const m = txt.match(/\{[\s\S]*\}/);
  if (!m) return [];
  try {
    const parsed = JSON.parse(m[0]) as { matches: Array<{ imagem: number; slug: string }> };
    return (parsed.matches ?? []).map((x) => ({
      imagem: imagens[x.imagem - 1]?.globalIdx ?? x.imagem,
      slug: x.slug,
    }));
  } catch {
    return [];
  }
}

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

  const imagensAll: Array<{ mediaType: string; data: string; nome: string; globalIdx: number }> = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const buf = Buffer.from(await f.arrayBuffer());
    imagensAll.push({ mediaType: f.type || 'image/png', data: buf.toString('base64'), nome: f.name, globalIdx: i });
  }

  const usados = new Set<string>();
  const listaBase = escritos
    .map((e, i) => `${i + 1}. slug="${e.slug}" | "${e.titulo}" | ${e.tematica ?? ''} | ${e.resumo}`)
    .join('\n');

  const allMatches: Match[] = [];

  for (let start = 0; start < imagensAll.length; start += BATCH_SIZE) {
    const batch = imagensAll.slice(start, start + BATCH_SIZE);
    const listaFiltrada = escritos
      .filter((e) => !usados.has(e.slug as string))
      .map((e, i) => `${i + 1}. slug="${e.slug}" | "${e.titulo}" | ${e.tematica ?? ''} | ${e.resumo}`)
      .join('\n');

    const matches = await matchBatch(batch, listaFiltrada, apiKey);
    for (const m of matches) {
      if (m.slug) usados.add(m.slug);
      allMatches.push(m);
    }
  }

  const resultados: Array<{ ficheiro: string; slug: string; ok: boolean; erro?: string }> = [];

  for (const m of allMatches) {
    const img = imagensAll[m.imagem];
    if (!img) continue;
    const escrito = escritos.find((e) => e.slug === m.slug);
    if (!escrito) {
      resultados.push({ ficheiro: img.nome, slug: m.slug, ok: false, erro: 'slug desconhecido' });
      continue;
    }

    const buf = Buffer.from(img.data, 'base64');
    const ext = img.mediaType.split('/')[1]?.replace(/[^a-z0-9]/g, '') || 'png';
    const storagePath = `${escrito.slug}/capa-${Date.now()}-${m.imagem}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buf, { contentType: img.mediaType, upsert: false });

    if (upErr) {
      resultados.push({ ficheiro: img.nome, slug: m.slug, ok: false, erro: upErr.message });
      continue;
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    const capaUrl = pub.publicUrl;

    const { data: allVersions } = await supabase.from('escritos').select('id').eq('slug', escrito.slug);
    for (const v of allVersions ?? []) {
      await supabase.from('escritos').update({ capa: capaUrl, updated_at: new Date().toISOString() }).eq('id', v.id);
    }

    resultados.push({ ficheiro: img.nome, slug: m.slug, ok: true });
  }

  const ok = resultados.filter((r) => r.ok).length;
  return NextResponse.json({ ok: true, total: resultados.length, sucesso: ok, erros: resultados.filter((r) => !r.ok), resultados });
}
