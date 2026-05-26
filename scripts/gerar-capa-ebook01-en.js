const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const OUTPUT = path.join(__dirname, '..', 'public', 'produtos', 'ebook-01-culpa-en-capa.png');

const C = {
  barro: '#8C4A36',
  barroClaro: '#9A5A43',
  areia: '#F3E4D6',
  creme: '#F1E8DD',
  salvia: '#7D8A6A',
};

const gotaGrande = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="${C.areia}" stroke-width="8" stroke-linecap="round">
    <path d="M150 120 C150 270 188 345 244 378"/>
    <path d="M362 120 C362 270 324 345 268 378"/>
    <path d="M206 116 C206 250 224 335 250 366" opacity="0.5"/>
    <path d="M306 116 C306 250 288 335 262 366" opacity="0.5"/>
  </g>
  <circle cx="256" cy="246" r="14" fill="${C.areia}"/>
  <path d="M168 392 C200 366 224 414 256 392 C288 370 312 414 344 392" fill="none" stroke="${C.areia}" stroke-width="10" stroke-linecap="round"/>
</svg>`;

const gotaSmall = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
  <g fill="none" stroke="${C.barroClaro}" stroke-width="12" stroke-linecap="round">
    <path d="M170 130 C170 270 200 340 248 374"/>
    <path d="M342 130 C342 270 312 340 264 374"/>
  </g>
  <circle cx="256" cy="244" r="16" fill="${C.barroClaro}"/>
  <path d="M170 400 C200 376 230 420 256 400 C282 380 312 420 342 400" fill="none" stroke="${C.barroClaro}" stroke-width="12" stroke-linecap="round"/>
</svg>`;

const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300&family=Outfit:wght@400&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width: 1400px;
    height: 1873px;
    position: relative;
    overflow: hidden;
    background: ${C.barro};
    font-family: 'Fraunces', serif;
  }
  .bg {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse at 65% 15%, ${C.barroClaro}50 0%, transparent 55%),
      radial-gradient(ellipse at 25% 85%, ${C.salvia}25 0%, transparent 45%),
      radial-gradient(ellipse at 50% 50%, #5A3D2E80 0%, transparent 70%),
      linear-gradient(175deg, #5A3D2E 0%, ${C.barro} 35%, #1D130B 100%);
  }
  .gota-bg {
    position: absolute;
    top: 6%;
    right: -8%;
    opacity: 0.07;
  }
  .gota-bg svg { width: 700px; height: 700px; }
  .content {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 80px 90px 100px;
    background: linear-gradient(to top, rgba(20,13,8,0.92) 0%, rgba(20,13,8,0.6) 50%, transparent 100%);
  }
  .small-gota { margin-bottom: 30px; opacity: 0.75; }
  h1 {
    font-weight: 300;
    font-size: 72px;
    line-height: 1.08;
    color: ${C.areia};
    letter-spacing: -0.02em;
    margin-bottom: 24px;
    max-width: 95%;
  }
  .sub {
    font-weight: 300;
    font-style: italic;
    font-size: 26px;
    line-height: 1.45;
    color: ${C.areia}bb;
    max-width: 88%;
    margin-bottom: 50px;
  }
  .line {
    width: 120px;
    height: 2px;
    background: ${C.salvia};
    margin-bottom: 28px;
    opacity: 0.55;
  }
  .author {
    font-family: 'Outfit', sans-serif;
    font-weight: 400;
    font-size: 20px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: ${C.salvia};
  }
  .badge {
    position: absolute;
    top: 60px;
    left: 90px;
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: ${C.salvia};
    border: 1.5px solid ${C.salvia}60;
    border-radius: 30px;
    padding: 10px 24px;
    opacity: 0.8;
  }
</style>
</head>
<body>
  <div class="bg"></div>
  <div class="gota-bg">${gotaGrande}</div>
  <div class="badge">EBOOK · FREEME · EN</div>
  <div class="content">
    <div class="small-gota">${gotaSmall}</div>
    <h1>Guilt Is Not a Good Advisor</h1>
    <p class="sub">Why you always feel like you're falling short with your children, and what that guilt is actually stopping you from doing.</p>
    <div class="line"></div>
    <p class="author">Vivianne dos Santos</p>
  </div>
</body></html>`;

async function main() {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1873 });
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 20000 });
  await page.screenshot({ path: OUTPUT, type: 'png', fullPage: false });
  await browser.close();
  const s = fs.statSync(OUTPUT);
  console.log(`Capa: ${OUTPUT} (${(s.size/1024).toFixed(0)} KB, 1400x1873)`);
}

main().catch(console.error);
