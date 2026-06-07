import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { listarPoolImagens, imagensUsadas } from '@/lib/carrossel/pool-server';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST — cria a coleccao de ANEIS (7 destaques + foto de perfil) com imagens
// transcendentes do pool. formato='aneis'. Render -> 1080x1080.
const ANEIS = ['Transpessoal', 'Constelação', 'Ordens do Amor', 'Espiritualidade', 'Padrões', 'Glossário', 'Sobre'];

export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const mundo = 'escola'; // paleta navy/lavanda (transcendente)
  let pool: string[] = [];
  try {
    const todas = await listarPoolImagens(mundo);
    const usadas = await imagensUsadas();
    pool = [...todas.filter((u) => !usadas.has(u)), ...todas];
  } catch { /* sem pool */ }

  const itens = [...ANEIS.map((label) => ({ label, perfil: false })), { label: 'Véu a Véu', perfil: true }];
  const dias = itens.map((it, i) => ({
    dia: i + 1,
    mundo,
    palavra: it.label,
    slides: [{ tipo: it.perfil ? 'perfil' : 'anel', label: it.label, perfil: it.perfil, imageUrl: pool.length ? pool[i % pool.length] : undefined }],
  }));

  const slug = `aneis-${Date.now()}`;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .upsert({ slug, title: 'Anéis · Véu a Véu', brief: 'destaques + perfil', dias, theme: { formato: 'aneis', mundo } }, { onConflict: 'slug' })
    .select().single();
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, coleccao: data });
}
