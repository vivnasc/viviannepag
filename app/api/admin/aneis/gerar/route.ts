import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST — cria a coleccao de ANEIS (7 destaques + foto de perfil). Sem pool:
// fundo transcendente desenhado (mandala) por defeito + prompt MJ por anel para
// quem quiser arrastar uma imagem propria. formato='aneis'. Render -> 1080x1080.
const ANEIS: { label: string; mj: string }[] = [
  { label: 'Transpessoal', mj: 'ethereal cosmic nebula, deep indigo and violet with soft golden starlight, translucent veils of light, volumetric god rays, transcendent and serene, fine art spiritual photography, ultra detailed, no people, no text, no logo --ar 1:1 --style raw' },
  { label: 'Constelação', mj: 'luminous golden threads and roots of light weaving through deep darkness, an interconnected glowing web, faint sacred geometry, ethereal and quiet, fine art, ultra detailed, no people, no text, no logo --ar 1:1 --style raw' },
  { label: 'Espiritualidade', mj: 'soft dawn light breaking through misty veils, a single luminous lotus, golden glow on deep blue, transcendent peaceful, fine art, ultra detailed, no people, no text, no logo --ar 1:1 --style raw' },
  { label: 'Desenvolvimento', mj: 'warm soft sunrise over a calm still horizon, gentle golden light, hopeful and serene, minimal fine art landscape, ultra detailed, no people, no text, no logo --ar 1:1 --style raw' },
  { label: 'Glossário', mj: 'a rising translucent veil of golden mist and light against deep indigo, abstract, soft sacred dreamlike, fine art, ultra detailed, no people, no text, no logo --ar 1:1 --style raw' },
  { label: 'Padrões', mj: 'luminous concentric circles and a repeating geometric pattern of golden light on deep navy, hypnotic sacred symmetry, fine art, ultra detailed, no people, no text, no logo --ar 1:1 --style raw' },
  { label: 'Sobre', mj: 'warm ethereal golden light through soft fog, gentle luminous glow, abstract sacred calm, deep tones, fine art, ultra detailed, no people, no text, no logo --ar 1:1 --style raw' },
];
const PERFIL_MJ = 'a single luminous mandala of overlapping translucent veils, radiant gold light at the centre on a deep navy cosmos, sacred and symmetrical, ethereal, fine art, ultra detailed, centered composition, no people, no text, no logo --ar 1:1 --style raw';

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
  // recriar substitui: apaga coleccoes de aneis antigas (so fica a nova)
  try {
    const { data: velhas } = await supabase.from('carousel_collections').select('slug, theme');
    const apagar = (velhas ?? []).filter((c) => (c.theme as { formato?: string } | null)?.formato === 'aneis').map((c) => c.slug);
    if (apagar.length) await supabase.from('carousel_collections').delete().in('slug', apagar);
  } catch { /* segue */ }

  const { data, error } = await supabase
    .from('carousel_collections')
    .upsert({ slug, title: 'Anéis · Véu a Véu', brief: 'destaques + perfil', dias, theme: { formato: 'aneis', mundo } }, { onConflict: 'slug' })
    .select().single();
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, coleccao: data });
}
