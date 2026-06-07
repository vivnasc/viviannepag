import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST — cria a coleccao de ANEIS (7 destaques + foto de perfil). Sem pool:
// fundo transcendente desenhado (mandala) por defeito + prompt MJ por anel para
// quem quiser arrastar uma imagem propria. formato='aneis'. Render -> 1080x1080.
const ANEIS: { label: string; mj: string }[] = [
  { label: 'Transpessoal', mj: 'ethereal cosmos, soft nebula and starlight, deep navy and lavender glow, transcendent sacred atmosphere, no people, no text --ar 1:1' },
  { label: 'Constelação', mj: 'luminous golden roots and threads of light in deep darkness, sacred filaments, transcendent, no people, no text --ar 1:1' },
  { label: 'Ordens do Amor', mj: 'calm reflective water with golden light, gentle ripples meeting, serene transcendent, no people, no text --ar 1:1' },
  { label: 'Espiritualidade', mj: 'soft dawn light through mist, single lotus, golden ethereal glow, transcendent, no people, no text --ar 1:1' },
  { label: 'Padrões', mj: 'sacred geometry mandala of light, concentric gold lines on deep navy, transcendent, no people, no text --ar 1:1' },
  { label: 'Glossário', mj: 'a rising veil of golden light and mist, abstract sacred atmosphere, transcendent, no people, no text --ar 1:1' },
  { label: 'Sobre', mj: 'warm ethereal golden light, soft sacred glow, abstract, transcendent, no people, no text --ar 1:1' },
];
const PERFIL_MJ = 'luminous mandala of veils, gold light on deep navy, sacred centered glow, transcendent, no people, no text --ar 1:1';

export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const mundo = 'escola'; // paleta navy/lavanda (transcendente)
  const itens = [...ANEIS.map((a) => ({ label: a.label, perfil: false, mj: a.mj })), { label: 'Véu a Véu', perfil: true, mj: PERFIL_MJ }];
  const dias = itens.map((it, i) => ({
    dia: i + 1,
    mundo,
    palavra: it.label,
    slides: [{ tipo: it.perfil ? 'perfil' : 'anel', label: it.label, perfil: it.perfil, notaVisual: it.mj }],
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
