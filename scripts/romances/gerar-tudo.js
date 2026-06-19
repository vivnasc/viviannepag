// Gera TODAS as capas e renderiza TODOS os PDF dos romances de Véspera, de uma vez.
// Uso:
//   node scripts/romances/gerar-tudo.js            -> só PT
//   node scripts/romances/gerar-tudo.js pt+en      -> PT e EN (se houver pasta -en)
//
// Para cada livro:
//   1) procura uma imagem de fundo REAL em ficcao-plano/capas-fonte/<KEY>.jpg
//      (é aqui que se põem as imagens do Replicate, uma por livro);
//   2) se não houver, gera um fundo PROVISÓRIO (degradê na cor da estante);
//   3) compõe a capa (capa-compor.js) com a tipografia da casa por cima;
//   4) renderiza o PDF (render-livro.js).
//
// Ou seja: assim que houver as imagens do Replicate em capas-fonte/, é só voltar
// a correr este script e saem todas as capas finais + todos os PDF atualizados.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer');

const DIR = __dirname;
const BASE = path.join(DIR, '..', '..', 'ficcao-plano');
const FONTE = path.join(BASE, 'capas-fonte'); // imagens reais (Replicate), uma por KEY
const LANGS = (process.argv[2] === 'pt+en') ? ['pt', 'en'] : ['pt'];

// KEY -> { capa (prefixo do PNG), grad (degradê provisório da estante) }
// As cores seguem a estante de cada livro (espelho das coleções da loja).
const LIVROS = {
  amparo:    { grad: ['#6E2233', '#4A1924', '#2A1018'] }, // I  bordeaux
  tradutora: { grad: ['#6E2233', '#4A1924', '#2A1018'] }, // I
  sentinela: { grad: ['#3A1A28', '#2A1320', '#160E16'] }, // I
  ferrolho:  { grad: ['#341520', '#241019', '#120A12'] }, // I
  irma:      { grad: ['#7A5320', '#5A3D18', '#2E2010'] }, // II ambar
  estrada:   { grad: ['#7A5320', '#5A3D18', '#2E2010'] }, // II
  portas:    { grad: ['#7A5320', '#5A3D18', '#2E2010'] }, // II
  caderno:   { grad: ['#5A5320', '#403A16', '#221F0E'] }, // III ouro
  cheias:    { grad: ['#1F4A52', '#163A40', '#0E2426'] }, // IV
  incomodo:  { grad: ['#3A2A52', '#2A1F40', '#160E26'] }, // V
  frio:      { grad: ['#3A3A52', '#2A2A40', '#161626'] }, // VI lila
  fabrica:   { grad: ['#6E5328', '#4A3A22', '#2E2616'] }, // VII ocre
};

// prefixo do PNG da capa por KEY (tem de bater com render-livro.js PASTAS[key].capa)
const CAPA_PREFIXO = {
  amparo: 'AMPARO', irma: 'NOME-DA-IRMA', caderno: 'CADERNO', cheias: 'CHEIAS',
  incomodo: 'INCOMODO', frio: 'FRIO', fabrica: 'FABRICA', tradutora: 'TRADUTORA',
  sentinela: 'SENTINELA', ferrolho: 'FERROLHO', estrada: 'ESTRADA', portas: 'PORTAS',
};

async function fundoProvisorio(grad, out) {
  const [a, b, c] = grad;
  const html = `<!doctype html><html><body style="margin:0">
  <div style="width:1400px;height:1873px;background:
    radial-gradient(120% 85% at 50% 10%, rgba(255,255,255,.10) 0%, transparent 58%),
    radial-gradient(90% 70% at 50% 100%, rgba(0,0,0,.45) 0%, transparent 70%),
    linear-gradient(160deg, ${a} 0%, ${b} 45%, ${c} 100%);"></div></body></html>`;
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1873 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({ path: out, type: 'jpeg', quality: 92 });
  await browser.close();
}

(async () => {
  const keys = Object.keys(LIVROS);
  for (const key of keys) {
    for (const lang of LANGS) {
      // pasta do miolo tem de existir para a língua
      // (a verificação fina fica no render-livro.js; aqui só PT é garantido)
      const real = path.join(FONTE, `${key}.jpg`);
      let src = real;
      if (!fs.existsSync(real)) {
        src = path.join('/tmp', `bg-${key}.jpg`);
        await fundoProvisorio(LIVROS[key].grad, src);
      }
      const outCapa = path.join(BASE, `${CAPA_PREFIXO[key]}-capa-${lang}.png`);
      execFileSync('node', [path.join(DIR, 'capa-compor.js'), src, lang, outCapa, key],
        { stdio: 'inherit', env: { ...process.env, NODE_PATH: path.join(DIR, '..', '..', 'node_modules') } });
      try {
        execFileSync('node', [path.join(DIR, 'render-livro.js'), lang, key],
          { stdio: 'inherit', env: { ...process.env, NODE_PATH: path.join(DIR, '..', '..', 'node_modules') } });
      } catch (e) {
        console.log(`(salto ${key}/${lang}: sem miolo nessa língua)`);
      }
    }
  }
  console.log('\\nTodas as capas compostas e PDF renderizados.');
})();
