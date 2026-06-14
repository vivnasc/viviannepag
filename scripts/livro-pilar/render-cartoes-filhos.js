// Render dos rascunhos de bolso dos 3 filhos (ver/vir/viver), 1 página A5 cada.
// Dados extraídos dos manuais. Sem IA. Uso: node render-cartoes-filhos.js
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const OUTDIR = process.argv[2] || '/tmp/cartoes';

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

const CARTOES = [
  {
    file: 'CARTAO-VER-SOLTAR.pdf',
    titulo: 'ver.soltar', sub: 'a consciência · Turbilhão + Memória',
    movimento: 'Sair de dentro da cabeça e ver a tempestade passar de terra.',
    protocolo: [
      ['Nomeia', '"estou a reparar que estou a pensar isto".'],
      ['Passa para a margem', 'vê a onda passar, não vás nela.'],
      ['De que tempo é', 'isto é de agora, ou é dor antiga acordada?'],
      ['De quem é a voz', 'a frase é tua, ou herdada? devolve-a.'],
      ['Respira e volta ao agora', 'uma coisa pequena, três respirações.'],
    ],
    dias: ['Reparar que reparas', 'Passado ou futuro', 'A margem', 'De que tempo é', 'De quem é a voz', 'Uma coisa de cada vez', 'A travessia inteira'],
    depois: 'a margem — tens um centro, não és a tempestade.',
  },
  {
    file: 'CARTAO-VIR-SOLTAR.pdf',
    titulo: 'vir.soltar', sub: 'o regresso · Esforço + Desolação',
    movimento: 'Parar de empurrar, regressar a ti, deixar-te segurar.',
    protocolo: [
      ['Pára e nomeia', '"está aqui a fuga" (para o fazer ou o ruído?).'],
      ['Sente o corpo', 'onde mora a urgência? mão lá, três respirações.'],
      ['Não faças, e fica', 'não tapes o desconforto; vela-o.'],
      ['Lê o oco como colo', 'não é abismo, é espaço; mão no peito.'],
      ['Recebe, e escuta', 'recebe um fio; "do que é que eu preciso?".'],
    ],
    dias: ['Nomear a fuga', 'O corpo', 'Não fazer uma coisa', 'Ficar no silêncio', 'Receber', 'A pergunta e o colo', 'Pousar'],
    depois: 'o colo — és segurada; amar deixa de ser carregar.',
  },
  {
    file: 'CARTAO-VIVER-SOLTAR.pdf',
    titulo: 'viver.soltar', sub: 'a integração · Horizonte + Permanência',
    movimento: 'Sair da sala de espera, tirar a armadura, entrar na tua vida.',
    protocolo: [
      ['Já cá estás', 'não estás a caminho de lado nenhum.'],
      ['Tira uma peça da armadura', '"não sei", "mudei de ideias", "preciso de ajuda".'],
      ['De quem é o "quando"', 'a pressa é tua, ou herdada?'],
      ['Honra o que protege', 'uma criança que aprendeu a merecer; mão no ombro.'],
      ['Uma coisa presente, pequena', 'entra na vida que acontece agora.'],
    ],
    dias: ['Ver a fuga', 'Já cá estás', 'Tirar uma peça da armadura', 'Trazer um "quando" para hoje', 'De quem é', 'Devolver a herança', 'A refeição inteira'],
    depois: 'descalça — sem armadura, no agora; a estreia é hoje.',
  },
];

function html(c) {
  const passos = c.protocolo.map((p, i) => `<li><span class="np">${i + 1}</span> <b>${p[0]}</b> — ${p[1]}</li>`).join('');
  const dias = c.dias.map((d, i) => `<li><span class="nd">${i + 1}</span> ${d}</li>`).join('');
  return `<!doctype html><html lang="pt"><head><meta charset="utf-8"><style>
${FONTS}
@page { size: A5; margin: 0; }
* { margin:0; padding:0; box-sizing:border-box; }
body { width:148mm; min-height:210mm; background:${C.fundo}; color:${C.tinta}; font-family:'Fraunces',serif; font-weight:300; padding:12mm 12mm; }
.selo { font-family:'Outfit',sans-serif; font-weight:500; font-size:7pt; letter-spacing:.32em; text-transform:uppercase; color:${C.ouro}; text-align:center; }
h1 { font-weight:300; font-size:30pt; color:${C.violeta}; text-align:center; letter-spacing:.01em; margin:3mm 0 1mm; }
.sub { font-style:italic; font-size:9.5pt; color:${C.salvia}; text-align:center; margin-bottom:6mm; }
.mov { font-style:italic; font-size:10pt; color:${C.violeta}; text-align:center; margin-bottom:7mm; }
.rule { height:.4pt; background:${C.ouro}; opacity:.5; margin:5mm 0; }
h2 { font-family:'Outfit',sans-serif; font-weight:500; font-size:7.5pt; letter-spacing:.22em; text-transform:uppercase; color:${C.ouro}; margin-bottom:3mm; }
ul { list-style:none; } li { font-size:9.5pt; line-height:1.45; margin-bottom:2.2mm; }
b { font-weight:400; color:${C.violeta}; }
.np, .nd { color:${C.ouro}; font-weight:400; }
.dias li { font-size:9pt; margin-bottom:1.6mm; }
.depois { margin-top:5mm; font-style:italic; font-size:9.5pt; color:${C.violeta}; }
.depois b { font-family:'Outfit',sans-serif; font-style:normal; font-weight:500; font-size:7.5pt; letter-spacing:.2em; text-transform:uppercase; color:${C.ouro}; display:block; margin-bottom:1.5mm; }
</style></head><body>
  <div class="selo">Método VS · Ver e Soltar</div>
  <h1>${c.titulo}</h1>
  <div class="sub">${c.sub}</div>
  <div class="mov">${c.movimento}</div>
  <div class="bloco"><h2>O protocolo · 5 passos</h2><ul>${passos}</ul></div>
  <div class="rule"></div>
  <div class="bloco"><h2>Sete dias</h2><ul class="dias">${dias}</ul></div>
  <div class="depois"><b>O estado depois</b>${c.depois}</div>
</body></html>`;
}

(async () => {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'] });
  for (const c of CARTOES) {
    const page = await browser.newPage();
    await page.setContent(html(c), { waitUntil: 'load', timeout: 120000 });
    await page.evaluateHandle('document.fonts.ready');
    const out = path.join(OUTDIR, c.file);
    const buf = await page.pdf({ format: 'A5', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
    fs.writeFileSync(out, buf);
    await page.close();
    console.log('cartão:', out, Math.round(buf.length / 1024) + ' KB');
  }
  await browser.close();
})();
