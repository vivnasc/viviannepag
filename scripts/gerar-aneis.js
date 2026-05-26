const puppeteer = require('puppeteer');
const ANEIS = [
  { nome: 'FREEME', cor: '#8C4A36', letra: 'F' },
  { nome: 'INFONTE', cor: '#B8843D', letra: 'I' },
  { nome: 'SYNCHIM', cor: '#5A1A2A', letra: 'S' },
  { nome: 'EBOOKS', cor: '#1A1A2E', letra: 'E' },
  { nome: 'GUIAS', cor: '#2A1C12', letra: 'G' },
  { nome: 'ESCRITOS', cor: '#7D8A6A', letra: 'W' },
];
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  for (let i = 0; i < ANEIS.length; i++) {
    const { nome, cor, letra } = ANEIS[i];
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080 });
    await page.setContent(`<!DOCTYPE html><html><head>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700&family=Outfit:wght@500&display=swap');
      *{margin:0;padding:0;box-sizing:border-box}
      body{width:1080px;height:1080px;display:flex;align-items:center;justify-content:center;background:${cor};position:relative;overflow:hidden}
      .bg{position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,rgba(255,255,255,0.08) 0%,transparent 70%)}
      .letra{font-family:'Fraunces',serif;font-weight:700;font-size:420px;color:rgba(243,228,214,0.15);position:absolute;top:50%;left:50%;transform:translate(-50%,-55%)}
      .nome{font-family:'Outfit',sans-serif;font-weight:500;font-size:52px;letter-spacing:0.25em;text-transform:uppercase;color:#F3E4D6;position:absolute;bottom:200px;left:50%;transform:translateX(-50%)}
      .linha{width:80px;height:3px;background:#EBAE4A;position:absolute;bottom:170px;left:50%;transform:translateX(-50%);border-radius:2px}
      .v{position:absolute;top:160px;left:50%;transform:translateX(-50%);opacity:0.4}
    </style></head><body>
      <div class="bg"></div>
      <div class="letra">${letra}</div>
      <svg class="v" viewBox="0 0 512 512" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke="#EBAE4A" stroke-width="14" stroke-linecap="round">
          <path d="M150 120 C150 270 188 345 244 378"/>
          <path d="M362 120 C362 270 324 345 268 378"/>
        </g>
        <circle cx="256" cy="246" r="14" fill="#EBAE4A"/>
      </svg>
      <div class="nome">${nome}</div>
      <div class="linha"></div>
    </body></html>`, { waitUntil: 'networkidle0', timeout: 15000 });
    const out = `/tmp/anel-${i + 1}-${nome.toLowerCase()}.png`;
    await page.screenshot({ path: out, type: 'png' });
    await page.close();
    console.log(out);
  }
  await browser.close();
})();
