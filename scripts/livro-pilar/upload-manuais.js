// Publica os PDFs vendáveis dos manuais (manual + bónus) no bucket público,
// onde o getProdutoPdfBuffer os procura: produtos/<slug>.pdf e <slug>-en.pdf.
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const BUCKET = 'viviannepag-assets';
const SLUGS = ['ver-soltar', 'vir-soltar', 'viver-soltar'];
const BASE = path.join(__dirname, '..', '..', 'livro-pilar', 'build');
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
  }
})();
