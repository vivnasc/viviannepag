import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const maxDuration = 60;

const BUCKET = 'viviannepag-assets';

// POST (multipart) { ficheiro: imagem, lang: 'pt'|'en', slug } — a Vivianne faz
// upload da capa que fez FORA do site (imagem final, já com título). Guarda-a
// como a capa do livro: livro-pilar/<slug>/capa-composta(-en).png. A home, a
// loja e o render do PDF passam a usar esta imagem. slug: os-7-sinais | os-7-veus.
const SLUGS = ['os-7-sinais', 'os-7-veus'];
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  try {
    const form = await req.formData();
    const file = form.get('ficheiro');
    const lang = (form.get('lang') as string) === 'en' ? 'en' : 'pt';
    const slug = SLUGS.includes(form.get('slug') as string) ? (form.get('slug') as string) : 'os-7-sinais';
    if (!(file instanceof Blob)) return NextResponse.json({ erro: 'sem-ficheiro' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const tipo = file.type && file.type.startsWith('image/') ? file.type : 'image/png';
    const path = `livro-pilar/${slug}/capa-composta${lang === 'en' ? '-en' : ''}.png`;

    const sb = getSupabaseAdmin();
    const { data: existing } = await sb.storage.getBucket(BUCKET);
    if (!existing) await sb.storage.createBucket(BUCKET, { public: true });

    const { error } = await sb.storage.from(BUCKET).upload(path, buffer, { contentType: tipo, upsert: true });
    if (error) return NextResponse.json({ erro: `upload: ${error.message}` }, { status: 502 });

    const url = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    return NextResponse.json({ url: `${url}?v=${Date.now()}` });
  } catch (e) {
    return NextResponse.json({ erro: (e as Error).message }, { status: 500 });
  }
}
