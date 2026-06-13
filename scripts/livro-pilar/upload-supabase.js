// Publica o PDF final e a capa composta do livro-pilar no bucket público
// (viviannepag-assets), que é onde o download dos produtos (lib/produto-pdf)
// já procura: produtos/<slug>.pdf. Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const BUCKET = 'viviannepag-assets';
const SLUG = 'os-7-veus';
const BASE = path.join(__dirname, '..', '..', 'livro-pilar');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const FICHEIROS = [
  // PDF onde o getProdutoPdfBuffer o encontra (produtos/<slug>.pdf)
  ['OS-SETE-VEUS-pt.pdf', `produtos/${SLUG}.pdf`, 'application/pdf'],
  // capa composta (og image / capa do produto na loja)
  ['capa-composta.png', `livro-pilar/${SLUG}/capa-composta.png`, 'image/png'],
];

(async () => {
  for (const [local, remoto, tipo] of FICHEIROS) {
    const buf = fs.readFileSync(path.join(BASE, local));
    const { error } = await supabase.storage.from(BUCKET).upload(remoto, buf, { contentType: tipo, upsert: true });
    if (error) throw new Error(`${remoto}: ${error.message}`);
    console.log('publicado:', BUCKET, remoto);
  }
})();
