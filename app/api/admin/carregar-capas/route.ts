import { NextResponse } from 'next/server';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const CAPAS_DIR = path.join(process.cwd(), 'ESCRITOS-CAPAS');
const BUCKET = 'capas';

const MAPA: Record<string, string> = {
  'sealed_glass_bottle': 'o-dia-em-que-deixaste-de-te-explicar',
  'aerial_drone_shot': 'a-mulher-que-ja-nao-pede-desculpa-por-existir',
  'ceramic_bowl_broken': 'dizer-nao-e-o-primeiro-sim-que-te-das',
  'half-finished_watercolor': 'a-beleza-de-seres-vista-a-meio',
  'steam_rising': 'acordar-sem-pressa',
  'feather_resting': 'a-gentileza-que-tens-contigo-quando-ninguem-ve',
  'open_notebook': 'o-dia-em-que-paraste-de-te-preparar-para-viver',
  'potters_wheel': 'o-prazer-de-fazer-uma-coisa-de-cada-vez',
  'dandelion_seeds': 'a-respiracao-que-tu-deixas-a-meio',
  'pomegranate_split': 'o-que-tu-nao-te-deixas-querer',
  'butterfly_emerging': 'a-mulher-que-tu-tens-medo-de-ser',
  'tree_rings': 'o-que-tu-herdaste-sem-dizer-sim',
  'seismograph_needle': 'o-corpo-sabe-primeiro',
  'compass_lying': 'a-lealdade-invisivel-que-te-tira-o-que-queres',
  'driftwood': 'o-no-que-ninguem-te-ensinou-a-ver',
  'concentric_ripples': 'porque-repetes-o-mesmo-padrao',
  'washi_paper': 'cada-veu-e-uma-forma-de-te-protegeres',
  'morning_fog': 'atravessar-nao-e-destruir',
  'bamboo_forest': 'atravessar-nao-e-destruir',
  'nest_made_of_dried': 'voltar-a-casa-sem-sair-do-sitio',
  'hourglass_lying': 'o-silencio-que-tu-evitas',
  'river_stones': 'o-amor-que-cabe-quando-tu-cabes',
  'seed_splitting': 'a-mulher-que-escolheu-ficar-rica',
  'paper_boat': 'quando-os-teus-filhos-ja-nao-carregam',
  'cloud_formation': 'a-liberdade-de-nao-ter-de-perceber-tudo',
};

function matchFilename(filename: string): string | null {
  const lower = filename.toLowerCase();
  for (const [keyword, slug] of Object.entries(MAPA)) {
    if (lower.includes(keyword.toLowerCase())) return slug;
  }
  return null;
}

export const maxDuration = 300;

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ erro: 'auth' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const resultados: Array<{ ficheiro: string; slug: string | null; ok: boolean; erro?: string }> = [];

  let subfolders: string[];
  try {
    subfolders = await readdir(CAPAS_DIR);
  } catch {
    return NextResponse.json({ erro: 'pasta ESCRITOS-CAPAS nao encontrada' }, { status: 404 });
  }

  for (const sub of subfolders) {
    const subPath = path.join(CAPAS_DIR, sub);
    let files: string[];
    try {
      files = await readdir(subPath);
    } catch {
      continue;
    }

    for (const file of files) {
      if (!file.match(/\.(png|jpg|jpeg|webp)$/i)) continue;

      const slug = matchFilename(file);
      if (!slug) {
        resultados.push({ ficheiro: `${sub}/${file}`, slug: null, ok: false, erro: 'sem match' });
        continue;
      }

      const filePath = path.join(subPath, file);
      const buf = await readFile(filePath);
      const ext = path.extname(file).slice(1).toLowerCase();
      const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
      const storagePath = `${slug}/capa-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, buf, { contentType, upsert: false });

      if (upErr) {
        resultados.push({ ficheiro: `${sub}/${file}`, slug, ok: false, erro: upErr.message });
        continue;
      }

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
      const capaUrl = pub.publicUrl;

      const { data: versoes } = await supabase.from('escritos').select('id').eq('slug', slug);
      for (const v of versoes ?? []) {
        await supabase.from('escritos').update({ capa: capaUrl, updated_at: new Date().toISOString() }).eq('id', v.id);
      }

      resultados.push({ ficheiro: `${sub}/${file}`, slug, ok: true });
    }
  }

  const ok = resultados.filter((r) => r.ok).length;
  const falhou = resultados.filter((r) => !r.ok);
  return NextResponse.json({ ok: true, total: resultados.length, sucesso: ok, falhou, resultados });
}
