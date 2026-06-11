import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getCurso } from '@/lib/infografico/cursos';
import { getArena } from '@/lib/veu/arenas';
import { limparTravessoes, corrigirAcentos, REGRA_ACENTOS } from '@/lib/texto';

export const runtime = 'nodejs';
export const maxDuration = 120;

// POST { tema, subtitulo?, curso? } — RASCUNHA as 6 frases da semana de uma so
// vez, em TEXTO, para a Vivianne LER e EDITAR antes de gerar qualquer visual.
// Nao grava nada: e so o plano. Cada dia segue o seu angulo (ver SLOTS).

// Cada dia tem o seu formato REAL e o seu gerador. "gen" diz à pagina para onde
// rotear o "criar": kinetico = frase controlada; reel = varios frames; banda =
// cena com personagens (Ca em Casa); infografico = infografico.
type Slot = { dia: string; wd: number; emoji: string; label: string; gen: string; formato: string; angulo: string; tarde?: boolean; arenaId?: string };

// As 8 series base (1 por dia, de manha). A segunda ABRE a semana insinuando o
// tema. Quarta (maior audiencia) leva 2. Em semanas multi-arena juntam-se posts
// de TARDE (ver DIAS_TARDE), que levam o MESMO conceito as arenas secundarias.
const BASE_SLOTS: Slot[] = [
  { dia: 'segunda', wd: 1, emoji: '✨', label: 'Frase com motion', gen: 'kinetico', formato: 'kinetico', angulo: 'a frase de ABERTURA da semana: curta e luminosa, que INSINUA o caminho do tema desta semana e convida a acompanhar (sem o anunciar como lista nem dizer "esta semana")' },
  { dia: 'terça', wd: 2, emoji: '🔎', label: 'Sinais de que…', gen: 'reel', formato: 'sinais', angulo: 'um sinal concreto e reconhecível ligado ao tema (carrossel)' },
  { dia: 'quarta', wd: 3, emoji: '💡', label: 'O que ninguém te explica', gen: 'reel', formato: 'ninguem', angulo: 'uma verdade pouco dita sobre o tema, que faz pensar (carrossel)' },
  { dia: 'quarta', wd: 3, emoji: '🕯️', label: 'Uma ideia de…', gen: 'reel', formato: 'pensador', angulo: 'uma ideia de um grande pensador (Jung, Frankl, Hellinger, Rumi, Maslow…) sobre o tema, fiel e simples, atribuída ao autor (carrossel). Quarta é o dia de maior audiência, leva 2 posts.' },
  { dia: 'quinta', wd: 4, emoji: '🎭', label: 'Cá em Casa', gen: 'banda', formato: 'banda', angulo: 'uma cena do dia a dia em família onde o tema aparece' },
  { dia: 'sexta', wd: 5, emoji: '🌅', label: 'I am a Hero', gen: 'heroi', formato: 'heroi', angulo: 'uma afirmação luminosa de "I am a Hero" ligada ao tema: curar-te liberta as próximas gerações, quebrar o ciclo (gancho forte e identitário)' },
  { dia: 'sábado', wd: 6, emoji: '📊', label: 'Infográfico', gen: 'infografico', formato: 'infografico', angulo: 'uma ideia que se resume numa frase-título clara' },
  { dia: 'domingo', wd: 7, emoji: '🕊️', label: 'Domingo de Luz', gen: 'kinetico', formato: 'domingo', angulo: 'uma frase leve, luminosa e esperançosa para fechar a semana, sem peso, depois de uma semana de temas mais fundos' },
];

// Dias sugeridos para o 2.º post do dia (de TARDE), por ordem. Em semanas
// multi-arena, cada arena secundaria ganha uma "Frase de tarde" num destes dias.
const DIAS_TARDE: { dia: string; wd: number }[] = [
  { dia: 'terça', wd: 2 }, { dia: 'quinta', wd: 4 }, { dia: 'sexta', wd: 5 }, { dia: 'segunda', wd: 1 },
];

// Recupera dias de um JSON possivelmente CORTADO (resposta truncada): percorre o
// texto a equilibrar chavetas (ignorando o que está dentro de strings) e devolve
// só os objetos {...} completos. O último, se vier a meio, é simplesmente deixado.
function salvarDias(raw: string): { frase?: string; destaque?: string[]; legenda?: string; fundoPrompt?: string }[] {
  const out: { frase?: string; destaque?: string[]; legenda?: string; fundoPrompt?: string }[] = [];
  const start = raw.indexOf('['); if (start < 0) return out;
  let depth = 0, objStart = -1, inStr = false, esc = false;
  for (let i = start; i < raw.length; i++) {
    const c = raw[i];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') { inStr = true; continue; }
    if (c === '{') { if (depth === 0) objStart = i; depth++; }
    else if (c === '}') { depth--; if (depth === 0 && objStart >= 0) { try { out.push(JSON.parse(raw.slice(objStart, i + 1))); } catch {} objStart = -1; } }
  }
  return out;
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { tema?: string; subtitulo?: string; curso?: string; arenas?: string[] };
  const tema = body.tema?.trim();
  if (!tema) return NextResponse.json({ erro: 'falta tema' }, { status: 400 });
  const curso = getCurso(body.curso ?? 'transpessoal');
  const contexto = [tema, body.subtitulo?.trim()].filter(Boolean).join('. ');

  // ARENA(S): onde o conceito ATERRA esta semana (arenas.ts). O conceito lidera
  // sempre; a arena só o ilumina. Família é a casa-base se nada vier. A 1.ª arena
  // é a de manhã (os 8 base); as restantes ganham um 2.º post de TARDE cada.
  const arenasSel = (Array.isArray(body.arenas) && body.arenas.length ? body.arenas : ['pessoal']).map(getArena);
  const arenaPrincipal = arenasSel[0];
  const arenasTarde = arenasSel.slice(1);

  const slots: Slot[] = [
    ...BASE_SLOTS,
    ...arenasTarde.map((ar, k) => {
      const d = DIAS_TARDE[k % DIAS_TARDE.length];
      return { dia: d.dia, wd: d.wd, emoji: '🌙', label: 'Frase de tarde', gen: 'kinetico', formato: 'kinetico', tarde: true, arenaId: ar.id, angulo: `post de TARDE (2.o do dia, ${d.dia}): uma frase curta e luminosa que leva o MESMO conceito "${tema}" a arena "${ar.nome}" (${ar.lente})` } as Slot;
    }),
  ];

  const listaSlots = slots.map((s, i) => `${i + 1}. ${s.dia} (${s.label}): ${s.angulo}`).join('\n');

  const SYSTEM = `Es a Vivianne dos Santos (psicologia transpessoal, constelacao familiar; pos-graduada). Escreves para o Instagram "Veu a Veu" — DIDATICO, para ensinar e tocar, nunca para vender. Portugues europeu COM acentos. Voz humana, calorosa, com profundidade real (nada de motivacional oco).

Vais planear UMA SEMANA inteira (${slots.length} posts) sobre o tema "${contexto}", no contexto academico "${curso.nome}" (${curso.descricao}).

ARENA(S) ONDE O CONCEITO ATERRA esta semana:
- De manha (os ${BASE_SLOTS.length} posts base): ${arenaPrincipal.nome} (${arenaPrincipal.lente})
${arenasTarde.length ? arenasTarde.map((a) => `- De tarde (post extra, ja marcado na lista de dias): ${a.nome} (${a.lente})`).join('\n') : ''}

ENQUADRAMENTO DA ARENA (regra dura, NAO falhar):
- A arena e ONDE o conceito aterra, NUNCA um recado a uma pessoa concreta (chefe, sogra, parceiro, colega, sogros). Fala-se sempre de PADROES e do MEU LUGAR, de dentro para fora.
- Tom de DIGNIDADE, PERTENCA e INTEIREZA. NUNCA vitimismo, ressentimento, culpa, nem por a culpa no outro. Ninguem e vilao, ninguem e vitima. Ensina-se para EVOLUIR, nao para acusar.
- O movimento e sempre INTERNO: honrar quem veio antes, tomar o proprio lugar com respeito, distinguir o que e meu carregar do que pertence ao sistema. A forca esta em mudar a minha posicao, nao em corrigir o outro.
- O conceito "${tema}" LIDERA sempre; a arena so o ilumina (a mesma licao, lida nessa escala da vida).
- O "Ca em Casa" e uma cena de casa/familia; se a arena principal nao for familia, faz a PONTE (o padrao da arena a aparecer no lar), mantendo a cena em casa.
${arenasTarde.length ? '- Cada "Frase de tarde" leva o MESMO conceito a sua arena ja marcada na lista (e um 2.o post desse dia, complementar ao da manha).' : ''}

Para CADA dia ha um angulo proprio:
${listaSlots}

REGRAS:
- Cada "frase" e o TEXTO QUE APARECE NO ECRA: curta, que cabe grande, que para o scroll. No maximo 14 palavras.
- A "legenda" e o texto do Instagram, em PARAGRAFOS CURTOS separados por LINHA EM BRANCO (usa \\n\\n entre cada paragrafo — NUNCA um bloco corrido): gancho na 1.a linha; 2 a 3 paragrafos curtos que aprofundam em palavras simples, separados por \\n\\n; fecho a parte com convite a refletir e a guardar/partilhar (NAO nomeies o formato). SEM vender, SEM links.
- "destaque": 1 a 3 palavras-chave da frase para realcar a ouro.
- "fundoPrompt": prompt MidJourney para o fundo, UNICO e DIFERENTE em cada dia, ligado a imagem da frase desse dia. VARIA o motivo (agua, luz, pedra, ceu, tecido, maos, horizonte, raizes, nevoa, areia, fogo suave, folhas...). NUNCA repitas raizes/fios dourados em todos. Paleta indigo profundo e ouro/ambar, etereo, sagrado, fine art, SEM pessoas, SEM texto. Termina sempre com "--ar 9:16 --style raw".
- NUNCA uses travessoes (— nem –). Usa virgulas, pontos ou parenteses.
- NUNCA soar a egoismo nem "poe-te primeiro": o caminho e inteireza, presenca e reciprocidade saudavel.
- Os ${slots.length} posts formam um arco coerente do mesmo tema, mas cada frase e DISTINTA (incluindo os 2 de quarta, bem diferentes um do outro).

DEVOLVE APENAS JSON valido:
{ "dias": [ { "frase": "texto no ecra", "destaque": ["palavra"], "legenda": "legenda completa com 8-10 hashtags em portugues no fim", "fundoPrompt": "prompt MJ unico deste dia, --ar 9:16 --style raw" } ] }
Exatamente ${slots.length} itens, pela ordem dos dias acima.

${REGRA_ACENTOS}`;

  let texto = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-opus-4-7', max_tokens: 8000, system: SYSTEM, messages: [{ role: 'user', content: `Planeia a semana sobre "${contexto}". Devolve os ${slots.length} dias em JSON.` }] }),
    });
    if (!res.ok) return NextResponse.json({ erro: 'claude', detalhe: await res.text() }, { status: 502 });
    texto = (await res.json())?.content?.[0]?.text ?? '';
  } catch (e) { return NextResponse.json({ erro: 'claude-fetch', detalhe: String(e) }, { status: 502 }); }

  const ini = texto.indexOf('{'), fim = texto.lastIndexOf('}');
  type DiaRaw = { frase?: string; destaque?: string[]; legenda?: string; fundoPrompt?: string };
  let crus: DiaRaw[] = [];
  try {
    crus = JSON.parse(texto.slice(ini, fim + 1)).dias ?? [];
  } catch {
    // JSON cortado (resposta truncada): salva os dias COMPLETOS um a um, em vez
    // de falhar a semana toda. Equilibra chavetas e ignora o último, se incompleto.
    crus = salvarDias(texto);
    if (!crus.length) return NextResponse.json({ erro: 'parse', detalhe: texto.slice(0, 200) }, { status: 502 });
  }
  let dias = crus.map((d) => ({
    frase: limparTravessoes((d.frase ?? '').trim()),
    destaque: limparTravessoes((Array.isArray(d.destaque) ? d.destaque : []).map((s) => String(s).trim()).filter(Boolean)),
    legenda: limparTravessoes((d.legenda ?? '').trim()),
    fundoPrompt: limparTravessoes((d.fundoPrompt ?? '').trim()),
  }));
  if (!dias.length) return NextResponse.json({ erro: 'vazio' }, { status: 502 });
  dias = await corrigirAcentos(dias, apiKey); // rede de segurança: acentuação correta

  // junta o angulo/etiqueta de cada slot ao texto rascunhado
  const plano = slots.map((s, i) => ({ ...s, ...(dias[i] ?? { frase: '', destaque: [], legenda: '', fundoPrompt: '' }) }));
  return NextResponse.json({ plano });
}
