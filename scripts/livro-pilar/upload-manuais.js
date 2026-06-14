// Publica os PDFs vendáveis dos manuais (manual + bónus) no bucket público,
// onde o getProdutoPdfBuffer os procura: produtos/<slug>.pdf e <slug>-en.pdf.
// Publica também a capa composta de cada manual em livro-pilar/<slug>/
// capa-composta.png, que é a capa que o produto/página da loja mostra.
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const BUCKET = 'viviannepag-assets';
const SLUGS = ['ver-soltar', 'vir-soltar', 'viver-soltar'];
const RAIZ = path.join(__dirname, '..', '..', 'livro-pilar');
const BASE = path.join(RAIZ, 'build');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
(async () => {
  for (const s of SLUGS) {
    for (const [lang, remote] of [['PT', `produtos/${s}.pdf`], ['EN', `produtos/${s}-en.pdf`]]) {
      const f = path.join(BASE, `${s}-${lang}.pdf`);
      if (!fs.existsSync(f)) { console.log('ignorado (não existe):', f); continue; }
      const { error } = await sb.storage.from(BUCKET).upload(remote, fs.readFileSync(f), { contentType: 'application/pdf', upsert: true });
      if (error) throw new Error(`${remote}: ${error.message}`);
      console.log('publicado:', BUCKET, remote);
    }
    // capa composta (a que o produto mostra)
    const capa = path.join(RAIZ, s, 'capa-composta.png');
    if (fs.existsSync(capa)) {
      const remote = `livro-pilar/${s}/capa-composta.png`;
      const { error } = await sb.storage.from(BUCKET).upload(remote, fs.readFileSync(capa), { contentType: 'image/png', upsert: true });
      if (error) throw new Error(`${remote}: ${error.message}`);
      console.log('publicado:', BUCKET, remote);
    } else {
      console.log('ignorado (sem capa composta):', capa);
    }
  }
})();
