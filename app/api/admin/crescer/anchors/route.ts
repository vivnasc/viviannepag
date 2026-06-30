import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { BUCKET } from '@/lib/banda/flux';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const maxDuration = 60;

// BANCO DE ÂNCORAS · a "bíblia visual" do mundo dela. Ela CARREGA as imagens
// fundadoras (feitas no MidJourney/ChatGPT) por CATEGORIA; o gerador de teste usa a
// âncora da categoria certa por cena (image_prompt). Guarda em crescer/_anchors/.
const PASTA = 'crescer/_anchors';
// ATLAS VISUAL · categorias por ASPECTO (não por sítio): cada geração herda várias
// (roupa + objetos + atividade) como referência. É a "língua" do mundo dela.
const CATEGORIAS_ANCORA = ['arquitectura', 'roupa', 'objectos', 'infancia', 'aprendizagem', 'animais', 'refeicoes', 'mercado', 'pessoas', 'interior'] as const;
const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();

// POST { dataUrl, categoria } — carrega uma âncora (reduz a 1024px, guarda).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { dataUrl?: string; categoria?: string };
  const cat = slug(body.categoria ?? '');
  if (!body.dataUrl || !cat) return NextResponse.json({ erro: 'falta dataUrl/categoria' }, { status: 400 });
  const m = body.dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
  if (!m) return NextResponse.json({ erro: 'dataUrl-invalido' }, { status: 400 });
  let buf: Buffer;
  try { buf = await sharp(Buffer.from(m[1], 'base64')).resize({ width: 1024, withoutEnlargement: true }).jpeg({ quality: 84 }).toBuffer(); }
  catch { return NextResponse.json({ erro: 'imagem-invalida' }, { status: 400 }); }
  const supabase = getSupabaseAdmin();
  const path = `${PASTA}/${cat}__${Date.now()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, buf, { contentType: 'image/jpeg', upsert: true });
  if (error) return NextResponse.json({ erro: 'upload', detalhe: error.message }, { status: 500 });
  const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  return NextResponse.json({ ok: true, anchor: { url, categoria: cat, path } });
}

// GET — lista todas as âncoras (agrupáveis por categoria no frontend).
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(BUCKET).list(PASTA, { limit: 500, sortBy: { column: 'name', order: 'desc' } });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  const anchors = (data ?? [])
    .filter((f) => f.name.toLowerCase().endsWith('.jpg'))
    .map((f) => ({
      url: supabase.storage.from(BUCKET).getPublicUrl(`${PASTA}/${f.name}`).data.publicUrl,
      categoria: f.name.split('__')[0] || '',
      path: `${PASTA}/${f.name}`,
    }));
  return NextResponse.json({ ok: true, anchors, categorias: CATEGORIAS_ANCORA });
}

// DELETE { path } — apaga uma âncora.
export async function DELETE(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { path?: string };
  if (!body.path || !body.path.startsWith(PASTA + '/')) return NextResponse.json({ erro: 'path-invalido' }, { status: 400 });
  const supabase = getSupabaseAdmin();
  await supabase.storage.from(BUCKET).remove([body.path]);
  return NextResponse.json({ ok: true });
}
