// Publica os PDFs finais e as capas compostas do romance no bucket público,
// para os botões de download da aba Romances da Editora.
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const BUCKET = 'viviannepag-assets';
const SLUG = 'rom-01-amparo';
const BASE = path.join(__dirname, '..', '..', 'ficcao-plano');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const FICHEIROS = [
  ['AS-MAOS-DE-AMPARO-pt.pdf', `romances/${SLUG}/livro-pt.pdf`, 'application/pdf'],
  ['AMPAROS-HANDS-en.pdf', `romances/${SLUG}/livro-en.pdf`, 'application/pdf'],
  ['AMPARO-capa-pt.png', `romances/${SLUG}/capa-composta-pt.png`, 'image/png'],
  ['AMPARO-capa-en.png', `romances/${SLUG}/capa-composta-en.png`, 'image/png'],
];

(async () => {
  for (const [local, remoto, tipo] of FICHEIROS) {
    const buf = fs.readFileSync(path.join(BASE, local));
    const { error } = await supabase.storage.from(BUCKET).upload(remoto, buf, { contentType: tipo, upsert: true });
    if (error) throw new Error(`${remoto}: ${error.message}`);
    console.log('publicado:', supabase.storage.from(BUCKET).getPublicUrl(remoto).data.publicUrl);
  }
})();
