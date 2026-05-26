const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const OUTPUT = path.join(__dirname, '..', 'public', 'produtos', 'teste-capa-nova.png');

const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400&family=Outfit:wght@300;400;500;600&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width: 1600px;
    height: 2560px;
    position: relative;
    overflow: hidden;
    background: #1a0e08;
    font-family: 'Fraunces', serif;
  }

  /* FUNDO COM TEXTURA */
  .bg {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse at 30% 25%, #8C4A3660 0%, transparent 50%),
      radial-gradient(ellipse at 70% 75%, #7D8A6A30 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, #9A5A4320 0%, transparent 70%),
      linear-gradient(175deg, #2a1810 0%, #1a0e08 40%, #0d0705 100%);
  }

  /* LINHA DECORATIVA TOPO */
  .linha-topo {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 8px;
    background: linear-gradient(90deg, #8C4A36, #EBAE4A, #8C4A36);
  }

  /* BADGE */
  .badge {
    position: absolute;
    top: 100px; left: 120px;
    font-family: 'Outfit', sans-serif;
    font-size: 22px;
    font-weight: 500;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #EBAE4A;
    background: #EBAE4A15;
    border: 1.5px solid #EBAE4A40;
    border-radius: 50px;
    padding: 16px 36px;
  }

  /* MUNDO */
  .mundo {
    position: absolute;
    top: 100px; right: 120px;
    font-family: 'Outfit', sans-serif;
    font-size: 18px;
    font-weight: 400;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #F3E4D680;
  }

  /* BLOCO CENTRAL */
  .centro {
    position: absolute;
    top: 50%;
    left: 120px;
    right: 120px;
    transform: translateY(-50%);
  }

  /* SIMBOLO V */
  .simbolo {
    margin-bottom: 60px;
    opacity: 0.35;
  }

  /* TITULO */
  .titulo {
    font-weight: 700;
    font-size: 120px;
    line-height: 1.05;
    color: #F3E4D6;
    letter-spacing: -0.03em;
    margin-bottom: 50px;
    max-width: 95%;
  }

  /* LINHA */
  .sep {
    width: 100px;
    height: 4px;
    background: #EBAE4A;
    margin-bottom: 50px;
    border-radius: 2px;
  }

  /* SUBTITULO */
  .subtitulo {
    font-weight: 300;
    font-style: italic;
    font-size: 38px;
    line-height: 1.5;
    color: #F3E4D6aa;
    max-width: 85%;
  }

  /* FUNDO INFERIOR */
  .fundo {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 80px 120px 100px;
    background: linear-gradient(to top, rgba(10,6,4,0.95) 0%, transparent 100%);
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .autora {
    font-family: 'Outfit', sans-serif;
    font-weight: 500;
    font-size: 28px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #EBAE4A;
  }

  .site {
    font-family: 'Outfit', sans-serif;
    font-weight: 300;
    font-size: 20px;
    letter-spacing: 0.1em;
    color: #F3E4D650;
  }
</style>
</head>
<body>
  <div class="bg"></div>
  <div class="linha-topo"></div>
  <div class="badge">EBOOK</div>
  <div class="mundo">FREEME</div>

  <div class="centro">
    <svg class="simbolo" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" width="80" height="80">
      <g fill="none" stroke="#EBAE4A" stroke-width="14" stroke-linecap="round">
        <path d="M150 120 C150 270 188 345 244 378"/>
        <path d="M362 120 C362 270 324 345 268 378"/>
      </g>
      <circle cx="256" cy="246" r="14" fill="#EBAE4A"/>
    </svg>

    <h1 class="titulo">A culpa<br>não é boa<br>conselheira</h1>
    <div class="sep"></div>
    <p class="subtitulo">Porque te sentes sempre em falta<br>com os teus filhos, e o que essa culpa<br>te está a impedir de fazer.</p>
  </div>

  <div class="fundo">
    <div class="autora">Vivianne dos Santos</div>
    <div class="site">viviannedossantos.com</div>
  </div>
</body></html>`;

async function main() {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 2560 });
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 20000 });
  await page.screenshot({ path: OUTPUT, type: 'png', fullPage: false });
  await browser.close();
  console.log(`Capa teste: ${OUTPUT}`);
}

main().catch(console.error);
