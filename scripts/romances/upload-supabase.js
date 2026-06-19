// Publica os PDFs finais e as capas compostas do romance no bucket público,
// para os botões de download da aba Romances da Editora.
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { LIVROS } = require('./livros');

const BUCKET_PUBLICO = 'viviannepag-assets';
const BUCKET_PRIVADO = 'romances'; // bucket privado próprio, sem lista de mimes
const SLUG = process.argv[2] || process.env.SLUG || 'rom-01-amparo';
const BASE = path.join(__dirname, '..', '..', 'ficcao-plano');

const L = LIVROS[SLUG];
if (!L) throw new Error(`slug desconhecido: ${SLUG} (ver scripts/romances/livros.js)`);

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// PDFs no bucket privado (saem só pelo /api/romance-download da casa);
// capas compostas no público (og image da landing).
// Ficheiros EN só existem para livros já traduzidos; os que faltam saltam-se.
const FICHEIROS = [
  [L.outPt, BUCKET_PRIVADO, `romances/${SLUG}/livro-pt.pdf`, 'application/pdf'],
  [L.outEn, BUCKET_PRIVADO, `romances/${SLUG}/livro-en.pdf`, 'application/pdf'],
  [`${L.capa}-pt.png`, BUCKET_PUBLICO, `romances/${SLUG}/capa-composta-pt.png`, 'image/png'],
  [`${L.capa}-en.png`, BUCKET_PUBLICO, `romances/${SLUG}/capa-composta-en.png`, 'image/png'],
];

(async () => {
  // garante o bucket privado dos romances
  const { data: existe } = await supabase.storage.getBucket(BUCKET_PRIVADO);
  if (!existe) {
    const { error } = await supabase.storage.createBucket(BUCKET_PRIVADO, { public: false });
    if (error && !/already exists|duplicate/i.test(error.message)) throw new Error(`createBucket: ${error.message}`);
  }
  for (const [local, bucket, remoto, tipo] of FICHEIROS) {
    const caminho = path.join(BASE, local);
    if (!fs.existsSync(caminho)) { console.log('(salto, não existe):', local); continue; }
    const buf = fs.readFileSync(caminho);
    // cascata de mime como no render-ebook: o bucket escritos recusa
    // application/pdf, aceita octet-stream.
    let error = null;
    for (const mime of [tipo, 'application/octet-stream']) {
      ({ error } = await supabase.storage.from(bucket).upload(remoto, buf, { contentType: mime, upsert: true }));
      if (!error) break;
    }
    if (error) throw new Error(`${remoto}: ${error.message}`);
    console.log('publicado:', bucket, remoto);
  }
  // remove as cópias públicas antigas dos PDFs (o link do Supabase morre)
  await supabase.storage.from(BUCKET_PUBLICO).remove([
    `romances/${SLUG}/livro-pt.pdf`,
    `romances/${SLUG}/livro-en.pdf`,
  ]);
  console.log('cópias públicas antigas removidas');
})();
