// Publica os PDFs do livro Os 7 Sinais de Desencaixe (PT e EN) no bucket público
// (viviannepag-assets), no caminho onde a entrega da loja procura:
//   PT: produtos/os-7-sinais.pdf      EN: produtos/os-7-sinais-en.pdf
// Os PDFs são gerados por build/build-book.mjs na raiz do repo.
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const BUCKET = 'viviannepag-assets';
const SLUG = 'os-7-sinais';
const RAIZ = path.join(__dirname, '..', '..');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// [ficheiro local (relativo à raiz), caminho remoto, mime]
const FICHEIROS = [
  ['Os-7-Sinais-de-Desencaixe.pdf', `produtos/${SLUG}.pdf`, 'application/pdf'],
  ['The-Seven-Signs-of-Not-Belonging.pdf', `produtos/${SLUG}-en.pdf`, 'application/pdf'],
  // a capa titulada (a imagem da Vivianne + título) também vai para o site
  ['sinais-capa/capa-composta.png', `livro-pilar/${SLUG}/capa-composta.png`, 'image/png'],
  ['sinais-capa/capa-composta-en.png', `livro-pilar/${SLUG}/capa-composta-en.png`, 'image/png'],
];

(async () => {
  const { data: existing } = await supabase.storage.getBucket(BUCKET);
  if (!existing) await supabase.storage.createBucket(BUCKET, { public: true });
  for (const [local, remoto, tipo] of FICHEIROS) {
    const abs = path.join(RAIZ, local);
    if (!fs.existsSync(abs)) { console.log('ignorado (não existe):', local); continue; }
    const buf = fs.readFileSync(abs);
    const { error } = await supabase.storage.from(BUCKET).upload(remoto, buf, { contentType: tipo, upsert: true });
    if (error) throw new Error(`${remoto}: ${error.message}`);
    console.log('publicado:', BUCKET, remoto);
  }
})();
