import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

const BUCKET = 'viviannepag-assets';

// a conta de um fundo, inferida do slug da pasta (best-effort). Os fundos cujo
// slug não revela a conta ficam como null e mostram-se SEMPRE (nunca se escondem).
function contaDoSlug(slug: string): string | null {
  const m = slug.match(/^metodo-(?:ia-|frase-)?(mae|ver|vir|viver)-/);
  return m ? m[1] : null;
}

// GET ?conta= : FUNDOS já guardados — lidos DIRETO do Storage (metodo/<slug>/...),
// NÃO dos posts. Assim os fundos de posts APAGADOS continuam a aparecer (os
// ficheiros sobrevivem ao apagar): a Vivianne não perde as imagens lindas.
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const conta = new URL(req.url).searchParams.get('conta') ?? '';

  const sb = getSupabaseAdmin();
  // 1) pastas dentro de metodo/ (cada uma = um slug)
  const { data: pastas, error } = await sb.storage.from(BUCKET).list('metodo', { limit: 1000, sortBy: { column: 'name', order: 'desc' } });
  if (error) return NextResponse.json({ erro: 'storage', detalhe: error.message }, { status: 500 });

  const fundos: { url: string; slug: string; conta: string | null; criadoEm: string | null }[] = [];
  for (const p of pastas ?? []) {
    if (!p.name) continue;
    // entradas com id null = pastas; mesmo que venha um ficheiro à mistura, o filtro abaixo trata
    const slug = p.name;
    const { data: files } = await sb.storage.from(BUCKET).list(`metodo/${slug}`, { limit: 100, sortBy: { column: 'name', order: 'desc' } });
    for (const f of files ?? []) {
      if (!/\.(jpe?g|png|webp)$/i.test(f.name)) continue;
      const path = `metodo/${slug}/${f.name}`;
      const url = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      fundos.push({ url, slug, conta: contaDoSlug(slug), criadoEm: (f as { created_at?: string }).created_at ?? null });
    }
  }

  // filtro por conta LENIENTE: mostra os da conta + os de conta desconhecida
  // (nunca esconde tudo; o objetivo é não perder imagens).
  const lista = conta ? fundos.filter((f) => f.conta === conta || f.conta === null) : fundos;
  lista.sort((a, b) => (b.criadoEm ?? '').localeCompare(a.criadoEm ?? ''));
  return NextResponse.json({ ok: true, fundos: lista });
}
