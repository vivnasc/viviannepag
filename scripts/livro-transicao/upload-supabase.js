// Publica o PDF de "A Grande Transição" no bucket público (viviannepag-assets),
// onde a página de admin e o download o vão buscar:
//   produtos/a-grande-transicao.pdf
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const BUCKET = 'viviannepag-assets';
const BASE = path.join(__dirname, '..', '..', 'livro-transicao');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const FICHEIROS = [
  ['A-GRANDE-TRANSICAO.pdf', 'produtos/a-grande-transicao.pdf', 'application/pdf'],
  ['A-GRANDE-TRANSICAO-EN.pdf', 'produtos/a-grande-transicao-en.pdf', 'application/pdf'],
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
