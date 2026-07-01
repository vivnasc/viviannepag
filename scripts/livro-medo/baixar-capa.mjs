// Baixa do bucket público a capa própria que a Vivianne carregou no admin, para
// build/medo-imagens/, e escreve o manifesto que o template Typst lê. A capa
// vive em viviannepag-assets/livro-medo/capa-propria.png (PT) e capa-propria-en.png (EN).
// Escreve SEMPRE o manifesto (vazio se não houver capa), para o Typst compilar.
//   node scripts/livro-medo/baixar-capa.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const DIR = path.join(ROOT, 'build', 'medo-imagens');
mkdirSync(DIR, { recursive: true });

const SUPA = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const BASE = SUPA ? `${SUPA}/storage/v1/object/public/viviannepag-assets/livro-medo` : '';

async function baixar(ficheiro) {
  if (!BASE) return false;
  try {
    const res = await fetch(`${BASE}/${ficheiro}?v=${Date.now()}`);
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 512) return false; // guarda contra respostas vazias/erro
    writeFileSync(path.join(DIR, ficheiro), buf);
    return true;
  } catch {
    return false;
  }
}

const manifesto = {};
if (await baixar('capa-propria.png')) manifesto['capa'] = 'capa-propria.png';
if (await baixar('capa-propria-en.png')) manifesto['capa-en'] = 'capa-propria-en.png';

writeFileSync(path.join(DIR, 'manifest.json'), JSON.stringify(manifesto, null, 2) + '\n');
console.log('capa baixada:', Object.keys(manifesto).join(', ') || '(nenhuma — o PDF sai sem capa de imagem)');
