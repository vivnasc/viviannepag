import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { comporFotoLivro, type Colocacao } from '@/lib/crescer/livro-foto';

export const runtime = 'nodejs';
export const maxDuration = 60;
const BUCKET = 'viviannepag-assets';
const CENAS = 'crescer/livro-cenas';   // cenas vazias (MJ): livro em branco sobre linho/café/janela
const PAGS = 'crescer/livro-paginas';  // páginas reais exportadas do PDF
const SAIDA = 'crescer/livro-fotos';   // as fotos compostas, prontas

const extDe = (t: string) => (t.includes('png') ? 'png' : t.includes('webp') ? 'webp' : 'jpg');
const listar = async (sb: ReturnType<typeof getSupabaseAdmin>, dir: string): Promise<string[]> => {
  const { data } = await sb.storage.from(BUCKET).list(dir, { limit: 300, sortBy: { column: 'created_at', order: 'desc' } });
  return (data ?? []).filter((x) => x.name && !x.name.startsWith('.')).map((x) => sb.storage.from(BUCKET).getPublicUrl(`${dir}/${x.name}`).data.publicUrl);
};

// GET — cenas disponíveis + fotos já feitas.
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const sb = getSupabaseAdmin();
  const [cenas, fotos] = await Promise.all([listar(sb, CENAS).catch(() => []), listar(sb, SAIDA).catch(() => [])]);
  return NextResponse.json({ cenas, fotos });
}

// POST multipart { file, tipo: 'cena'|'pagina' } — sobe uma cena (banco) ou uma página.
// POST json { paginaUrl, cenaUrl, colocacao, guardar? } — COMPÕE (texto real preservado)
//   e devolve pré-ver (base64) ou, se guardar, a foto final guardada.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const sb = getSupabaseAdmin();
  const ct = req.headers.get('content-type') || '';

  if (ct.includes('multipart')) {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const tipo = String(form.get('tipo') ?? 'cena');
    if (!file) return NextResponse.json({ erro: 'file' }, { status: 400 });
    const dir = tipo === 'pagina' ? PAGS : CENAS;
    const path = `${dir}/${Date.now()}-${Math.round(Math.random() * 1e6)}.${extDe(file.type)}`;
    const { error } = await sb.storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type || 'image/jpeg', upsert: true });
    if (error) return NextResponse.json({ erro: 'upload', detalhe: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, url: sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl, tipo });
  }

  const body = (await req.json().catch(() => ({}))) as { paginaUrl?: string; cenaUrl?: string; colocacao?: Colocacao; guardar?: boolean };
  if (!body.paginaUrl || !body.cenaUrl) return NextResponse.json({ erro: 'faltam-imagens' }, { status: 400 });
  try {
    const [pg, cn] = await Promise.all([fetch(body.paginaUrl), fetch(body.cenaUrl)]);
    if (!pg.ok || !cn.ok) return NextResponse.json({ erro: 'download' }, { status: 502 });
    const jpg = await comporFotoLivro(Buffer.from(await pg.arrayBuffer()), Buffer.from(await cn.arrayBuffer()), { colocacao: body.colocacao });
    if (body.guardar) {
      const path = `${SAIDA}/${Date.now()}-${Math.round(Math.random() * 1e6)}.jpg`;
      const { error } = await sb.storage.from(BUCKET).upload(path, jpg, { contentType: 'image/jpeg', upsert: true });
      if (error) return NextResponse.json({ erro: 'guardar', detalhe: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, url: sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl });
    }
    return NextResponse.json({ ok: true, preview: `data:image/jpeg;base64,${jpg.toString('base64')}` });
  } catch (e) {
    return NextResponse.json({ erro: 'compor', detalhe: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
