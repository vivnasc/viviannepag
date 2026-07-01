// Publica os PDF de "As Sete Faces do Medo" no bucket público
// (viviannepag-assets), de onde a descarga da loja os vai buscar:
//   produtos/as-sete-faces-do-medo.pdf      (PT)
//   produtos/as-sete-faces-do-medo-en.pdf   (EN)
// Estes já levam a capa carregada (baixada antes do render). O download-directo
// prefere o bucket ao recuo em disco, por isso esta versão vence a de private-produtos.
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const BUCKET = 'viviannepag-assets';
const BASE = path.join(__dirname, '..', '..', 'livro-medo-out');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const FICHEIROS = [
  ['As-Sete-Faces-do-Medo.pdf', 'produtos/as-sete-faces-do-medo.pdf', 'application/pdf'],
  ['The-Seven-Faces-of-Fear.pdf', 'produtos/as-sete-faces-do-medo-en.pdf', 'application/pdf'],
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
