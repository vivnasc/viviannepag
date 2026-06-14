// Render do rascunho de bolso (esquema-resumo do Método VS) numa página A5,
// para imprimir/ter por perto. Sem IA. Uso: node render-esquema.js [out.pdf]
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const OUT = process.argv[2] || path.join(__dirname, '..', '..', 'livro-pilar', 'ESQUEMA-METODO-VS.pdf');

const C = { fundo: '#F6EEDF', tinta: '#241B33', violeta: '#3A3357', ouro: '#9C7A2E', salvia: '#7C7A6A' };

function fontFace(fam, w, st, file) {
  const dir = fam === 'Fraunces' ? 'fraunces' : 'outfit';
  const base = path.dirname(require.resolve(`@fontsource/${dir}/package.json`));
  const b64 = fs.readFileSync(path.join(base, 'files', `${file}.woff2`)).toString('base64');
  return `@font-face{font-family:'${fam}';font-weight:${w};font-style:${st};src:url('data:font/woff2;base64,${b64}') format('woff2');}`;
}
const FONTS = [
  ['Fraunces', 300, 'normal', 'fraunces-latin-300-normal'], ['Fraunces', 400, 'normal', 'fraunces-latin-400-normal'],
  ['Fraunces', 300, 'italic', 'fraunces-latin-300-italic'], ['Outfit', 400, 'normal', 'outfit-latin-400-normal'],
  ['Outfit', 500, 'normal', 'outfit-latin-500-normal'],
].map(a => fontFace(...a)).join('\n');

const html = `<!doctype html><html lang="pt"><head><meta charset="utf-8"><style>
${FONTS}
@page { size: A5; margin: 0; }
* { margin:0; padding:0; box-sizing:border-box; }
body { width:148mm; min-height:210mm; background:${C.fundo}; color:${C.tinta};
  font-family:'Fraunces',serif; font-weight:300; padding:11mm 12mm; }
.selo { font-family:'Outfit',sans-serif; font-weight:500; font-size:7pt; letter-spacing:.32em; text-transform:uppercase; color:${C.ouro}; text-align:center; }
h1 { font-weight:300; font-size:21pt; color:${C.violeta}; text-align:center; letter-spacing:-.01em; margin:2mm 0 1mm; }
.sub { font-style:italic; font-size:9pt; color:${C.salvia}; text-align:center; margin-bottom:6mm; }
.rule { height:.4pt; background:${C.ouro}; opacity:.5; margin:5mm 0; }
h2 { font-family:'Outfit',sans-serif; font-weight:500; font-size:7.5pt; letter-spacing:.22em; text-transform:uppercase; color:${C.ouro}; margin-bottom:2mm; }
p, li { font-size:9pt; line-height:1.5; }
.bloco { margin-bottom:4.5mm; }
b { font-weight:400; color:${C.violeta}; }
ol, ul { margin-left:4.5mm; } li { margin-bottom:.6mm; }
.mov li { list-style:none; margin-left:0; }
.veus li { list-style:none; margin-left:0; font-size:8.5pt; }
.veus .n { color:${C.ouro}; font-weight:400; }
.regra { font-style:italic; color:${C.salvia}; font-size:8.5pt; }
</style></head><body>
  <div class="selo">Método VS · Ver e Soltar</div>
  <h1>Rascunho de bolso</h1>
  <div class="sub">o método inteiro num relance</div>

  <div class="bloco">
    <h2>O método em duas palavras</h2>
    <p><b>Ver:</b> reconhecer o padrão sem te julgares. Localizar, não condenar.</p>
    <p><b>Soltar:</b> largar o que viste, sem força. Deixar de segurar.</p>
    <p class="regra">Não há soltar sem ver.</p>
  </div>

  <div class="bloco">
    <h2>Protocolo de bolso · 4 tempos (1 minuto)</h2>
    <ol>
      <li><b>Pára e nomeia</b> — "está aqui um véu".</li>
      <li><b>Vê a raiz</b> — de onde vem, de que tempo, de que casa.</li>
      <li><b>Pergunta de quem é</b> — é meu, ou lealdade a quem veio antes?</li>
      <li><b>Solta um dedo</b> — abre só um pouco a mão, respira três vezes.</li>
    </ol>
  </div>

  <div class="bloco">
    <h2>O minuto do véu · hábito diário</h2>
    <p>Uma vez por dia: que véu esteve hoje à frente dos meus olhos? Nomeia. Agradece a proteção antiga. Solta um dedo.</p>
  </div>

  <div class="rule"></div>

  <div class="bloco mov">
    <h2>Os três movimentos</h2>
    <ul>
      <li><b>Ver</b> · a consciência — sair da tempestade <span class="regra">(Turbilhão + Memória)</span></li>
      <li><b>Vir</b> · o regresso — voltar a ti, deixar-te segurar <span class="regra">(Esforço + Desolação)</span></li>
      <li><b>Viver</b> · a integração — entrar na tua vida, agora <span class="regra">(Horizonte + Permanência)</span></li>
    </ul>
  </div>

  <div class="bloco veus">
    <h2>Os sete véus · o mapa</h2>
    <ul>
      <li><span class="n">1</span> <b>Permanência</b> · defenderes quem já não és</li>
      <li><span class="n">2</span> <b>Memória</b> · viveres preso à tua história</li>
      <li><span class="n">3</span> <b>Turbilhão</b> · afogares-te na própria cabeça</li>
      <li><span class="n">4</span> <b>Esforço</b> · esforçares-te para seres amada</li>
      <li><span class="n">5</span> <b>Desolação</b> · o medo do vazio</li>
      <li><span class="n">6</span> <b>Horizonte</b> · viver à espera de um quando</li>
      <li><span class="n">7</span> <b>Dualidade</b> · a separação, a raiz de todos</li>
    </ul>
  </div>
</body></html>`;

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load', timeout: 120000 });
  await page.evaluateHandle('document.fonts.ready');
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const buf = await page.pdf({ format: 'A5', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await browser.close();
  fs.writeFileSync(OUT, buf);
  console.log('esquema:', OUT, Math.round(buf.length / 1024) + ' KB');
})();
