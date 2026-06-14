// Publica os PDFs e as capas compostas do livro-pilar (PT e EN, se existirem)
// no bucket público (viviannepag-assets), onde o download dos produtos procura:
//   PT: produtos/os-7-veus.pdf        EN: produtos/os-7-veus-en.pdf
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const BUCKET = 'viviannepag-assets';
const SLUG = 'os-7-veus';
const BASE = path.join(__dirname, '..', '..', 'livro-pilar');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// [ficheiro local, caminho remoto, mime]
const FICHEIROS = [
  ['OS-SETE-VEUS-pt.pdf', `produtos/${SLUG}.pdf`, 'application/pdf'],
  ['capa-composta.png', `livro-pilar/${SLUG}/capa-composta.png`, 'image/png'],
  ['OS-SETE-VEUS-en.pdf', `produtos/${SLUG}-en.pdf`, 'application/pdf'],
  ['capa-composta-en.png', `livro-pilar/${SLUG}/capa-composta-en.png`, 'image/png'],
];

(async () => {
  for (const [local, remoto, tipo] of FICHEIROS) {
    const abs = path.join(BASE, local);
    if (!fs.existsSync(abs)) { console.log('ignorado (não existe):', local); continue; }
    const buf = fs.readFileSync(abs);
    const { error } = await supabase.storage.from(BUCKET).upload(remoto, buf, { contentType: tipo, upsert: true });
    if (error) throw new Error(`${remoto}: ${error.message}`);
    console.log('publicado:', BUCKET, remoto);
  }
})();
