import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

const BUCKET = 'viviannepag-assets';

// BIBLIOTECA de animações já geradas (clips do Kling em anuncios/). Para ela
// REUTILIZAR um clip que já existe num plano, em vez de gerar outro igual (zero
// desperdício — pedido dela: "já existe uma animação que serve, só escolher").
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.storage.from(BUCKET).list('anuncios', {
    limit: 200, sortBy: { column: 'created_at', order: 'desc' },
  });
  if (error) return NextResponse.json({ clips: [] });
  const clips = (data ?? [])
    .filter((f) => f.name.startsWith('motion-') && f.name.endsWith('.mp4'))
    .map((f) => ({
      nome: f.name,
      url: sb.storage.from(BUCKET).getPublicUrl(`anuncios/${f.name}`).data.publicUrl,
      criado: (f as { created_at?: string }).created_at ?? null,
    }));
  return NextResponse.json({ clips });
}
