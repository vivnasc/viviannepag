import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONT = (f)=> 'file://'+path.join(__dirname,'fonts',f);

const TITLE='Os Sinais<br>de Desencaixe';
const SUB='O equilíbrio entre pertença e autenticidade';
const AUTHOR='Vivianne dos Santos';
const VEU=(c)=>`<svg viewBox="0 0 512 512" width="150" height="150"><path d="M118 384 C118 224 178 124 256 124 C334 124 394 224 394 384" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/><path d="M166 392 C166 270 204 200 256 200 C308 200 346 270 346 392" fill="none" stroke="${c}" stroke-width="6.5" stroke-linecap="round" opacity="0.55"/><circle cx="256" cy="98" r="7" fill="${c}"/></svg>`;

const variants = {
  noite: { bg:'#1B2A2B', frame:'#B98D3E', num:'#C9A24B', title:'#F4ECDD', rule:'#B98D3E', subc:'#C9B79A', author:'#E7DCC8', orn:'#B98D3E' },
  marfim:{ bg:'#F5EEE2', frame:'#B98D3E', num:'#B98D3E', title:'#3A3357', rule:'#B98D3E', subc:'#6A6075', author:'#3A3357', orn:'#B98D3E' },
};

function html(v){
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face{font-family:'Fraunces';src:url('${FONT('Fraunces-var.ttf')}') format('truetype');font-weight:300 600;font-style:normal;}
  @font-face{font-family:'Fraunces';src:url('${FONT('Fraunces-Italic-var.ttf')}') format('truetype');font-weight:300 500;font-style:italic;}
  @font-face{font-family:'Outfit';src:url('${FONT('Outfit-var.ttf')}') format('truetype');font-weight:300 600;font-style:normal;}
  *{margin:0;padding:0;box-sizing:border-box;}
  html,body{width:1600px;height:2560px;}
  .cv{width:1600px;height:2560px;background:${v.bg};position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font-family:'Fraunces',serif;}
  .frame{position:absolute;inset:70px;border:2px solid ${v.frame};opacity:.5;}
  .frame2{position:absolute;inset:84px;border:1px solid ${v.frame};opacity:.32;}
  .seal{position:absolute;top:150px;left:0;right:0;font-family:'Outfit';font-weight:400;font-size:30px;letter-spacing:.42em;text-transform:uppercase;color:${v.author};opacity:.8;}
  .num{font-weight:300;font-size:210px;line-height:.9;color:${v.num};margin-bottom:20px;}
  h1{font-weight:300;font-size:120px;line-height:1.06;color:${v.title};letter-spacing:-.01em;padding:0 60px;}
  .rule{width:230px;height:2px;background:${v.rule};opacity:.8;margin:54px 0;}
  .sub{font-style:italic;font-weight:400;font-size:46px;color:${v.subc};max-width:1040px;line-height:1.4;}
  .orn{margin-top:70px;}
  .author{position:absolute;bottom:235px;left:0;right:0;font-family:'Outfit';font-weight:400;font-size:32px;letter-spacing:.2em;text-transform:uppercase;color:${v.author};}
  .site{position:absolute;bottom:160px;left:0;right:0;font-family:'Outfit';font-weight:300;font-size:26px;letter-spacing:.28em;text-transform:uppercase;color:${v.author};opacity:.6;}
  </style></head><body>
  <div class="cv">
    <div class="frame"></div><div class="frame2"></div>
    <div class="seal">Vivianne dos Santos</div>
    <div class="num">7</div>
    <h1>${TITLE}</h1>
    <div class="rule"></div>
    <div class="sub">${SUB}</div>
    <div class="orn">${VEU(v.orn)}</div>
    <div class="author">irmão de Os 7 Véus do Despertar</div>
    <div class="site">viviannedossantos.com</div>
  </div></body></html>`;
}

const b = await chromium.launch();
for (const [name,v] of Object.entries(variants)){
  const p = await b.newPage({ viewport:{width:1600,height:2560}, deviceScaleFactor:1 });
  await p.setContent(html(v), { waitUntil:'load' });
  await p.evaluate(async()=>{ await document.fonts.ready; });
  await p.screenshot({ path: path.join(__dirname,`capa-${name}.png`), clip:{x:0,y:0,width:1600,height:2560} });
  await p.close();
  console.log('capa-'+name+'.png');
}
await b.close();
