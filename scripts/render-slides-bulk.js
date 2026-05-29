#!/usr/bin/env node
/**
 * Render todos os slides do calendario de 30 dias usando Puppeteer.
 * Navega para SITE_URL/render-slide?dia=N&idx=I&layout=... e screenshot.
 * Upload PNGs para Supabase. Cria ZIP final.
 *
 * Env vars necessarias:
 *  SITE_URL — URL publica do site (ex: https://viviannepag.vercel.app)
 *  SUPABASE_URL
 *  SUPABASE_SERVICE_ROLE_KEY
 *  JOB_ID — id unico do job (timestamp)
 */

const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');
const path = require('node:path');
const fs = require('node:fs/promises');

const SITE_URL = process.env.SITE_URL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JOB_ID = process.env.JOB_ID || `job-${Date.now()}`;
const BUCKET = 'viviannepag-assets';
const RENDER_FOLDER = `renders/${JOB_ID}`;

if (!SITE_URL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing env vars: SITE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function getManifest() {
  // Carregar do source code o calendario (compilado pelo Next, mas em CI carregamos do TS)
  // Para simplicidade: o workflow descarrega um manifest JSON gerado pelo endpoint
  const manifestUrl = `${SITE_URL}/api/admin/estudio/render-manifest?jobId=${JOB_ID}`;
  const res = await fetch(manifestUrl);
  if (!res.ok) throw new Error(`manifest ${res.status}`);
  return res.json();
}

async function uploadResult(status, data = {}) {
  const result = {
    jobId: JOB_ID,
    status,
    timestamp: new Date().toISOString(),
    ...data,
  };
  const json = JSON.stringify(result, null, 2);
  await supabase.storage
    .from(BUCKET)
    .upload(`${RENDER_FOLDER}/result.json`, Buffer.from(json), {
      contentType: 'application/json',
      upsert: true,
    });
  console.log('[result]', status, JSON.stringify(data));
}

async function main() {
  console.log(`[start] job=${JOB_ID} site=${SITE_URL}`);
  await uploadResult('a-renderizar', { progress: 0, total: 0 });

  let manifest;
  try {
    manifest = await getManifest();
  } catch (e) {
    await uploadResult('erro', { erro: `manifest: ${e.message}` });
    process.exit(1);
  }

  const tarefas = manifest.tarefas;
  console.log(`[manifest] ${tarefas.length} slides para renderizar`);
  await uploadResult('a-renderizar', { progress: 0, total: tarefas.length });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  const uploaded = [];
  let feitos = 0;

  for (const tarefa of tarefas) {
    const { dia, idx, layout, tipo, imageUrl } = tarefa;
    const url = new URL(`${SITE_URL}/render-slide`);
    url.searchParams.set('dia', String(dia));
    url.searchParams.set('idx', String(idx));
    if (layout) url.searchParams.set('layout', layout);
    if (imageUrl) url.searchParams.set('imageUrl', imageUrl);

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });

    try {
      await page.goto(url.toString(), { waitUntil: 'networkidle0', timeout: 30000 });
      // Aguardar fontes
      await page.evaluate(() => document.fonts.ready);
      // Margem extra para gradientes/grain
      await new Promise(r => setTimeout(r, 800));

      const buffer = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width: 1080, height: 1350 },
      });

      const filename = `dia-${String(dia).padStart(2, '0')}/slide-${String(idx + 1).padStart(2, '0')}-${tipo}.png`;
      const filePath = `${RENDER_FOLDER}/${filename}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, buffer, { contentType: 'image/png', upsert: true });
      if (upErr) throw new Error(upErr.message);

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      uploaded.push({ dia, idx, tipo, layout, filename, url: urlData.publicUrl });
      console.log(`[ok] dia-${dia} slide-${idx + 1} ${tipo}`);
    } catch (e) {
      console.error(`[erro] dia-${dia} slide-${idx + 1}:`, e.message);
    } finally {
      await page.close();
    }

    feitos++;
    if (feitos % 5 === 0 || feitos === tarefas.length) {
      await uploadResult('a-renderizar', { progress: feitos, total: tarefas.length, uploaded: uploaded.length });
    }
  }

  await browser.close();

  // ZIP
  console.log('[zip] a empacotar...');
  const JSZip = require('jszip');
  const zip = new JSZip();

  // Descarregar cada PNG e adicionar ao ZIP
  for (const u of uploaded) {
    const r = await fetch(u.url);
    const buf = Buffer.from(await r.arrayBuffer());
    zip.file(u.filename, buf);
  }

  // Adicionar manifest no ZIP
  zip.file('manifest.json', JSON.stringify({
    jobId: JOB_ID,
    geradoEm: new Date().toISOString(),
    total: uploaded.length,
    files: uploaded.map(u => u.filename),
  }, null, 2));

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  const zipPath = `${RENDER_FOLDER}/viviannepag-${JOB_ID}.zip`;
  const { error: zipErr } = await supabase.storage
    .from(BUCKET)
    .upload(zipPath, zipBuffer, { contentType: 'application/zip', upsert: true });
  if (zipErr) {
    await uploadResult('erro', { erro: `zip upload: ${zipErr.message}` });
    process.exit(1);
  }

  const { data: zipUrlData } = supabase.storage.from(BUCKET).getPublicUrl(zipPath);
  console.log(`[done] zip: ${zipUrlData.publicUrl}`);

  await uploadResult('feito', {
    progress: uploaded.length,
    total: tarefas.length,
    zipUrl: zipUrlData.publicUrl,
    images: uploaded,
  });
}

main().catch(async (e) => {
  console.error(e);
  await uploadResult('erro', { erro: e.message });
  process.exit(1);
});
