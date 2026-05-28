import { NextResponse } from 'next/server';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const CAPAS_DIR = path.join(process.cwd(), 'ESCRITOS-CAPAS');
const BUCKET = 'capas';

const MAPA: Array<{ keyword: string; slug: string }> = [
  { keyword: 'sealed_glass_bottle', slug: 'o-dia-em-que-deixaste-de-te-explicar' },
  { keyword: 'ceramic_bowl_broken', slug: 'dizer-nao-e-o-primeiro-sim-que-te-das' },
  { keyword: 'half-finished_watercolor', slug: 'a-beleza-de-seres-vista-a-meio' },
  { keyword: 'single_feather_resting', slug: 'a-gentileza-que-tens-contigo-quando-ninguem-ve' },
  { keyword: 'aerial_drone_shot', slug: 'a-mulher-que-ja-nao-pede-desculpa-por-existir' },
  { keyword: 'steam_rising', slug: 'acordar-sem-pressa' },
  { keyword: 'butterfly_emerging', slug: 'a-mulher-que-tu-tens-medo-de-ser' },
  { keyword: 'pomegranate_split', slug: 'o-que-tu-nao-te-deixas-querer' },
  { keyword: 'open_notebook', slug: 'o-dia-em-que-paraste-de-te-preparar-para-viver' },
  { keyword: 'dandelion_seeds', slug: 'a-respiracao-que-tu-deixas-a-meio' },
  { keyword: 'potters_wheel', slug: 'o-prazer-de-fazer-uma-coisa-de-cada-vez' },
  { keyword: 'tree_rings', slug: 'o-que-tu-herdaste-sem-dizer-sim' },
  { keyword: 'compass_lying', slug: 'a-lealdade-invisivel-que-te-tira-o-que-queres' },
  { keyword: 'seismograph_needle', slug: 'o-corpo-sabe-primeiro' },
  { keyword: 'driftwood', slug: 'o-no-que-ninguem-te-ensinou-a-ver' },
  { keyword: 'concentric_ripples', slug: 'porque-repetes-o-mesmo-padrao' },
  { keyword: 'washi_pape', slug: 'cada-veu-e-uma-forma-de-te-protegeres' },
  { keyword: 'morning_fog', slug: 'atravessar-nao-e-destruir' },
  { keyword: 'cloud_formation', slug: 'a-liberdade-de-nao-ter-de-perceber-tudo' },
  { keyword: 'nest_made_of_dried', slug: 'voltar-a-casa-sem-sair-do-sitio' },
  { keyword: 'paper_boat', slug: 'quando-os-teus-filhos-ja-nao-carregam' },
  { keyword: 'seed_splitting', slug: 'a-mulher-que-escolheu-ficar-rica' },
  { keyword: 'hourglass_lying', slug: 'o-silencio-que-tu-evitas' },
  { keyword: 'river_stones', slug: 'o-amor-que-cabe-quando-tu-cabes' },
];

function matchSlug(filename: string): string | null {
  const lower = filename.toLowerCase();
  for (const { keyword, slug } of MAPA) {
    if (lower.includes(keyword.toLowerCase())) return slug;
  }
  return null;
}

export const maxDuration = 300;

export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();

  const { data: buckets } = await supabase.storage.listBuckets();
  const existe = (buckets ?? []).find((b) => b.name === BUCKET);
  if (!existe) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 10485760,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    });
    if (error) return NextResponse.json({ erro: 'criar-bucket', detalhe: error.message }, { status: 500 });
  } else if (!existe.public) {
    await supabase.storage.updateBucket(BUCKET, { public: true });
  }

  let subfolders: string[];
  try {
    subfolders = await readdir(CAPAS_DIR);
  } catch {
    return NextResponse.json({ erro: 'pasta-ESCRITOS-CAPAS-em-falta' }, { status: 404 });
  }

  const slugsAtribuidos = new Set<string>();
  const detalhes: string[] = [];
  const semMatch: string[] = [];
  let atribuidos = 0;

  for (const sub of subfolders) {
    const subPath = path.join(CAPAS_DIR, sub);
    let files: string[];
    try {
      files = await readdir(subPath);
    } catch {
      continue;
    }

    for (const file of files) {
      if (!file.match(/\.png$/i)) continue;
      const slug = matchSlug(file);
      if (!slug) {
        semMatch.push(`${sub}/${file}`);
        continue;
      }
      if (slugsAtribuidos.has(slug)) {
        detalhes.push(`- ${slug} já tem (saltado: ${file.slice(0, 60)}…)`);
        continue;
      }

      const buf = await readFile(path.join(subPath, file));
      const caminho = `${slug}/capa.png`;

      const { error: errUp } = await supabase.storage
        .from(BUCKET)
        .upload(caminho, buf, { contentType: 'image/png', upsert: true });
      if (errUp) {
        detalhes.push(`✗ ${slug}: ${errUp.message}`);
        continue;
      }

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(caminho);
      const capaUrl = `${pub.publicUrl}?v=${Date.now()}`;

      const { data: versoes } = await supabase.from('escritos').select('id').eq('slug', slug);
      for (const v of versoes ?? []) {
        await supabase
          .from('escritos')
          .update({ capa: capaUrl, updated_at: new Date().toISOString() })
          .eq('id', v.id);
      }
      slugsAtribuidos.add(slug);
      atribuidos++;
      detalhes.push(`✓ ${slug} (${versoes?.length ?? 0} versões)`);
    }
  }

  const slugsEsperados = MAPA.map((m) => m.slug);
  const semCapa = slugsEsperados.filter((s) => !slugsAtribuidos.has(s));

  return NextResponse.json({
    ok: true,
    atribuidos,
    totalEsperado: MAPA.length,
    semCapa,
    semMatch,
    detalhes,
  });
}
