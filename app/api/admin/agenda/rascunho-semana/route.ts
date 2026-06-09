import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getCurso } from '@/lib/infografico/cursos';
import { limparTravessoes } from '@/lib/texto';

export const runtime = 'nodejs';
export const maxDuration = 120;

// POST { tema, subtitulo?, curso? } — RASCUNHA as 6 frases da semana de uma so
// vez, em TEXTO, para a Vivianne LER e EDITAR antes de gerar qualquer visual.
// Nao grava nada: e so o plano. Cada dia segue o seu angulo (ver SLOTS).

// Cada dia tem o seu formato REAL e o seu gerador. "gen" diz à pagina para onde
// rotear o "criar": kinetico = frase controlada; reel = varios frames; banda =
// cena com personagens (Ca em Casa); infografico = infografico.
const SLOTS = [
  { dia: 'segunda', emoji: '✨', label: 'Frase com motion', gen: 'kinetico', formato: 'kinetico', angulo: 'uma frase curta e luminosa que para o scroll, do tema da semana' },
  { dia: 'terça', emoji: '🔎', label: 'Sinais de que…', gen: 'reel', formato: 'sinais', angulo: 'um sinal concreto e reconhecível ligado ao tema (gancho de reel)' },
  { dia: 'quarta', emoji: '💡', label: 'O que ninguém te explica', gen: 'reel', formato: 'ninguem', angulo: 'uma verdade pouco dita sobre o tema, que faz pensar (gancho de reel)' },
  { dia: 'quinta', emoji: '🎭', label: 'Cá em Casa', gen: 'banda', formato: 'banda', angulo: 'uma cena do dia a dia em família onde o tema aparece' },
  { dia: 'sexta', emoji: '✨', label: 'Frase com motion', gen: 'kinetico', formato: 'kinetico', angulo: 'outra frase curta e forte do tema, diferente da de segunda' },
  { dia: 'sábado', emoji: '📊', label: 'Infográfico', gen: 'infografico', formato: 'infografico', angulo: 'uma ideia que se resume numa frase-título clara' },
];

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { tema?: string; subtitulo?: string; curso?: string };
  const tema = body.tema?.trim();
  if (!tema) return NextResponse.json({ erro: 'falta tema' }, { status: 400 });
  const curso = getCurso(body.curso ?? 'transpessoal');
  const contexto = [tema, body.subtitulo?.trim()].filter(Boolean).join('. ');

  const listaSlots = SLOTS.map((s, i) => `${i + 1}. ${s.dia} (${s.label}): ${s.angulo}`).join('\n');

  const SYSTEM = `Es a Vivianne dos Santos (psicologia transpessoal, constelacao familiar; pos-graduada). Escreves para o Instagram "Veu a Veu" — DIDATICO, para ensinar e tocar, nunca para vender. Portugues europeu COM acentos. Voz humana, calorosa, com profundidade real (nada de motivacional oco).

Vais planear UMA SEMANA inteira (6 posts) sobre o tema "${contexto}", no contexto academico "${curso.nome}" (${curso.descricao}).

Para CADA dia ha um angulo proprio:
${listaSlots}

REGRAS:
- Cada "frase" e o TEXTO QUE APARECE NO ECRA: curta, que cabe grande, que para o scroll. No maximo 14 palavras.
- A "legenda" e o texto do Instagram: 1.a linha gancho, 2-4 linhas que aprofundam em palavras simples, fecha com um convite a refletir e "guarda este reel" ou "partilha com quem precisa". SEM vender, SEM links.
- "destaque": 1 a 3 palavras-chave da frase para realcar a ouro.
- "fundoPrompt": prompt MidJourney para o fundo, UNICO e DIFERENTE em cada dia, ligado a imagem da frase desse dia. VARIA o motivo (agua, luz, pedra, ceu, tecido, maos, horizonte, raizes, nevoa, areia, fogo suave, folhas...). NUNCA repitas raizes/fios dourados em todos. Paleta indigo profundo e ouro/ambar, etereo, sagrado, fine art, SEM pessoas, SEM texto. Termina sempre com "--ar 9:16 --style raw".
- NUNCA uses travessoes (— nem –). Usa virgulas, pontos ou parenteses.
- NUNCA soar a egoismo nem "poe-te primeiro": o caminho e inteireza, presenca e reciprocidade saudavel.
- Os 6 dias formam um arco coerente do mesmo tema, mas cada frase e DISTINTA.

DEVOLVE APENAS JSON valido:
{ "dias": [ { "frase": "texto no ecra", "destaque": ["palavra"], "legenda": "legenda completa com 8-10 hashtags em portugues no fim", "fundoPrompt": "prompt MJ unico deste dia, --ar 9:16 --style raw" } ] }
Exatamente 6 itens, pela ordem dos dias acima.`;

  let texto = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-opus-4-7', max_tokens: 3000, system: SYSTEM, messages: [{ role: 'user', content: `Planeia a semana sobre "${contexto}". Devolve os 6 dias em JSON.` }] }),
    });
    if (!res.ok) return NextResponse.json({ erro: 'claude', detalhe: await res.text() }, { status: 502 });
    texto = (await res.json())?.content?.[0]?.text ?? '';
  } catch (e) { return NextResponse.json({ erro: 'claude-fetch', detalhe: String(e) }, { status: 502 }); }

  const ini = texto.indexOf('{'), fim = texto.lastIndexOf('}');
  let dias: { frase: string; destaque: string[]; legenda: string; fundoPrompt: string }[] = [];
  try {
    const parsed = JSON.parse(texto.slice(ini, fim + 1)).dias ?? [];
    dias = parsed.map((d: { frase?: string; destaque?: string[]; legenda?: string; fundoPrompt?: string }) => ({
      frase: limparTravessoes((d.frase ?? '').trim()),
      destaque: limparTravessoes((Array.isArray(d.destaque) ? d.destaque : []).map((s) => String(s).trim()).filter(Boolean)),
      legenda: limparTravessoes((d.legenda ?? '').trim()),
      fundoPrompt: limparTravessoes((d.fundoPrompt ?? '').trim()),
    }));
  } catch { return NextResponse.json({ erro: 'parse', detalhe: texto.slice(0, 200) }, { status: 502 }); }
  if (!dias.length) return NextResponse.json({ erro: 'vazio' }, { status: 502 });

  // junta o angulo/etiqueta de cada slot ao texto rascunhado
  const plano = SLOTS.map((s, i) => ({ ...s, ...(dias[i] ?? { frase: '', destaque: [], legenda: '', fundoPrompt: '' }) }));
  return NextResponse.json({ plano });
}
