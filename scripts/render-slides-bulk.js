#!/usr/bin/env node
/**
 * Render todos os slides do calendario.
 * Resiliente: skipa slides ja feitos, reporta progresso por slide,
 * tracking de falhas individuais.
 */

const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');

const SITE_URL = process.env.SITE_URL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JOB_ID = process.env.JOB_ID || `job-${Date.now()}`;
const BUCKET = 'viviannepag-assets';
const RENDER_FOLDER = `renders/${JOB_ID}`;

if (!SITE_URL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing env: SITE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function getManifest() {
  const res = await fetch(`${SITE_URL}/api/admin/estudio/render-manifest?jobId=${JOB_ID}`);
  if (!res.ok) throw new Error(`manifest ${res.status}: ${await res.text()}`);
  return res.json();
}

let lastResultWrite = 0;
async function writeResult(result, force = false) {
  // Throttle: max 1 write/2s salvo se force=true
  const now = Date.now();
  if (!force && now - lastResultWrite < 2000) return;
  lastResultWrite = now;

  const json = JSON.stringify(result, null, 2);
  try {
    await supabase.storage.from(BUCKET).upload(`${RENDER_FOLDER}/result.json`, Buffer.from(json), {
      contentType: 'application/json',
      upsert: true,
    });
  } catch (e) {
    console.warn('result.json write failed:', e.message);
  }
}

async function ficheiroExiste(filePath) {
  const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
  const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
  try {
    const { data } = await supabase.storage.from(BUCKET).list(dirPath, { limit: 100 });
    return data?.some(f => f.name === fileName) ?? false;
  } catch {
    return false;
  }
}

async function main() {
  console.log(`[start] job=${JOB_ID} site=${SITE_URL}`);

  let manifest;
  try {
    manifest = await getManifest();
  } catch (e) {
    await writeResult({ jobId: JOB_ID, status: 'erro', erro: `manifest: ${e.message}` }, true);
    process.exit(1);
  }

  let tarefas = manifest.tarefas;

  // Filtro de dias opcional (DIAS_FILTER="1" ou "1,2,3")
  const diasFilter = process.env.DIAS_FILTER;
  if (diasFilter && diasFilter.trim()) {
    const diasAllowed = diasFilter.split(',').map(d => Number(d.trim())).filter(d => !isNaN(d));
    if (diasAllowed.length > 0) {
      tarefas = tarefas.filter(t => diasAllowed.includes(t.dia));
      console.log(`[filtro] dias: ${diasAllowed.join(',')} -> ${tarefas.length} tarefas`);
    }
  }
  console.log(`[manifest] ${tarefas.length} slides para processar`);

  const result = {
    jobId: JOB_ID,
    status: 'a-renderizar',
    progress: 0,
    total: tarefas.length,
    uploaded: [],
    skipped: [],
    failed: [],
    iniciadoEm: new Date().toISOString(),
  };
  await writeResult(result, true);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  for (const tarefa of tarefas) {
    const { dia, idx, layout, tipo, imageUrl } = tarefa;
    const filename = `dia-${String(dia).padStart(2, '0')}/slide-${String(idx + 1).padStart(2, '0')}-${tipo}.png`;
    const filePath = `${RENDER_FOLDER}/${filename}`;

    // Idempotencia: skip se ficheiro ja existe
    if (await ficheiroExiste(filePath)) {
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      result.skipped.push({ dia, idx, tipo, filename, url: urlData.publicUrl });
      result.progress++;
      console.log(`[skip] ${filename} (ja existe)`);
      await writeResult(result);
      continue;
    }

    const url = new URL(`${SITE_URL}/render-slide`);
    url.searchParams.set('dia', String(dia));
    url.searchParams.set('idx', String(idx));
    if (layout) url.searchParams.set('layout', layout);
    if (imageUrl) url.searchParams.set('imageUrl', imageUrl);

    const page = await browser.newPage();
    // Render no tamanho preview (270x338) com deviceScaleFactor 4 -> PNG 1080x1352
    // Bypass de zoom/scale: pagina renderiza nativo, screenshot e captado em alta densidade
    await page.setViewport({ width: 270, height: 338, deviceScaleFactor: 4 });

    try {
      await page.goto(url.toString(), { waitUntil: 'networkidle0', timeout: 45000 });
      // Aguardar slide ready (sinal do page.tsx apos imagem carregada + setData)
      await page.waitForSelector('body[data-slide-ready="true"]', { timeout: 30000 }).catch(() => {});
      // Aguardar fontes
      await page.evaluate(() => document.fonts.ready);
      // Margem extra para gradientes/grain e imagem render
      await new Promise(r => setTimeout(r, 1200));

      const buffer = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width: 270, height: 338 },
      });

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, buffer, { contentType: 'image/png', upsert: true });
      if (upErr) throw new Error(`upload: ${upErr.message}`);

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      result.uploaded.push({ dia, idx, tipo, filename, url: urlData.publicUrl });
      console.log(`[ok] ${filename}`);
    } catch (e) {
      result.failed.push({ dia, idx, tipo, filename, erro: e.message });
      console.error(`[erro] ${filename}: ${e.message}`);
    } finally {
      await page.close();
    }

    result.progress++;
    await writeResult(result); // every slide (throttled to 2s)
  }

  await browser.close();

  // ZIP de tudo (uploaded + skipped)
  console.log('[zip] a empacotar...');
  result.status = 'a-empacotar';
  await writeResult(result, true);

  const todosFicheiros = [...result.uploaded, ...result.skipped];
  let zipUrl = null;
  try {
    const JSZip = require('jszip');
    const zip = new JSZip();
    for (const u of todosFicheiros) {
      try {
        const r = await fetch(u.url);
        const buf = Buffer.from(await r.arrayBuffer());
        zip.file(u.filename, buf);
      } catch (e) {
        console.warn(`zip skip ${u.filename}: ${e.message}`);
      }
    }
    zip.file('manifest.json', JSON.stringify({
      jobId: JOB_ID,
      geradoEm: new Date().toISOString(),
      total: todosFicheiros.length,
      failed: result.failed.length,
      files: todosFicheiros.map(u => u.filename),
    }, null, 2));

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });
    const zipPath = `${RENDER_FOLDER}/viviannepag-${JOB_ID}.zip`;
    const { error: zipErr } = await supabase.storage.from(BUCKET).upload(zipPath, zipBuffer, {
      contentType: 'application/zip',
      upsert: true,
    });
    if (zipErr) throw new Error(zipErr.message);
    zipUrl = supabase.storage.from(BUCKET).getPublicUrl(zipPath).data.publicUrl;
    console.log(`[done] zip: ${zipUrl}`);
  } catch (e) {
    console.error('[zip-fail]', e.message);
    result.zipErro = e.message;
  }

  result.status = result.failed.length > 0 ? 'feito-com-falhas' : 'feito';
  result.zipUrl = zipUrl;
  result.terminadoEm = new Date().toISOString();
  await writeResult(result, true);
}

main().catch(async (e) => {
  console.error('[fatal]', e);
  await writeResult({
    jobId: JOB_ID,
    status: 'erro',
    erro: e.message,
    terminadoEm: new Date().toISOString(),
  }, true);
  process.exit(1);
});
