// Publica o PDF final (bucket privado) e a capa composta (bucket público) do
// livro-pilar. Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const BUCKET_PUBLICO = 'viviannepag-assets';
const BUCKET_PRIVADO = 'escritos';
const SLUG = 'os-7-veus';
const BASE = path.join(__dirname, '..', '..', 'livro-pilar');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const FICHEIROS = [
  ['OS-SETE-VEUS-pt.pdf', BUCKET_PRIVADO, `livro-pilar/${SLUG}/livro-pt.pdf`, 'application/pdf'],
  ['capa-composta.png', BUCKET_PUBLICO, `livro-pilar/${SLUG}/capa-composta.png`, 'image/png'],
];

(async () => {
  // garante o bucket privado
  const { data: existe } = await supabase.storage.getBucket(BUCKET_PRIVADO);
  if (!existe) {
    const { error } = await supabase.storage.createBucket(BUCKET_PRIVADO, { public: false });
    if (error && !/already exists|duplicate/i.test(error.message)) throw new Error(`createBucket: ${error.message}`);
  }
  for (const [local, bucket, remoto, tipo] of FICHEIROS) {
    const buf = fs.readFileSync(path.join(BASE, local));
    // cascata de mime: o bucket escritos recusa application/pdf, aceita octet-stream
    let error = null;
    for (const mime of [tipo, 'application/octet-stream']) {
      ({ error } = await supabase.storage.from(bucket).upload(remoto, buf, { contentType: mime, upsert: true }));
      if (!error) break;
    }
    if (error) throw new Error(`${remoto}: ${error.message}`);
    console.log('publicado:', bucket, remoto);
  }
})();
