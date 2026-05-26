const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const BUCKET = 'escritos';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Falta NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY nas envs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PRODUTOS_DIR = path.join(__dirname, '..', 'private-produtos');

async function main() {
  const files = fs.readdirSync(PRODUTOS_DIR).filter(f => f.endsWith('.pdf'));
  console.log(`${files.length} PDFs para upload\n`);

  for (const file of files) {
    const filePath = path.join(PRODUTOS_DIR, file);
    const storagePath = `produtos/${file}`;
    const fileBuffer = fs.readFileSync(filePath);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) {
      console.log(`ERRO: ${file} — ${error.message}`);
    } else {
      console.log(`OK: ${file} → ${BUCKET}/${storagePath}`);
    }
  }

  console.log('\nAgora actualizar ficheiro_path nos produtos...\n');

  const slugs = files
    .filter(f => !f.includes('-en'))
    .map(f => f.replace('.pdf', ''));

  for (const slug of slugs) {
    const storagePath = `produtos/${slug}.pdf`;
    const { error } = await supabase
      .from('produtos')
      .update({ ficheiro_path: storagePath })
      .eq('slug', slug);

    if (error) {
      console.log(`ERRO BD: ${slug} — ${error.message}`);
    } else {
      console.log(`BD OK: ${slug} → ${storagePath}`);
    }
  }

  console.log('\nFeito.');
}

main().catch(console.error);
