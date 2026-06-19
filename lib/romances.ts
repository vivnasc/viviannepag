// Os romances da Biblioteca de Véspera · aba Romances da Editora.
// Registo estático (sem fs em runtime): o texto vive em ficcao-plano/ e os
// PDFs finais são compostos fora do site; aqui gere-se a CAPA (Replicate) e
// a ficha de cada romance.

export type Romance = {
  slug: string;
  titulo: string;
  tituloEn: string;
  sub: string;
  estante: string;
  espelho: string;       // o ebook irmão de autoconhecimento
  capitulos: number;
  palavras: number;      // aproximado, edição pt
  // Cena da capa (sem texto na imagem; a tipografia entra na composição).
  cena: string;
};

// Estilos de capa dos romances (registo adulto/literário; o gouache fica como
// opção). A paleta de Véspera é comum a todos.
export const ROMANCE_CAPA_ESTILOS: Record<string, { nome: string; prompt: string }> = {
  aguarela: {
    nome: 'Aguarela literária',
    prompt: 'sophisticated literary fiction book cover art, confident ink line-and-wash with loose watercolour washes, muted and atmospheric, generous negative space, painterly textures, adult and elegant, contemporary prize-winning literary cover feel',
  },
  atmosferica: {
    nome: 'Pintura atmosférica',
    prompt: 'evocative painterly book cover art, oil-painting texture with soft expressive brushwork, moody atmospheric light, impressionistic and adult, quiet emotional weight, fine-art literary cover',
  },
  gouache: {
    nome: 'Gouache / storybook',
    prompt: 'distinctive editorial illustration, soft gouache painting with visible brush texture and paper grain, hand-painted organic shapes, storybook-for-adults feel',
  },
  vintage: {
    nome: 'Vintage desgastado',
    prompt: 'vintage literary book jacket illustration, aged textured paper with worn edges and subtle patina, weathered print grain and faded inks, mid-century illustrated cover feel, muted earthy colours, nostalgic, adult and collectible',
  },
};
export const ROMANCE_CAPA_ESTILO_DEFAULT = 'aguarela';
export const ROMANCE_CAPA_PALETA =
  'warm terracotta, sand, cream, sage green and deep dusk-blue palette';

export const ROMANCES: Romance[] = [
  {
    slug: 'rom-01-amparo',
    titulo: 'As Mãos de Amparo',
    tituloEn: "Amparo's Hands",
    sub: 'um romance de Véspera · Estante I · As Casas de Família',
    estante: 'I · As Casas de Família',
    espelho: 'A mãe que salva',
    capitulos: 12,
    palavras: 30000,
    cena: `book cover illustration, vertical composition: a pair of weathered older mother's hands gently cupped together, holding a tiny house with one warmly lit window, rising from the bottom of the frame; behind and above, at blue dusk, a small village of terracotta rooftops with thin chimney smoke between soft green mountains and a quiet river, warm lit windows; a low full moon, a few swallows; generous calm sky with empty space at the top third for a title; the two hands belong to ONE person: identical skin tone and IDENTICAL matching sleeves/cuffs (same fabric, same colour on both arms); intimate, tender, quietly epic`,
  },
  {
    slug: 'rom-tradutora',
    titulo: 'A Tradutora',
    tituloEn: 'The Translator',
    sub: 'um romance de Véspera · Estante I · As Casas de Família',
    estante: 'I · As Casas de Família',
    espelho: 'Quem fala por mim',
    capitulos: 12,
    palavras: 30000,
    cena: `book cover illustration, vertical composition: at the bottom of the frame, seen from behind, an older mother sits close beside a grown son, her hand resting protectively over his on a wooden table, her lips parted as if speaking for him while he stays silent; a single shared shawl of warm wool wraps loosely from her shoulder toward his; soft lamplight; behind them, at blue dusk, a small village of terracotta rooftops with thin chimney smoke between soft green mountains and a quiet river, a few warm lit windows; generous calm sky with empty space at the top third for a title; intimate, tender, the quiet ache of a voice given away`,
  },
  {
    slug: 'rom-sentinela',
    titulo: 'A Sentinela',
    tituloEn: 'The Sentinel',
    sub: 'um romance de Véspera · Estante I · As Casas de Família',
    estante: 'I · As Casas de Família',
    espelho: 'A vigília que ninguém pediu',
    capitulos: 12,
    palavras: 30000,
    cena: `book cover illustration, vertical composition: at the bottom of the frame, the back of an older woman standing alone at a lit kitchen window at night, a single lamp burning, keeping watch over a quiet house; through the window and around her, at deep blue dusk, a small village of terracotta rooftops with most windows dark and only hers warmly lit, between soft green mountains and a quiet river; a low moon, a single owl; an empty chair beside her; generous calm night sky with empty space at the top third for a title; the loneliness of a watch that no longer has anyone to guard, tender and still`,
  },
  {
    slug: 'rom-ferrolho',
    titulo: 'O Ferrolho',
    tituloEn: 'The Bolt',
    sub: 'um romance de Véspera · Estante I · As Casas de Família',
    estante: 'I · As Casas de Família',
    espelho: 'A porta que aprendi a fechar',
    capitulos: 12,
    palavras: 30000,
    cena: `book cover illustration, vertical composition: at the bottom of the frame, an older woman's weathered hand resting with quiet resolve on a heavy iron door bolt of a closed wooden door at night, a thin line of warm light under the door; behind and above, at deep blue dusk, a small village of terracotta rooftops between soft green mountains and a quiet river, a few warm lit windows, one window dark; a low moon; generous calm night sky with empty space at the top third for a title; the grave tenderness of a mother choosing at last to close a door, restrained and dignified`,
  },
  {
    slug: 'rom-irma',
    titulo: 'O Nome da Irmã',
    tituloEn: "The Sister's Name",
    sub: 'um romance de Véspera · Estante II · O Largo da Fonte',
    estante: 'II · O Largo da Fonte',
    espelho: 'A vida que não escolhi',
    capitulos: 12,
    palavras: 30000,
    cena: `book cover illustration, vertical composition: at the bottom of the frame, a woman seen from behind looking at an old framed photograph of a girl on a wall, her own faint reflection overlapping the photograph as if she wears another's face; a faded ribbon and a single dried flower nearby; behind and above, at blue dusk, a small village square with a stone fountain, terracotta rooftops between soft green mountains and a quiet river, warm lit windows; a low moon; generous calm sky with empty space at the top third for a title; the quiet sorrow of a life lived under another's name, tender and searching`,
  },
  {
    slug: 'rom-estrada',
    titulo: 'A Estrada Nova',
    tituloEn: 'The New Road',
    sub: 'um romance de Véspera · Estante II · O Largo da Fonte',
    estante: 'II · O Largo da Fonte',
    espelho: 'Chegar não chega',
    capitulos: 12,
    palavras: 30000,
    cena: `book cover illustration, vertical composition: a long winding road of worn stone climbing from the bottom of the frame upward and away, turning into mist before it reaches any summit, milestones along its edge; a small lone figure walking up, far ahead the path dissolving into pale fog; around it, at blue dusk, soft green mountains, terracotta rooftops of a small village below with a quiet river and warm lit windows; generous calm sky with empty space at the top third for a title; the restless ache of always climbing and never arriving, atmospheric and quietly epic`,
  },
  {
    slug: 'rom-portas',
    titulo: 'As Portas Baixas',
    tituloEn: 'The Low Doors',
    sub: 'um romance de Véspera · Estante II · O Largo da Fonte',
    estante: 'II · O Largo da Fonte',
    espelho: 'O dom que escondi',
    capitulos: 12,
    palavras: 30000,
    cena: `book cover illustration, vertical composition: at the bottom of the frame, the back of a woman standing beneath a low stone archway, slightly stooped though she is taller than the arch, her mouth barely open in song, a faint warm glow of sound rising from her toward an open brighter sky above; behind and around, at blue dusk, a small village of terracotta rooftops between soft green mountains and a quiet river, warm lit windows, a small stone church; generous calm sky with empty space at the top third for a title; the held-back tenderness of a hidden gift about to be sung aloud`,
  },
  {
    slug: 'rom-caderno',
    titulo: 'O Caderno das Dívidas',
    tituloEn: 'The Ledger of Debts',
    sub: 'um romance de Véspera · Estante III · A Mercearia',
    estante: 'III · A Mercearia',
    espelho: 'O medo de receber',
    capitulos: 12,
    palavras: 30000,
    cena: `book cover illustration, vertical composition: at the bottom of the frame, an open handwritten ledger resting on a worn wooden shop counter beside an old brass scale and a few coins, a weathered hand poised over a page with rows of names and figures; warm lamplight over the counter; behind and above, through a shop window, at blue dusk, a small village of terracotta rooftops between soft green mountains and a quiet river, warm lit windows; generous calm sky with empty space at the top third for a title; the quiet weight of debts kept and worth never claimed, intimate and warm`,
  },
  {
    slug: 'rom-cheias',
    titulo: 'O Homem das Cheias',
    tituloEn: 'The Man the Floods Brought',
    sub: 'um romance de Véspera · Estante IV · A Ponte',
    estante: 'IV · A Ponte',
    espelho: 'O que a água trouxe',
    capitulos: 12,
    palavras: 30000,
    cena: `book cover illustration, vertical composition: at the bottom of the frame, a lone man seen from behind standing at the edge of a swollen river beside an old stone bridge, the water risen and gleaming, a single small boat moored; behind and above, at blue dusk after rain, a small village of terracotta rooftops on the far bank between soft green mountains, warm lit windows, low clearing clouds; generous calm sky with empty space at the top third for a title; the unsettled hush after a flood, atmospheric and quietly hopeful`,
  },
  {
    slug: 'rom-incomodo',
    titulo: 'Nenhum Incómodo',
    tituloEn: 'No Trouble at All',
    sub: 'um romance de Véspera · Estante V · A Mesa Comprida',
    estante: 'V · A Mesa Comprida',
    espelho: 'O lugar que nunca peço',
    capitulos: 12,
    palavras: 30000,
    cena: `book cover illustration, vertical composition: at the bottom of the frame, a long wooden table seen at an angle, carefully laid with many places set for others, every chair waiting, and at the very end one place left bare with no chair; a woman's hands smoothing the cloth; warm lamplight over the table; behind and above, through a window, at blue dusk, a small village of terracotta rooftops between soft green mountains and a quiet river, warm lit windows; generous calm sky with empty space at the top third for a title; the tender self-effacement of one who serves all and asks no place, intimate and warm`,
  },
  {
    slug: 'rom-frio',
    titulo: 'A Mulher Que Nunca Teve Frio',
    tituloEn: 'The Woman Who Never Felt the Cold',
    sub: 'um romance de Véspera · Estante VI · A Serra',
    estante: 'VI · A Serra',
    espelho: 'O que neguei sentir',
    capitulos: 12,
    palavras: 30000,
    cena: `book cover illustration, vertical composition: at the bottom of the frame, an older woman seen from behind standing in light snow on a mountain path, a thick woollen blanket she has given away resting over a child's shoulders beside her while she stands thin-shawled and unflinching; behind and above, at blue winter dusk, snow-dusted green mountains, a small village of terracotta rooftops below with thin chimney smoke and warm lit windows, a quiet half-frozen river; generous calm cold sky with empty space at the top third for a title; the stoic ache of one who never let herself feel the cold, tender and still`,
  },
  {
    slug: 'rom-fabrica',
    titulo: 'Enquanto a Fábrica Dorme',
    tituloEn: 'While the Mill Sleeps',
    sub: 'um romance de Véspera · Estante VII · A Fiandeira',
    estante: 'VII · A Fiandeira',
    espelho: 'O trabalho que me esquece',
    capitulos: 12,
    palavras: 30000,
    cena: `book cover illustration, vertical composition: at the bottom of the frame, an old wool mill of warm stone standing quiet at dawn beside a slow river, a tall chimney without smoke, water wheel still, threads and a single spool on a sill, one warm lit window where someone works while the rest sleeps; behind and above, at pale rose-blue dawn, a small village of terracotta rooftops between soft green mountains, mist over the river; generous calm waking sky with empty space at the top third for a title; the hushed early-morning solitude of work that forgets the worker, atmospheric and tender`,
  },
];

export function getRomance(slug: string): Romance | undefined {
  return ROMANCES.find((r) => r.slug === slug);
}
