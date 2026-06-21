// Mapa canónico dos romances de Véspera (slug -> ficheiros), partilhado pelo
// workflow de render (render-romance.yml) e pelo upload para o Supabase.
// A "key" é a que o render-livro.js e o capa-compor.js já conhecem (PASTAS/TEXTOS).
// "dirEn" é a pasta do miolo inglês; só os livros já traduzidos a têm (o
// workflow só renderiza EN quando ela existe).
const LIVROS = {
  'rom-01-amparo': { key: 'amparo',    capa: 'AMPARO-capa',       dirEn: 'amparo-livro-en',          outPt: 'AS-MAOS-DE-AMPARO-pt.pdf',        outEn: 'AMPAROS-HANDS-en.pdf' },
  'rom-tradutora': { key: 'tradutora', capa: 'TRADUTORA-capa',    dirEn: 'a-tradutora-livro-en',     outPt: 'A-TRADUTORA-pt.pdf',               outEn: 'THE-TRANSLATOR-en.pdf' },
  'rom-sentinela': { key: 'sentinela', capa: 'SENTINELA-capa',    dirEn: 'a-sentinela-livro-en',     outPt: 'A-SENTINELA-pt.pdf',               outEn: 'THE-SENTINEL-en.pdf' },
  'rom-ferrolho':  { key: 'ferrolho',  capa: 'FERROLHO-capa',     dirEn: 'o-ferrolho-livro-en',      outPt: 'O-FERROLHO-pt.pdf',                outEn: 'THE-BOLT-en.pdf' },
  'rom-irma':      { key: 'irma',      capa: 'NOME-DA-IRMA-capa', dirEn: 'nome-da-irma-livro-en',    outPt: 'O-NOME-DA-IRMA-pt.pdf',            outEn: 'THE-SISTERS-NAME-en.pdf' },
  'rom-estrada':   { key: 'estrada',   capa: 'ESTRADA-capa',      dirEn: 'a-estrada-nova-livro-en',  outPt: 'A-ESTRADA-NOVA-pt.pdf',            outEn: 'THE-NEW-ROAD-en.pdf' },
  'rom-portas':    { key: 'portas',    capa: 'PORTAS-capa',       dirEn: 'as-portas-baixas-livro-en', outPt: 'AS-PORTAS-BAIXAS-pt.pdf',         outEn: 'THE-LOW-DOORS-en.pdf' },
  'rom-caderno':   { key: 'caderno',   capa: 'CADERNO-capa',      dirEn: 'caderno-das-dividas-livro-en', outPt: 'O-CADERNO-DAS-DIVIDAS-pt.pdf', outEn: 'THE-LEDGER-OF-DEBTS-en.pdf' },
  'rom-cheias':    { key: 'cheias',    capa: 'CHEIAS-capa',       dirEn: 'homem-das-cheias-livro-en', outPt: 'O-HOMEM-DAS-CHEIAS-pt.pdf',       outEn: 'THE-MAN-THE-FLOODS-BROUGHT-en.pdf' },
  'rom-incomodo':  { key: 'incomodo',  capa: 'INCOMODO-capa',     dirEn: 'nenhum-incomodo-livro-en', outPt: 'NENHUM-INCOMODO-pt.pdf',           outEn: 'NO-TROUBLE-AT-ALL-en.pdf' },
  'rom-frio':      { key: 'frio',      capa: 'FRIO-capa',         dirEn: 'mulher-frio-livro-en',     outPt: 'A-MULHER-QUE-NUNCA-TEVE-FRIO-pt.pdf', outEn: 'THE-WOMAN-WHO-NEVER-FELT-THE-COLD-en.pdf' },
  'rom-fabrica':   { key: 'fabrica',   capa: 'FABRICA-capa',      dirEn: 'fabrica-dorme-livro-en',   outPt: 'ENQUANTO-A-FABRICA-DORME-pt.pdf',  outEn: 'WHILE-THE-FACTORY-SLEEPS-en.pdf' },
  'rom-despensa':  { key: 'despensa',  capa: 'DESPENSA-capa',     dirEn: 'a-despensa-cheia-livro-en', outPt: 'A-DESPENSA-CHEIA-pt.pdf',          outEn: 'THE-FULL-PANTRY-en.pdf' },
  'rom-presente':  { key: 'presente',  capa: 'PRESENTE-capa',     dirEn: 'o-presente-por-abrir-livro-en', outPt: 'O-PRESENTE-POR-ABRIR-pt.pdf',     outEn: 'THE-UNOPENED-GIFT-en.pdf' },
  'rom-casa-acabar': { key: 'casa',    capa: 'CASA-capa',         dirEn: 'a-casa-por-acabar-livro-en', outPt: 'A-CASA-POR-ACABAR-pt.pdf',         outEn: 'THE-UNFINISHED-HOUSE-en.pdf' },
  'rom-trovoada':  { key: 'trovoada',  capa: 'TROVOADA-capa',     dirEn: 'a-trovoada-livro-en',      outPt: 'A-TROVOADA-pt.pdf',                outEn: 'THE-THUNDERSTORM-en.pdf' },
  'rom-trave':     { key: 'trave',     capa: 'TRAVE-capa',        dirEn: 'a-trave-mestra-livro-en',  outPt: 'A-TRAVE-MESTRA-pt.pdf',            outEn: 'THE-MASTER-BEAM-en.pdf' },
  'rom-estrangeira': { key: 'estrangeira', capa: 'ESTRANGEIRA-capa', dirEn: 'a-estrangeira-livro-en', outPt: 'A-ESTRANGEIRA-DE-CA-pt.pdf',     outEn: 'THE-FOREIGNER-FROM-HERE-en.pdf' },
  'rom-cisterna':  { key: 'cisterna',  capa: 'CISTERNA-capa',     dirEn: 'a-cisterna-livro-en',      outPt: 'A-CISTERNA-pt.pdf',                outEn: 'THE-CISTERN-en.pdf' },
  'rom-travessas': { key: 'travessas', capa: 'TRAVESSAS-capa',    dirEn: 'as-travessas-livro-en',    outPt: 'AS-TRAVESSAS-DEVOLVIDAS-pt.pdf',   outEn: 'THE-RETURNED-DISHES-en.pdf' },
};

module.exports = { LIVROS, SLUGS: Object.keys(LIVROS) };
