// Publica os PDFs finais e as capas compostas do romance no bucket público,
// para os botões de download da aba Romances da Editora.
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const BUCKET_PUBLICO = 'viviannepag-assets';
const BUCKET_PRIVADO = 'escritos';
const SLUG = 'rom-01-amparo';
const BASE = path.join(__dirname, '..', '..', 'ficcao-plano');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// PDFs no bucket privado (saem só pelo /api/romance-download da casa);
// capas compostas no público (og image da landing).
const FICHEIROS = [
  ['AS-MAOS-DE-AMPARO-pt.pdf', BUCKET_PRIVADO, `romances/${SLUG}/livro-pt.pdf`, 'application/pdf'],
  ['AMPAROS-HANDS-en.pdf', BUCKET_PRIVADO, `romances/${SLUG}/livro-en.pdf`, 'application/pdf'],
  ['AMPARO-capa-pt.png', BUCKET_PUBLICO, `romances/${SLUG}/capa-composta-pt.png`, 'image/png'],
  ['AMPARO-capa-en.png', BUCKET_PUBLICO, `romances/${SLUG}/capa-composta-en.png`, 'image/png'],
];

(async () => {
  for (const [local, bucket, remoto, tipo] of FICHEIROS) {
    const buf = fs.readFileSync(path.join(BASE, local));
    const { error } = await supabase.storage.from(bucket).upload(remoto, buf, { contentType: tipo, upsert: true });
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
