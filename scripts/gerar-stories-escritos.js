const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ESCRITOS = [
  { titulo: 'A beleza de seres vista a meio', resumo: 'Não precisas de estar pronta para seres amada. Precisas de ser vista exactamente como estás.' },
  { titulo: 'A gentileza que tens contigo quando ninguém vê', resumo: 'Não é amor próprio de slogan. É a forma como te tratas quando erras e ninguém está a ver.' },
  { titulo: 'A lealdade invisível que te tira o que queres', resumo: 'Há partes de ti que escolhem ficar pequenas para não trair quem te formou.' },
  { titulo: 'A liberdade de não ter de perceber tudo', resumo: 'Nem tudo precisa de ser compreendido para ser libertado. Às vezes basta sentir e deixar ir.' },
  { titulo: 'A mulher que escolheu ficar rica', resumo: 'Rica não é ter muito. É parar de devolver o que a vida te dá porque a tua família te ensinou que não era para ti.' },
  { titulo: 'A mulher que já não pede desculpa por existir', resumo: 'Quantas vezes por dia pedes desculpa por coisas que não fizeste? Repara. E pára.' },
  { titulo: 'A mulher que tu tens medo de ser', resumo: 'Não é a versão pequena de ti que te assusta. É a outra. A inteira.' },
  { titulo: 'A respiração que tu deixas a meio', resumo: 'Há semanas que tu não respiras até ao fim. Repara agora.' },
  { titulo: 'Acordar sem pressa', resumo: 'Os primeiros cinco minutos do dia decidem o tom de tudo. E tu tens gasto esses minutos em piloto automático.' },
  { titulo: 'Atravessar não é destruir', resumo: 'Quem rasga véus magoa o que está por baixo. Há uma forma mais antiga, e mais firme, de chegar lá.' },
  { titulo: 'Cada véu é uma forma de te protegeres', resumo: 'Há partes de ti que não escondes por vergonha. Escondes porque um dia foi a única forma de continuar.' },
  { titulo: 'Dizer não é o primeiro sim que te dás', resumo: 'Cada não que dizes ao mundo é um sim que te dás a ti. E esse sim muda a forma como respiras.' },
  { titulo: 'O amor que cabe quando tu cabes', resumo: 'As relações não mudam quando a outra pessoa muda. Mudam quando tu deixas de encolher para caber.' },
  { titulo: 'O corpo sabe primeiro', resumo: 'A tua cabeça chega tarde a quase tudo o que importa. O teu corpo já sabia há semanas.' },
  { titulo: 'O dia em que deixaste de te explicar', resumo: 'Explicar-te é pedir permissão para seres quem és. E tu já não precisas dessa permissão.' },
  { titulo: 'O dia em que paraste de te preparar para viver', resumo: 'Estavas tão ocupada a preparar-te para a vida que te esqueceste de a viver.' },
  { titulo: 'O nó que ninguém te ensinou a ver', resumo: 'Não é falta de esforço, nem de sorte, nem de amor. Há um nó por baixo, e enquanto não o vês, ele decide por ti.' },
  { titulo: 'O prazer de fazer uma coisa de cada vez', resumo: 'Não é produtividade. É presença. E a presença tem um sabor que a pressa nunca te deixou provar.' },
  { titulo: 'O que tu herdaste sem dizer sim', resumo: 'Há heranças que não vêm em testamento. Vêm em silêncio, em medo, em formas de amar que ninguém te explicou.' },
  { titulo: 'O que tu não te deixas querer', resumo: 'A tua vida está limitada não pelo que tu não consegues, mas pelo que tu não te deixas desejar em voz alta.' },
  { titulo: 'O silêncio que tu evitas', resumo: 'Não foges do silêncio porque ele está vazio. Foges porque sabes que ele está cheio de ti.' },
  { titulo: 'Porque é que repetes o mesmo padrão', resumo: 'Não é falta de força de vontade. É o nó por baixo a fazer o seu trabalho, em silêncio.' },
  { titulo: 'Quando os teus filhos já não carregam', resumo: 'O ciclo não se quebra com força. Quebra-se no dia em que olhas para o que carregas e decides não o passar.' },
  { titulo: 'Voltar a casa sem sair do sítio', resumo: 'Há uma casa que não fica num lugar. Fica num gesto, num minuto, numa forma de ouvires a tua respiração.' },
];

const CORES = ['#8C4A36', '#1A1A2E', '#5A1A2A', '#2A1C12', '#B8843D', '#7D8A6A'];

(async () => {
  const outDir = '/tmp/stories-escritos';
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

  for (let i = 0; i < ESCRITOS.length; i++) {
    const { titulo, resumo } = ESCRITOS[i];
    const cor = CORES[i % CORES.length];
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920 });
    await page.setContent(`<!DOCTYPE html><html><head>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;1,9..144,300;1,9..144,400&family=Outfit:wght@400;500&display=swap');
      *{margin:0;padding:0;box-sizing:border-box}
      body{width:1080px;height:1920px;background:${cor};display:flex;flex-direction:column;justify-content:center;padding:100px 100px;position:relative;overflow:hidden}
      .bg{position:absolute;inset:0;background:radial-gradient(ellipse at 35% 25%,rgba(255,255,255,0.05) 0%,transparent 55%),radial-gradient(ellipse at 65% 80%,rgba(235,174,74,0.04) 0%,transparent 50%)}
      .badge{font-family:'Outfit',sans-serif;font-size:18px;font-weight:500;letter-spacing:0.35em;text-transform:uppercase;color:#EBAE4A80;margin-bottom:80px}
      .aspas{font-family:'Fraunces',serif;font-size:160px;color:#EBAE4A30;line-height:0.6;margin-bottom:30px}
      .resumo{font-family:'Fraunces',serif;font-weight:300;font-style:italic;font-size:52px;line-height:1.55;color:#F3E4D6;max-width:95%;margin-bottom:70px}
      .sep{width:60px;height:3px;background:#EBAE4A;margin-bottom:40px;border-radius:2px}
      .titulo{font-family:'Fraunces',serif;font-weight:700;font-size:36px;line-height:1.3;color:#F3E4D6aa;max-width:90%}
      .rodape{position:absolute;bottom:80px;left:100px;right:100px;display:flex;justify-content:space-between;align-items:center}
      .autora{font-family:'Outfit',sans-serif;font-size:20px;letter-spacing:0.12em;text-transform:uppercase;color:#EBAE4A60}
      .link{font-family:'Outfit',sans-serif;font-size:18px;color:#F3E4D640}
    </style></head><body>
      <div class="bg"></div>
      <div class="badge">ESCRITO · VIVIANNE DOS SANTOS</div>
      <div class="aspas">"</div>
      <p class="resumo">${resumo}</p>
      <div class="sep"></div>
      <h2 class="titulo">${titulo}</h2>
      <div class="rodape">
        <span class="autora">viviannedossantos.com</span>
        <span class="link">link na bio</span>
      </div>
    </body></html>`, { waitUntil: 'networkidle0', timeout: 15000 });
    const num = String(i + 1).padStart(2, '0');
    await page.screenshot({ path: `${outDir}/escrito-${num}.png`, type: 'png' });
    await page.close();
    console.log(`escrito-${num}.png`);
  }
  await browser.close();
})();
