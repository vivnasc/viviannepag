// Edição final dos romances de Véspera: capa composta + miolo v3 (o cabeçalho da
// primeira versão sobre o papel e a respiração dos ebooks, toques sálvia).
// Uso: node render-livro.js <pt|en> [amparo|irma]
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { marked } = require('marked');
const { PDFDocument } = require('pdf-lib');

const LANG = process.argv[2] || 'pt';
const LIVRO = process.argv[3] || 'amparo';
const BASE = path.join(__dirname, '..', '..', 'ficcao-plano');
const PASTAS = {
  amparo: { pt: 'amparo-livro', en: 'amparo-livro-en', capa: 'AMPARO-capa', outPt: 'AS-MAOS-DE-AMPARO-pt.pdf', outEn: 'AMPAROS-HANDS-en.pdf' },
  irma: { pt: 'nome-da-irma-livro', en: 'nome-da-irma-livro-en', capa: 'NOME-DA-IRMA-capa', outPt: 'O-NOME-DA-IRMA-pt.pdf', outEn: 'THE-SISTERS-NAME-en.pdf' },
  caderno: { pt: 'caderno-das-dividas-livro', en: 'caderno-das-dividas-livro-en', capa: 'CADERNO-capa', outPt: 'O-CADERNO-DAS-DIVIDAS-pt.pdf', outEn: 'THE-LEDGER-OF-DEBTS-en.pdf' },
  cheias: { pt: 'homem-das-cheias-livro', en: 'homem-das-cheias-livro-en', capa: 'CHEIAS-capa', outPt: 'O-HOMEM-DAS-CHEIAS-pt.pdf', outEn: 'THE-MAN-THE-FLOODS-BROUGHT-en.pdf' },
  incomodo: { pt: 'nenhum-incomodo-livro', en: 'nenhum-incomodo-livro-en', capa: 'INCOMODO-capa', outPt: 'NENHUM-INCOMODO-pt.pdf', outEn: 'NO-TROUBLE-AT-ALL-en.pdf' },
  frio: { pt: 'mulher-frio-livro', en: 'mulher-frio-livro-en', capa: 'FRIO-capa', outPt: 'A-MULHER-QUE-NUNCA-TEVE-FRIO-pt.pdf', outEn: 'THE-WOMAN-WHO-NEVER-FELT-THE-COLD-en.pdf' },
  fabrica: { pt: 'fabrica-dorme-livro', en: 'fabrica-dorme-livro-en', capa: 'FABRICA-capa', outPt: 'ENQUANTO-A-FABRICA-DORME-pt.pdf', outEn: 'WHILE-THE-FACTORY-SLEEPS-en.pdf' },
  tradutora: { pt: 'a-tradutora-livro', en: 'a-tradutora-livro-en', capa: 'TRADUTORA-capa', outPt: 'A-TRADUTORA-pt.pdf', outEn: 'THE-TRANSLATOR-en.pdf' },
};
const P = PASTAS[LIVRO] || PASTAS.amparo;
const DIR = path.join(BASE, LANG === 'pt' ? P.pt : P.en);
const CAPA = path.join(BASE, `${P.capa}-${LANG}.png`);
const OUT = path.join(BASE, LANG === 'pt' ? P.outPt : P.outEn);

const C = {
  barro: '#8C4A36', barroEscuro: '#5A3D2E', barroClaro: '#9A5A43',
  areia: '#F3E4D6', creme: '#F1E8DD', salvia: '#7D8A6A',
  texto: '#3D2B1F', textoSuave: '#6B5548', ouro: '#EBAE4A',
};

function fontFace(fam, w, st, file) {
  const dir = fam === 'Fraunces' ? 'fraunces' : 'outfit';
  const base = path.dirname(require.resolve(`@fontsource/${dir}/package.json`));
  const b64 = fs.readFileSync(path.join(base, 'files', `${file}.woff2`)).toString('base64');
  return `@font-face { font-family:'${fam}'; font-weight:${w}; font-style:${st}; src:url('data:font/woff2;base64,${b64}') format('woff2'); }`;
}
const FONTS = [
  ['Fraunces',300,'normal','fraunces-latin-300-normal'],
  ['Fraunces',400,'normal','fraunces-latin-400-normal'],
  ['Fraunces',500,'normal','fraunces-latin-500-normal'],
  ['Fraunces',300,'italic','fraunces-latin-300-italic'],
  ['Fraunces',400,'italic','fraunces-latin-400-italic'],
  ['Outfit',300,'normal','outfit-latin-300-normal'],
  ['Outfit',400,'normal','outfit-latin-400-normal'],
  ['Outfit',500,'normal','outfit-latin-500-normal'],
].map(a => fontFace(...a)).join('\n');

// O símbolo da casa (favicon/gota dos ebooks): duas curvas + ponto + onda.
function gota(px, cor = C.barroClaro) {
  return `<svg viewBox="0 0 512 512" width="${px}" height="${px}">
    <g fill="none" stroke="${cor}" stroke-width="12" stroke-linecap="round">
      <path d="M170 130 C170 270 200 340 248 374"/>
      <path d="M342 130 C342 270 312 340 264 374"/>
    </g>
    <circle cx="256" cy="244" r="16" fill="${cor}"/>
    <path d="M170 400 C200 376 230 420 256 400 C282 380 312 420 342 400" fill="none" stroke="${cor}" stroke-width="12" stroke-linecap="round"/>
  </svg>`;
}

const NUM = LANG==='pt'
  ? ['','um','dois','três','quatro','cinco','seis','sete','oito','nove','dez','onze','doze']
  : ['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'];

const T_IRMA = LANG==='pt' ? {
  tituloHtml:'O Nome<br>da Irmã', autora:'Vivianne dos Santos',
  serie:'Biblioteca de Véspera · Estante II · O Largo da Fonte',
  sub:'um romance de Véspera',
  cap:'capítulo',
  sumarioLabel:'Conteúdo', sumario:'Sumário',
  fichaLabel:'Antes de começar',
  ficha:`Esta é uma obra de ficção. Véspera, as suas casas e as suas gentes são imaginadas, e qualquer semelhança com pessoas reais é a semelhança que as histórias verdadeiras têm umas com as outras. Este romance tem um irmão de autoconhecimento: se a Eufémia te doer em sítios reais, o nome do que ela carrega está em «A mulher que herdou uma vida», na coleção Infonte. Uma história compreende, mas não substitui acompanhamento: nos temas fundos, procura apoio. Mereces o mesmo cuidado que dás.`,
  finalTit:'Para a leitora',
  finalTxt1:'Obrigada por atravessares este ano de Véspera com a Eufémia. Se a história te tocou, partilha-a, não como prova, mas como semente.',
  finalTxt2:'Encontras os ebooks, os guias e o resto da biblioteca em <a href="https://viviannedossantos.com">viviannedossantos.com</a>.',
  copy:'© 2026 Vivianne dos Santos · viviannedossantos.com',
  registoLabel:'Do registo de Véspera',
} : {
  tituloHtml:"The Sister's<br>Name", autora:'Vivianne dos Santos',
  serie:'The Véspera Library · Shelf II · The Fountain Square',
  sub:'a novel of Véspera',
  cap:'chapter',
  sumarioLabel:'Contents', sumario:'Contents',
  fichaLabel:'Before you begin',
  ficha:`This is a work of fiction. Véspera, its houses and its people are imagined, and any resemblance to real persons is the resemblance true stories bear to one another. This novel has a self-knowledge sibling: if Eufémia hurts you in real places, the name of what she carries is in “The Woman Who Inherited a Life”, in the Infonte collection. A story understands, but it does not replace care: in the deep matters, seek support. You deserve the same care you give.`,
  finalTit:'For the reader',
  finalTxt1:'Thank you for crossing this year of Véspera with Eufémia. If the story touched you, pass it on, not as proof, but as seed.',
  finalTxt2:'You will find the ebooks, the guides and the rest of the library at <a href="https://viviannedossantos.com">viviannedossantos.com</a>.',
  copy:'© 2026 Vivianne dos Santos · viviannedossantos.com',
  registoLabel:'From the register of Véspera',
};

const T_AMPARO = LANG==='pt' ? {
  tituloHtml:'As Mãos<br>de Amparo', autora:'Vivianne dos Santos',
  serie:'Biblioteca de Véspera · Estante I · As Casas de Família',
  sub:'um romance de Véspera',
  cap:'capítulo',
  sumarioLabel:'Conteúdo', sumario:'Sumário',
  fichaLabel:'Antes de começar',
  ficha:`Esta é uma obra de ficção. Véspera, as suas casas e as suas gentes são imaginadas, e qualquer semelhança com pessoas reais é a semelhança que as histórias verdadeiras têm umas com as outras. Este romance tem um irmão de autoconhecimento: se a Amparo te doer em sítios reais, o nome do que ela carrega está em «A mãe que salva», na coleção FreeMe Mãe. Uma história compreende, mas não substitui acompanhamento: nos temas fundos, procura apoio. Mereces o mesmo cuidado que dás.`,
  finalTit:'Para a leitora',
  finalTxt1:'Obrigada por atravessares este ano de Véspera com a Amparo. Se a história te tocou, partilha-a, não como prova, mas como semente.',
  finalTxt2:'Encontras os ebooks, os guias e o resto da biblioteca em <a href="https://viviannedossantos.com">viviannedossantos.com</a>.',
  copy:'© 2026 Vivianne dos Santos · viviannedossantos.com',
  registoLabel:'Do registo de Véspera',
} : {
  tituloHtml:"Amparo's<br>Hands", autora:'Vivianne dos Santos',
  serie:'The Véspera Library · Shelf I · The Family Houses',
  sub:'a novel of Véspera',
  cap:'chapter',
  sumarioLabel:'Contents', sumario:'Contents',
  fichaLabel:'Before you begin',
  ficha:`This is a work of fiction. Véspera, its houses and its people are imagined, and any resemblance to real persons is the resemblance true stories bear to one another. This novel has a self-knowledge sibling: if Amparo hurts you in real places, the name of what she carries is in “The Mother Who Saves”, in the FreeMe Mother collection. A story understands, but it does not replace care: in the deep matters, seek support. You deserve the same care you give.`,
  finalTit:'For the reader',
  finalTxt1:'Thank you for crossing this year of Véspera with Amparo. If the story touched you, pass it on, not as proof, but as seed.',
  finalTxt2:'You will find the ebooks, the guides and the rest of the library at <a href="https://viviannedossantos.com">viviannedossantos.com</a>.',
  copy:'© 2026 Vivianne dos Santos · viviannedossantos.com',
  registoLabel:'From the register of Véspera',
};

const T_CADERNO = LANG==='pt' ? {
  tituloHtml:'O Caderno<br>das Dívidas', autora:'Vivianne dos Santos',
  serie:'Biblioteca de Véspera · Estante III · A Mercearia',
  sub:'um romance de Véspera',
  cap:'capítulo',
  sumarioLabel:'Conteúdo', sumario:'Sumário',
  fichaLabel:'Antes de começar',
  ficha:`Esta é uma obra de ficção. Véspera, as suas casas e as suas gentes são imaginadas, e qualquer semelhança com pessoas reais é a semelhança que as histórias verdadeiras têm umas com as outras. Este romance tem um irmão de autoconhecimento: se a Benvinda te doer em sítios reais, o nome do que ela carrega está em «A mulher que não consegue cobrar», na coleção Prosperidade. Uma história compreende, mas não substitui acompanhamento: nos temas fundos, procura apoio. Mereces o mesmo cuidado que dás.`,
  finalTit:'Para a leitora',
  finalTxt1:'Obrigada por atravessares este ano de Véspera com a Benvinda. Se a história te tocou, partilha-a, não como prova, mas como semente.',
  finalTxt2:'Encontras os ebooks, os guias e o resto da biblioteca em <a href="https://viviannedossantos.com">viviannedossantos.com</a>.',
  copy:'© 2026 Vivianne dos Santos · viviannedossantos.com',
  registoLabel:'Do registo de Véspera',
} : {
  tituloHtml:'The Ledger<br>of Debts', autora:'Vivianne dos Santos',
  serie:'The Véspera Library · Shelf III · The Shop',
  sub:'a novel of Véspera',
  cap:'chapter',
  sumarioLabel:'Contents', sumario:'Contents',
  fichaLabel:'Before you begin',
  ficha:`This is a work of fiction. Véspera, its houses and its people are imagined, and any resemblance to real persons is the resemblance true stories bear to one another. This novel has a self-knowledge sibling: if Benvinda hurts you in real places, the name of what she carries is in “The Woman Who Cannot Charge”, in the Prosperity collection. A story understands, but it does not replace care: in the deep matters, seek support. You deserve the same care you give.`,
  finalTit:'For the reader',
  finalTxt1:'Thank you for crossing this year of Véspera with Benvinda. If the story touched you, pass it on, not as proof, but as seed.',
  finalTxt2:'You will find the ebooks, the guides and the rest of the library at <a href="https://viviannedossantos.com">viviannedossantos.com</a>.',
  copy:'© 2026 Vivianne dos Santos · viviannedossantos.com',
  registoLabel:'From the register of Véspera',
};

const T_CHEIAS = LANG==='pt' ? {
  tituloHtml:'O Homem<br>das Cheias', autora:'Vivianne dos Santos',
  serie:'Biblioteca de Véspera · Estante IV · A Ponte',
  sub:'um romance de Véspera',
  cap:'capítulo',
  sumarioLabel:'Conteúdo', sumario:'Sumário',
  fichaLabel:'Antes de começar',
  ficha:`Esta é uma obra de ficção. Véspera, as suas casas e as suas gentes são imaginadas, e qualquer semelhança com pessoas reais é a semelhança que as histórias verdadeiras têm umas com as outras. Este romance tem um irmão de autoconhecimento: se a Rosário te doer em sítios reais, o nome do que ela carrega está em «A mulher que ama a ausência», na coleção SyncHim. Uma história compreende, mas não substitui acompanhamento: nos temas fundos, procura apoio. Mereces o mesmo cuidado que dás.`,
  finalTit:'Para a leitora',
  finalTxt1:'Obrigada por atravessares este ano de Véspera com a Rosário. Se a história te tocou, partilha-a, não como prova, mas como semente.',
  finalTxt2:'Encontras os ebooks, os guias e o resto da biblioteca em <a href="https://viviannedossantos.com">viviannedossantos.com</a>.',
  copy:'© 2026 Vivianne dos Santos · viviannedossantos.com',
  registoLabel:'Do registo de Véspera',
} : {
  tituloHtml:'The Man the<br>Floods Brought', autora:'Vivianne dos Santos',
  serie:'The Véspera Library · Shelf IV · The Bridge',
  sub:'a novel of Véspera',
  cap:'chapter',
  sumarioLabel:'Contents', sumario:'Contents',
  fichaLabel:'Before you begin',
  ficha:`This is a work of fiction. Véspera, its houses and its people are imagined, and any resemblance to real persons is the resemblance true stories bear to one another. This novel has a self-knowledge sibling: if Rosário hurts you in real places, the name of what she carries is in “The Woman Who Loves Absence”, in the SyncHim collection. A story understands, but it does not replace care: in the deep matters, seek support. You deserve the same care you give.`,
  finalTit:'For the reader',
  finalTxt1:'Thank you for crossing this year of Véspera with Rosário. If the story touched you, pass it on, not as proof, but as seed.',
  finalTxt2:'You will find the ebooks, the guides and the rest of the library at <a href="https://viviannedossantos.com">viviannedossantos.com</a>.',
  copy:'© 2026 Vivianne dos Santos · viviannedossantos.com',
  registoLabel:'From the register of Véspera',
};

const T_INCOMODO = LANG==='pt' ? {
  tituloHtml:'Nenhum<br>Incómodo', autora:'Vivianne dos Santos',
  serie:'Biblioteca de Véspera · Estante V · A Mesa Comprida',
  sub:'um romance de Véspera',
  cap:'capítulo',
  sumarioLabel:'Conteúdo', sumario:'Sumário',
  fichaLabel:'Antes de começar',
  ficha:`Esta é uma obra de ficção. Véspera, as suas casas e as suas gentes são imaginadas, e qualquer semelhança com pessoas reais é a semelhança que as histórias verdadeiras têm umas com as outras. Este romance tem um irmão de autoconhecimento: se a Plácida te doer em sítios reais, o nome do que ela carrega está em «A pessoa que nunca dá trabalho», na coleção Pertença. Uma história compreende, mas não substitui acompanhamento: nos temas fundos, procura apoio. Mereces o mesmo cuidado que dás.`,
  finalTit:'Para a leitora',
  finalTxt1:'Obrigada por atravessares este ano de Véspera com a Plácida. Se a história te tocou, partilha-a, não como prova, mas como semente.',
  finalTxt2:'Encontras os ebooks, os guias e o resto da biblioteca em <a href="https://viviannedossantos.com">viviannedossantos.com</a>.',
  copy:'© 2026 Vivianne dos Santos · viviannedossantos.com',
  registoLabel:'Do registo de Véspera',
} : {
  tituloHtml:'No Trouble<br>at All', autora:'Vivianne dos Santos',
  serie:'The Véspera Library · Shelf V · The Long Table',
  sub:'a novel of Véspera',
  cap:'chapter',
  sumarioLabel:'Contents', sumario:'Contents',
  fichaLabel:'Before you begin',
  ficha:`This is a work of fiction. Véspera, its houses and its people are imagined, and any resemblance to real persons is the resemblance true stories bear to one another. This novel has a self-knowledge sibling: if Plácida hurts you in real places, the name of what she carries is in “The Person Who Is No Trouble”, in the Belonging collection. A story understands, but it does not replace care: in the deep matters, seek support. You deserve the same care you give.`,
  finalTit:'For the reader',
  finalTxt1:'Thank you for crossing this year of Véspera with Plácida. If the story touched you, pass it on, not as proof, but as seed.',
  finalTxt2:'You will find the ebooks, the guides and the rest of the library at <a href="https://viviannedossantos.com">viviannedossantos.com</a>.',
  copy:'© 2026 Vivianne dos Santos · viviannedossantos.com',
  registoLabel:'From the register of Véspera',
};

const T_FRIO = LANG==='pt' ? {
  tituloHtml:'A Mulher Que<br>Nunca Teve Frio', autora:'Vivianne dos Santos',
  serie:'Biblioteca de Véspera · Estante VI · A Serra',
  sub:'um romance de Véspera',
  cap:'capítulo',
  sumarioLabel:'Conteúdo', sumario:'Sumário',
  fichaLabel:'Antes de começar',
  ficha:`Esta é uma obra de ficção. Véspera, as suas casas e as suas gentes são imaginadas, e qualquer semelhança com pessoas reais é a semelhança que as histórias verdadeiras têm umas com as outras. Este romance tem um irmão de autoconhecimento: se a Serafina te doer em sítios reais, o nome do que ela carrega está em «A mulher que se tornou forte demais», na coleção Força. Aqui não há padrões errados, há adaptações que salvaram. Uma história compreende, mas não substitui acompanhamento: nos temas fundos, e este é fundo, procura apoio. Mereces o mesmo cuidado que dás.`,
  finalTit:'Para a leitora',
  finalTxt1:'Obrigada por atravessares este inverno de Véspera com a Serafina. Se a história te tocou, partilha-a, não como prova, mas como semente. E se reconheceste em ti algum gelo, lembra-te: ele pode derreter, em qualquer idade, se houver quem traga o calor e a paciência.',
  finalTxt2:'Encontras os ebooks, os guias e o resto da biblioteca em <a href="https://viviannedossantos.com">viviannedossantos.com</a>.',
  copy:'© 2026 Vivianne dos Santos · viviannedossantos.com',
  registoLabel:'Do registo de Véspera',
} : {
  tituloHtml:'The Woman Who<br>Never Felt the Cold', autora:'Vivianne dos Santos',
  serie:'The Véspera Library · Shelf VI · The Mountains',
  sub:'a novel of Véspera',
  cap:'chapter',
  sumarioLabel:'Contents', sumario:'Contents',
  fichaLabel:'Before you begin',
  ficha:`This is a work of fiction. Véspera, its houses and its people are imagined, and any resemblance to real persons is the resemblance true stories bear to one another. This novel has a self-knowledge sibling: if Serafina hurts you in real places, the name of what she carries is in “The Woman Who Became Too Strong”, in the Strength collection. Here there are no wrong patterns, only adaptations that once saved us. A story understands, but it does not replace care: in the deep matters, and this is a deep one, seek support. You deserve the same care you give.`,
  finalTit:'For the reader',
  finalTxt1:'Thank you for crossing this winter of Véspera with Serafina. If the story touched you, pass it on, not as proof, but as seed. And if you recognised some ice in yourself, remember: it can melt, at any age, if someone brings the warmth and the patience.',
  finalTxt2:'You will find the ebooks, the guides and the rest of the library at <a href="https://viviannedossantos.com">viviannedossantos.com</a>.',
  copy:'© 2026 Vivianne dos Santos · viviannedossantos.com',
  registoLabel:'From the register of Véspera',
};

const T_FABRICA = LANG==='pt' ? {
  tituloHtml:'Enquanto a<br>Fábrica Dorme', autora:'Vivianne dos Santos',
  serie:'Biblioteca de Véspera · Estante VII · A Fiandeira',
  sub:'um romance de Véspera',
  cap:'capítulo',
  sumarioLabel:'Conteúdo', sumario:'Sumário',
  fichaLabel:'Antes de começar',
  ficha:`Esta é uma obra de ficção. Véspera, as suas casas e as suas gentes são imaginadas, e qualquer semelhança com pessoas reais é a semelhança que as histórias verdadeiras têm umas com as outras. Este romance tem um irmão de autoconhecimento: se a Libânia te doer em sítios reais, o nome do que ela carrega está em «A pessoa que só valia a trabalhar», na coleção Sentido. Aqui não há defeitos de carácter, há feridas antigas que se disfarçaram de virtude. Uma história compreende, mas não substitui acompanhamento: se o vazio for fundo, procura apoio. Vales o mesmo, faças muito ou nada.`,
  finalTit:'Para a leitora',
  finalTxt1:'Obrigada por atravessares este inverno de Véspera com a Libânia. Se a história te tocou, partilha-a, não como prova, mas como semente. E se reconheceste em ti alguma fábrica a fechar, lembra-te: existes antes de fazeres seja o que for, e existirás depois. A tua linha foi escrita à nascença, e não se apaga.',
  finalTxt2:'Encontras os ebooks, os guias e o resto da biblioteca em <a href="https://viviannedossantos.com">viviannedossantos.com</a>.',
  copy:'© 2026 Vivianne dos Santos · viviannedossantos.com',
  registoLabel:'Do registo de Véspera',
} : {
  tituloHtml:'While the<br>Mill Sleeps', autora:'Vivianne dos Santos',
  serie:'The Véspera Library · Shelf VII · The Mill',
  sub:'a novel of Véspera',
  cap:'chapter',
  sumarioLabel:'Contents', sumario:'Contents',
  fichaLabel:'Before you begin',
  ficha:`This is a work of fiction. Véspera, its houses and its people are imagined, and any resemblance to real persons is the resemblance true stories bear to one another.`,
  finalTit:'For the reader',
  finalTxt1:'Thank you for crossing this winter of Véspera with Libânia.',
  finalTxt2:'You will find the ebooks, the guides and the rest of the library at <a href="https://viviannedossantos.com">viviannedossantos.com</a>.',
  copy:'© 2026 Vivianne dos Santos · viviannedossantos.com',
  registoLabel:'From the register of Véspera',
};

const T_TRADUTORA = LANG==='pt' ? {
  tituloHtml:'A Tradutora', autora:'Vivianne dos Santos',
  serie:'Biblioteca de Véspera · Estante I · As Casas de Família',
  sub:'um romance de Véspera',
  cap:'capítulo',
  sumarioLabel:'Conteúdo', sumario:'Sumário',
  fichaLabel:'Antes de começar',
  ficha:`Esta é uma obra de ficção. Véspera, as suas casas e as suas gentes são imaginadas, e qualquer semelhança com pessoas reais é a semelhança que as histórias verdadeiras têm umas com as outras. O Tomé não é um diagnóstico nem um caso: é uma pessoa que comunica de outra maneira. Este romance tem um irmão de autoconhecimento: se a Eulália te doer em sítios reais, o nome do que ela carrega está na coleção das mães. Aqui não há mães erradas, há amores que se esqueceram de deixar espaço a quem os dá. Uma história compreende, mas não substitui acompanhamento: nos temas fundos, procura apoio. Mereces uma voz tua.`,
  finalTit:'Para a leitora',
  finalTxt1:'Obrigada por atravessares esta história de Véspera com a Eulália. Se te tocou, partilha-a, não como prova, mas como semente. E se reconheceste em ti alguma voz que se calou a cuidar de quem amas, lembra-te: ela pode voltar, em qualquer idade. Tu também tens uma voz.',
  finalTxt2:'Encontras os ebooks, os guias e o resto da biblioteca em <a href="https://viviannedossantos.com">viviannedossantos.com</a>.',
  copy:'© 2026 Vivianne dos Santos · viviannedossantos.com',
  registoLabel:'Do registo de Véspera',
} : {
  tituloHtml:'The Translator', autora:'Vivianne dos Santos',
  serie:'The Véspera Library · Shelf I · The Family Houses',
  sub:'a novel of Véspera',
  cap:'chapter',
  sumarioLabel:'Contents', sumario:'Contents',
  fichaLabel:'Before you begin',
  ficha:`This is a work of fiction. Véspera, its houses and its people are imagined, and any resemblance to real persons is the resemblance true stories bear to one another.`,
  finalTit:'For the reader',
  finalTxt1:'Thank you for crossing this story of Véspera with Eulália.',
  finalTxt2:'You will find the ebooks, the guides and the rest of the library at <a href="https://viviannedossantos.com">viviannedossantos.com</a>.',
  copy:'© 2026 Vivianne dos Santos · viviannedossantos.com',
  registoLabel:'From the register of Véspera',
};

const T = LIVRO === 'irma' ? T_IRMA : LIVRO === 'caderno' ? T_CADERNO : LIVRO === 'cheias' ? T_CHEIAS : LIVRO === 'incomodo' ? T_INCOMODO : LIVRO === 'frio' ? T_FRIO : LIVRO === 'fabrica' ? T_FABRICA : LIVRO === 'tradutora' ? T_TRADUTORA : T_AMPARO;

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.md')).sort();
let sumarioItens = [];
const corpoHtml = files.map(f => {
  const md = fs.readFileSync(path.join(DIR, f), 'utf8').trim();
  const isRegisto = f.startsWith('00') || f.startsWith('13');
  if (isRegisto) {
    const html = marked.parse(md.replace(/^## .+$/m, '').trim());
    const titulo = (md.match(/^## (.+)$/m) || [,''])[1];
    return `<div class="registo-page"><div class="registo-box">
      <div class="registo-label">${T.registoLabel}</div>
      <h2 class="registo-tit">${titulo}</h2>
      ${html}
    </div></div>`;
  }
  const m = md.match(/^## (\d+)\.\s*(.+)$/m);
  const n = m ? parseInt(m[1], 10) : 0;
  const titulo = m ? m[2].trim() : '';
  sumarioItens.push({ n, titulo });
  const corpo = marked.parse(md.replace(/^## .+$/m, '').trim())
    .replace(/^<p>/, '<p class="primeiro-p">');
  return `<section class="capitulo">
    <div class="cap-cabeca">
      <div class="cap-num">${T.cap} ${NUM[n] || n}</div>
      <h2>${titulo}</h2>
      <div class="cap-orn">${gota(34)}</div>
    </div>
    ${corpo}
  </section>`;
}).join('\n');

const sumarioHtml = sumarioItens.map(({n, titulo}) => `
  <li><span class="sum-num">${String(n).padStart(2,'0')}</span><span class="sum-tit">${titulo}</span></li>`).join('');

const html = `<!DOCTYPE html>
<html lang="${LANG}">
<head>
<meta charset="UTF-8">
<style>
  ${FONTS}

  @page { size: A5; margin: 21mm 18mm 24mm 18mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 300;
    font-size: 11pt;
    line-height: 1.85;
    color: ${C.texto};
    background: #FFFFFF;
  }

  .rosto {
    page-break-after: always;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 88vh; text-align: center;
  }
  .rosto .serie {
    font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 7.5pt;
    letter-spacing: 0.28em; text-transform: uppercase; color: ${C.salvia}; margin-bottom: 13mm;
  }
  .rosto h1 { font-weight: 300; font-size: 27pt; line-height: 1.14; color: ${C.barro}; letter-spacing: -0.015em; margin-bottom: 4mm; }
  .rosto .sub { font-style: italic; font-size: 11pt; color: ${C.textoSuave}; margin-bottom: 12mm; }
  .rosto .orn { margin-bottom: 10mm; }
  .rosto .autora {
    font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 9pt;
    letter-spacing: 0.24em; text-transform: uppercase; color: ${C.texto};
  }

  .ficha-page {
    page-break-after: always; display: flex; align-items: center; justify-content: center;
    min-height: 80vh; padding: 6mm 0;
  }
  .ficha-box { border-top: 0.5pt solid ${C.salvia}80; border-bottom: 0.5pt solid ${C.salvia}80; padding: 10mm 2mm; }
  .ficha-label {
    font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 8pt;
    letter-spacing: 0.32em; text-transform: uppercase; color: ${C.salvia};
    text-align: center; margin-bottom: 6mm;
  }
  .ficha-text {
    font-weight: 300; font-style: italic; font-size: 9.5pt; line-height: 1.75;
    color: ${C.textoSuave}; text-align: center;
  }

  .sumario { page-break-after: always; min-height: 80vh; padding-top: 6mm; }
  .sumario-label {
    font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 8pt;
    letter-spacing: 0.32em; text-transform: uppercase; color: ${C.salvia}; margin-bottom: 4mm;
  }
  .sumario h2 { font-weight: 300; font-size: 22pt; color: ${C.barro}; margin-bottom: 11mm; letter-spacing: -0.015em; }
  .sumario ol { list-style: none; }
  .sumario li { display: flex; align-items: baseline; gap: 6mm; padding: 3.2mm 0; border-bottom: 0.3pt solid ${C.barroClaro}30; }
  .sum-num { font-weight: 300; font-size: 12pt; color: ${C.salvia}; min-width: 10mm; font-variant-numeric: tabular-nums; }
  .sum-tit { font-weight: 400; font-size: 11pt; color: ${C.texto}; line-height: 1.4; }

  .registo-page {
    page-break-before: always; page-break-after: always;
    display: flex; align-items: center; justify-content: center; min-height: 80vh; padding: 4mm 0;
  }
  .registo-box { border-top: 0.5pt solid ${C.salvia}80; border-bottom: 0.5pt solid ${C.salvia}80; padding: 9mm 2mm; }
  .registo-label {
    font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 8pt;
    letter-spacing: 0.32em; text-transform: uppercase; color: ${C.salvia};
    text-align: center; margin-bottom: 5mm;
  }
  .registo-tit { font-weight: 400; font-style: italic; font-size: 13.5pt; color: ${C.barro}; text-align: center; margin-bottom: 6mm; }
  .registo-box p {
    font-weight: 300; font-style: italic; font-size: 9.6pt; line-height: 1.75;
    color: ${C.textoSuave}; text-align: center; margin-bottom: 3.2mm;
  }
  .registo-box p:last-child { margin-bottom: 0; margin-top: 4mm; color: ${C.barro}; }

  .capitulo { page-break-before: always; }
  .cap-cabeca { text-align: center; margin: 13mm 0 12mm; }
  .cap-num {
    font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 8.5pt;
    letter-spacing: 0.34em; text-transform: uppercase; color: ${C.salvia}; margin-bottom: 4mm;
  }
  .capitulo h2 {
    font-weight: 400; font-style: italic; font-size: 19pt; color: ${C.barro};
    line-height: 1.2; margin-bottom: 5mm; page-break-after: avoid; letter-spacing: -0.01em;
  }
  .cap-orn { opacity: 0.9; }

  .capitulo p { margin-bottom: 4mm; text-align: justify; hyphens: auto; -webkit-hyphens: auto; orphans: 3; widows: 3; }
  .capitulo p.primeiro-p::first-letter {
    font-family: 'Fraunces', serif; font-weight: 300; font-size: 50pt; line-height: 0.88;
    color: ${C.barro}; float: left; margin: 0 3mm -2mm 0; padding-top: 1mm;
  }
  .capitulo strong { font-weight: 500; color: ${C.barro}; }
  .capitulo em { font-style: italic; color: ${C.texto}; }
  .capitulo hr { border: none; text-align: center; margin: 9mm auto; height: 8mm; line-height: 8mm; }
  .capitulo hr::before { content: '· · ·'; color: ${C.salvia}; font-size: 13pt; letter-spacing: 0.4em; opacity: 0.7; }

  .final {
    page-break-before: always; display: flex; flex-direction: column;
    align-items: center; justify-content: center; min-height: 85vh; text-align: center;
  }
  .final .orn { margin-bottom: 11mm; }
  .final h3 { font-style: italic; font-weight: 300; font-size: 18pt; color: ${C.barro}; margin-bottom: 9mm; letter-spacing: -0.01em; }
  .final p { font-weight: 300; font-size: 10pt; line-height: 1.7; color: ${C.textoSuave}; margin-bottom: 4mm; max-width: 80%; }
  .final a { color: ${C.barro}; text-decoration: none; border-bottom: 0.3pt solid ${C.barroClaro}60; }
  .final-credits {
    margin-top: 14mm; font-family: 'Outfit', sans-serif; font-weight: 400;
    font-size: 7.5pt; letter-spacing: 0.3em; text-transform: uppercase; color: ${C.salvia};
  }
</style>
</head>
<body>

<div class="rosto">
  <div class="serie">${T.serie}</div>
  <h1>${T.tituloHtml}</h1>
  <p class="sub">${T.sub}</p>
  <div class="orn">${gota(46)}</div>
  <p class="autora">${T.autora}</p>
</div>

<div class="ficha-page">
  <div class="ficha-box">
    <div class="ficha-label">${T.fichaLabel}</div>
    <p class="ficha-text">${T.ficha}</p>
  </div>
</div>

<div class="sumario">
  <div class="sumario-label">${T.sumarioLabel}</div>
  <h2>${T.sumario}</h2>
  <ol>${sumarioHtml}</ol>
</div>

${corpoHtml}

<div class="final">
  <div class="orn">${gota(40, C.salvia)}</div>
  <h3>${T.finalTit}</h3>
  <p>${T.finalTxt1}</p>
  <p>${T.finalTxt2}</p>
  <div class="final-credits">${T.copy}</div>
</div>

</body>
</html>`;

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load', timeout: 120000 });
  await page.evaluateHandle('document.fonts.ready');
  const mioloBuf = await page.pdf({
    format: 'A5', printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;text-align:center;font-family:Outfit,sans-serif;font-size:7pt;color:${C.textoSuave}80;"><span class="pageNumber"></span></div>`,
    margin: { top: '21mm', right: '18mm', bottom: '24mm', left: '18mm' },
  });
  await browser.close();

  const livro = await PDFDocument.create();
  const capaImg = await livro.embedPng(fs.readFileSync(CAPA));
  const A5 = [419.53, 595.28];
  const capaPage = livro.addPage(A5);
  capaPage.drawImage(capaImg, { x: 0, y: 0, width: A5[0], height: A5[1] });
  const miolo = await PDFDocument.load(mioloBuf);
  (await livro.copyPages(miolo, miolo.getPageIndices())).forEach(p => livro.addPage(p));
  fs.writeFileSync(OUT, await livro.save());
  console.log('livro final:', OUT, Math.round(fs.statSync(OUT).size/1024) + ' KB,', livro.getPageCount(), 'páginas');
})();
