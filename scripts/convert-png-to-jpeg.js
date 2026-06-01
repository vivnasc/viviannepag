#!/usr/bin/env node
/**
 * Converte PNGs existentes em renders/ para JPEG q92 ao lado.
 * Usado para o TikTok que rejeita PNG sem re-correr o render bulk completo.
 *
 * Por cada renders/{jobId}/dia-N/slide-N-tipo.png:
 *   1. Download
 *   2. Converte com sharp (jpeg q92, mozjpeg)
 *   3. Upload .jpg sibling
 *   4. Adiciona a result.json no array uploadedJpg para o renders-fast achar
 *
 * Idempotente: skipa se .jpg ja existe.
 */

const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const BUCKET = 'viviannepag-assets';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function listarJobs() {
  const { data } = await supabase.storage.from(BUCKET).list('renders', { limit: 200 });
  return (data ?? [])
    .map(j => j.name)
    .filter(n => n && (n.startsWith('render-') || n.startsWith('job-')));
}

async function listarDias(jobId) {
  const { data } = await supabase.storage.from(BUCKET).list(`renders/${jobId}`, { limit: 100 });
  return (data ?? []).filter(d => d.name?.startsWith('dia-')).map(d => d.name);
}

async function listarSlides(jobId, dia) {
  const { data } = await supabase.storage.from(BUCKET).list(`renders/${jobId}/${dia}`, { limit: 100 });
  return (data ?? []).filter(f => f.name?.endsWith('.png')).map(f => f.name);
}

async function existeJpg(jobId, dia, jpgName) {
  const { data } = await supabase.storage.from(BUCKET).list(`renders/${jobId}/${dia}`, { limit: 100 });
  return (data ?? []).some(f => f.name === jpgName);
}

async function converterSlide(jobId, dia, pngName) {
  const jpgName = pngName.replace(/\.png$/, '.jpg');
  if (await existeJpg(jobId, dia, jpgName)) {
    return { jobId, dia, png: pngName, jpg: jpgName, skipped: true };
  }

  // Download PNG
  const pngPath = `renders/${jobId}/${dia}/${pngName}`;
  const { data: blob, error: dlErr } = await supabase.storage.from(BUCKET).download(pngPath);
  if (dlErr || !blob) throw new Error(`download ${pngPath}: ${dlErr?.message}`);
  const pngBuf = Buffer.from(await blob.arrayBuffer());

  // Convert via sharp (mozjpeg = melhor compressao perceptual)
  const jpgBuf = await sharp(pngBuf)
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();

  // Upload sibling
  const jpgPath = `renders/${jobId}/${dia}/${jpgName}`;
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(jpgPath, jpgBuf, {
    contentType: 'image/jpeg', upsert: true,
  });
  if (upErr) throw new Error(`upload ${jpgPath}: ${upErr.message}`);

  return { jobId, dia, png: pngName, jpg: jpgName, skipped: false, sizeKb: Math.round(jpgBuf.length / 1024) };
}

async function actualizarResultJson(jobId, novosJpgs) {
  // Le result.json
  try {
    const resPath = `renders/${jobId}/result.json`;
    const { data: blob } = await supabase.storage.from(BUCKET).download(resPath);
    if (!blob) return;
    const result = JSON.parse(await blob.text());
    if (!Array.isArray(result.uploaded)) return;

    // Para cada entry no uploaded com filename .png, adiciona campo urlJpg
    let modified = false;
    for (const entry of [...(result.uploaded ?? []), ...(result.skipped ?? [])]) {
      if (entry.filename?.endsWith('.png')) {
        const jpgFilename = entry.filename.replace(/\.png$/, '.jpg');
        // verifica se gerámos
        const found = novosJpgs.find(j => `${j.dia}/${j.jpg}` === jpgFilename);
        if (found) {
          const jpgPath = `renders/${jobId}/${jpgFilename}`;
          entry.urlJpg = supabase.storage.from(BUCKET).getPublicUrl(jpgPath).data.publicUrl;
          modified = true;
        }
      }
    }

    if (modified) {
      await supabase.storage.from(BUCKET).upload(resPath, Buffer.from(JSON.stringify(result, null, 2)), {
        contentType: 'application/json', upsert: true,
      });
    }
  } catch (e) {
    console.warn(`[result.json ${jobId}]`, e.message);
  }
}

async function main() {
  console.log('[start] conversao PNG -> JPEG');
  const jobs = await listarJobs();
  console.log(`[jobs] ${jobs.length} jobs encontrados`);

  let ok = 0, skipped = 0, falhou = 0;

  for (const jobId of jobs) {
    const dias = await listarDias(jobId);
    if (dias.length === 0) continue;
    const novosJpgs = [];

    for (const dia of dias) {
      const slides = await listarSlides(jobId, dia);
      for (const png of slides) {
        try {
          const r = await converterSlide(jobId, dia, png);
          if (r.skipped) {
            skipped++;
          } else {
            ok++;
            novosJpgs.push(r);
            if (ok % 10 === 0) console.log(`  [${ok}] ${jobId}/${dia}/${r.jpg}`);
          }
        } catch (e) {
          falhou++;
          console.error(`  [erro] ${jobId}/${dia}/${png}: ${e.message}`);
        }
      }
    }

    if (novosJpgs.length > 0) {
      await actualizarResultJson(jobId, novosJpgs);
    }
  }

  console.log(`\n[done] convertidos=${ok} skipados=${skipped} falharam=${falhou}`);
}

main().catch(e => {
  console.error('[fatal]', e);
  process.exit(1);
});
