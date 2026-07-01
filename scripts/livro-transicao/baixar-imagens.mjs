// Baixa do bucket público as imagens do livro (capa + 4 vinhetas das Partes)
// para build/imagens/ e escreve o manifesto que o template Typst lê. As imagens
// são geradas/carregadas no admin (Replicate / upload) e vivem em
//   viviannepag-assets/livro-transicao/<chave>.(jpg|png)
// A capa própria (capa-propria.png) vence a capa gerada (capa.jpg).
//   node scripts/livro-transicao/baixar-imagens.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const DIR = path.join(ROOT, 'build', 'imagens');
mkdirSync(DIR, { recursive: true });

const SUPA = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const BASE = SUPA ? `${SUPA}/storage/v1/object/public/viviannepag-assets/livro-transicao` : '';

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

// capa: a própria (png) vence a gerada (jpg)
if (await baixar('capa-propria.png')) manifesto['capa'] = 'capa-propria.png';
else if (await baixar('capa.jpg')) manifesto['capa'] = 'capa.jpg';

// vinhetas das Partes
for (let n = 1; n <= 4; n++) {
  const f = `parte-${n}.jpg`;
  if (await baixar(f)) manifesto[`parte-${n}`] = f;
}

writeFileSync(path.join(DIR, 'manifest.json'), JSON.stringify(manifesto, null, 2) + '\n');
console.log('imagens baixadas:', Object.keys(manifesto).join(', ') || '(nenhuma)');
