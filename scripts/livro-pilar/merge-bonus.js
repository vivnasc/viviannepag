// Anexa o cartão de bolso (bónus) ao fim do PDF do manual.
// Uso: node merge-bonus.js <manual.pdf> <cartao.pdf> <saida.pdf>
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const [, , manual, cartao, out] = process.argv;
(async () => {
  const m = await PDFDocument.load(fs.readFileSync(manual));
  const c = await PDFDocument.load(fs.readFileSync(cartao));
  const pages = await m.copyPages(c, c.getPageIndices());
  pages.forEach((p) => m.addPage(p));
  fs.mkdirSync(require('path').dirname(out), { recursive: true });
  fs.writeFileSync(out, await m.save());
  console.log('merged:', out, m.getPageCount(), 'páginas');
})();
