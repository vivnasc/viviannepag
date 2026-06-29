import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONT = (f)=> 'file://'+path.join(__dirname,'fonts',f);

const LANG = (process.argv[2] || process.env.LANG_BOOK || 'pt').toLowerCase().startsWith('en') ? 'en' : 'pt';
const STR = {
  pt: { title:'Os 7 Sinais<br>de Desencaixe', sub:'O equilíbrio entre pertença e autenticidade', sibling:'irmão de Os Sete Véus' },
  en: { title:'The Seven Signs<br>of Not Belonging', sub:'The balance between belonging and authenticity', sibling:'a companion to The Seven Veils' },
}[LANG];
const TITLE=STR.title;
const SUB=STR.sub;
const AUTHOR='Vivianne dos Santos';

// O símbolo do livro: sete sinais em fila. Seis assentam na linha, cheios; um
// está fora da linha e vazado — pertence ao conjunto e mesmo assim não encaixa.
// É o desencaixe social, legível num instante, sem pintura nem cena.
const MARCA = (dot,odd)=>{
  const c = [0,1,2,3,4,5,6].map(i=>{
    const cx = 24 + i*72;
    return i===4
      ? `<circle cx="${cx}" cy="32" r="15" fill="none" stroke="${odd}" stroke-width="3"/>`
      : `<circle cx="${cx}" cy="64" r="15" fill="${dot}"/>`;
  }).join('');
  return `<svg viewBox="0 0 480 96" width="500" height="100" aria-hidden="true">${c}</svg>`;
};

// Capa a sério, fundo claro (a Vivianne abortou o escuro). Noite fica como
// alternativa, mas marfim é a escolhida.
const variants = {
  marfim: { bg:'#EFE6D4', ink:'#33304A', accent:'#B5823B', rule:'#B5823B', sub:'#6E6578', meta:'#33304A', dot:'#B5823B', odd:'#C7A36A' },
  noite:  { bg:'#1E2526', ink:'#F2E9D8', accent:'#C29A4D', rule:'#B5823B', sub:'#C7B79C', meta:'#E7DCC8', dot:'#C29A4D', odd:'#8FA08C' },
};

function html(v){
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face{font-family:'Fraunces';src:url('${FONT('Fraunces-var.ttf')}') format('truetype');font-weight:300 600;font-style:normal;}
  @font-face{font-family:'Fraunces';src:url('${FONT('Fraunces-Italic-var.ttf')}') format('truetype');font-weight:300 500;font-style:italic;}
  @font-face{font-family:'Outfit';src:url('${FONT('Outfit-var.ttf')}') format('truetype');font-weight:300 600;font-style:normal;}
  *{margin:0;padding:0;box-sizing:border-box;}
  html,body{width:1600px;height:2560px;}
  .cv{width:1600px;height:2560px;background:${v.bg};position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;font-family:'Fraunces',serif;padding:0 150px;}
  .key{position:absolute;inset:54px;border:1px solid ${v.accent};opacity:.28;}
  .author{position:absolute;top:210px;left:0;right:0;font-family:'Outfit';font-weight:400;font-size:31px;letter-spacing:.4em;text-transform:uppercase;color:${v.meta};}
  .mid{margin-top:auto;margin-bottom:auto;display:flex;flex-direction:column;align-items:center;}
  .mark{opacity:.95;margin-bottom:96px;}
  h1{font-weight:340;font-size:118px;line-height:1.08;color:${v.ink};letter-spacing:-.012em;}
  .rule{width:120px;height:1px;background:${v.rule};opacity:.75;margin:68px 0;}
  .sub{font-style:italic;font-weight:400;font-size:44px;color:${v.sub};max-width:980px;line-height:1.42;}
  .foot{position:absolute;bottom:206px;left:0;right:0;font-family:'Outfit';font-weight:400;font-size:28px;letter-spacing:.26em;text-transform:uppercase;color:${v.meta};opacity:.85;}
  .site{position:absolute;bottom:150px;left:0;right:0;font-family:'Outfit';font-weight:300;font-size:25px;letter-spacing:.3em;text-transform:uppercase;color:${v.meta};opacity:.5;}
  </style></head><body>
  <div class="cv">
    <div class="key"></div>
    <div class="author">${AUTHOR}</div>
    <div class="mid">
      <div class="mark">${MARCA(v.dot,v.odd)}</div>
      <h1>${TITLE}</h1>
      <div class="rule"></div>
      <div class="sub">${SUB}</div>
    </div>
    <div class="foot">${STR.sibling}</div>
    <div class="site">viviannedossantos.com</div>
  </div></body></html>`;
}

const b = await chromium.launch();
for (const [name,v] of Object.entries(variants)){
  const p = await b.newPage({ viewport:{width:1600,height:2560}, deviceScaleFactor:1 });
  await p.setContent(html(v), { waitUntil:'load' });
  await p.evaluate(async()=>{ await document.fonts.ready; });
  const suffix = LANG==='en' ? '-en' : '';
  await p.screenshot({ path: path.join(__dirname,`capa-${name}${suffix}.png`), clip:{x:0,y:0,width:1600,height:2560} });
  await p.close();
  console.log('capa-'+name+suffix+'.png');
}
await b.close();
