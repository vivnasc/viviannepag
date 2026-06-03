#!/usr/bin/env node
/**
 * Gera lib/produtos-en.ts a partir dos markdowns EN em content/produtos/<slug>-en/.
 * Extrai titulo (1o '# '), subtitulo (1o '**...**') e monta a descricao no mesmo
 * estilo do render (metaProduto), mas em ingles. Correr sempre que houver novos
 * produtos traduzidos: `node scripts/gerar-produtos-en.js`.
 */
const fs = require('node:fs');
const path = require('node:path');

const dir = path.join(__dirname, '..', 'content', 'produtos');

function parse(md) {
  const lines = md.split('\n');
  let titulo = '';
  let subtitulo = '';
  const chapters = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!titulo && line.startsWith('# ')) titulo = line.replace(/^#\s+/, '').trim();
    else if (titulo && !subtitulo && line.startsWith('**') && line.endsWith('**')) subtitulo = line.replace(/\*\*/g, '').trim();
    else if (line.startsWith('## ')) chapters.push(line.replace(/^##\s+/, '').replace(/^\d+\.\s*/, '').trim());
  }
  return { titulo, subtitulo, chapters };
}

const out = {};
for (const name of fs.readdirSync(dir).sort()) {
  if (!name.endsWith('-en')) continue;
  const slug = name.slice(0, -3); // remove '-en'
  const file = path.join(dir, name, `${name}.md`);
  if (!fs.existsSync(file)) continue;
  const raw = fs.readFileSync(file, 'utf8');
  const { titulo, subtitulo, chapters } = parse(raw);
  if (!titulo) continue;
  const isGuia = /^guia-/.test(slug);
  const palavras = raw.trim().split(/\s+/).length.toLocaleString('en-US');
  const indice = chapters.map((c, i) => `${i + 1}. ${c}`).join('\n');
  const descricao = isGuia
    ? `**Practical guide · ${palavras} words · Immediate PDF**\n\n${subtitulo}\n\nBy Vivianne dos Santos.`
    : `**Ebook · ${palavras} words · ${chapters.length} chapters · Immediate PDF**\n\n${subtitulo}\n\n**What you will find:**\n${indice}\n\nBy Vivianne dos Santos.`;
  out[slug] = { titulo, subtitulo, descricao };
}

const header = `// GERADO por scripts/gerar-produtos-en.js — nao editar a mao.\n// Titulos/subtitulos/descricoes EN lidos dos markdowns content/produtos/<slug>-en/.\n\nexport type ProdutoEN = { titulo: string; subtitulo: string; descricao: string };\n\nexport const PRODUTOS_EN: Record<string, ProdutoEN> = `;
const body = JSON.stringify(out, null, 2);
fs.writeFileSync(path.join(__dirname, '..', 'lib', 'produtos-en.ts'), `${header}${body};\n`);
console.log(`gerado lib/produtos-en.ts com ${Object.keys(out).length} produtos EN`);
