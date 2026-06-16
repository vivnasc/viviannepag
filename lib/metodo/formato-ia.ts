// Método VS · CAMADA 1 — gerador dos BEATS de um motor editorial.
//
// Dado um Formato (a estrutura) + um véu, produz os beats (texto), na voz do
// método, puxando da dimensão certa do SABER + campo de estudo (só por baixo) +
// anti-repetição. Devolve SÓ texto (string[]) — NADA de recipiente: o motor não
// sabe se vai virar reel, carrossel ou vídeo. É a Camada 1.

import { VeuNome } from './contas';
import { VEU_SEMENTE } from './veus';
import { exemplosDimensao } from './saber';
import { REFERENCIAS } from './referencias';
import { limparTravessoes } from '@/lib/texto';
import type { Formato } from './formatos';

/** Gera os beats de um motor para um véu. `evitar` = ângulos já usados (anti-repetição). */
export async function gerarFormatoBeats(formato: Formato, veu: VeuNome, apiKey: string, evitar: string[] = []): Promise<string[]> {
  const s = VEU_SEMENTE[veu];
  const materia = exemplosDimensao(veu, formato.dimensao);
  const ref = REFERENCIAS[veu];
  const estrutura = formato.beats.map((b, i) => `${i + 1}. [${b.papel}] ${b.instrucao}`).join('\n');

  const sys = `Escreves os BEATS de um post de psicologia do Método VS (conta de Instagram). NÃO é um post didático nem uma aula: revela a DOR de um padrão e aponta uma DIREÇÃO, na linguagem das dores da vida (a pessoa pensa "isto sou eu").

MOTOR: ${formato.nome}. ${formato.proposito}
REGISTO DESTE MOTOR: ${formato.guia}

VÉU (o padrão): ${s.descricao}

ESTRUTURA (escreve EXATAMENTE ${formato.beats.length} beats, um por cada número, por esta ordem):
${estrutura}

MATÉRIA-PRIMA deste véu (dimensão "${formato.dimensao}" — usa para encontrar ângulos concretos e novos, NÃO copies à letra): ${materia.map((e) => `"${e}"`).join('; ')}
${ref?.conceitos?.length ? `CAMPO DE ESTUDO (conceitos reais, SÓ para TU pensares um ângulo concreto; NUNCA os nomeies nem uses jargão/autores): ${ref.conceitos.join(' · ')}.` : ''}

REGRAS DE VOZ (duras):
- Português europeu, fala simples e real (como se dissesses a uma amiga). PROIBIDO metáforas/poesia/coach, nada de "alma", "universo", "tempestade", "véu" dentro dos beats.
- Cada beat: 1 frase curta (máx ~14 palavras), concreta, do dia a dia. 1.ª ou 2.ª pessoa.
- SEM travessões (nem — nem –). SEM aspas. SEM hashtags. SEM numerar dentro do texto.
- O ÚLTIMO beat é a DIREÇÃO/saída: concreta e pequena, nunca uma lição moralista.
- A dor tem de ser inconfundível DESTE véu (se tapares o nome, ainda se reconhece o padrão).
${evitar.length ? `- NÃO repitas estes ângulos já usados: ${evitar.slice(-20).map((e) => `"${e}"`).join('; ')}.` : ''}

Devolve SÓ JSON válido, nada mais: {"beats": ["beat 1", "beat 2", ...]} com exatamente ${formato.beats.length} elementos.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 700, system: sys, messages: [{ role: 'user', content: `Beats novos do motor "${formato.nome}" para o véu ${veu}.` }] }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}`);
  const txt = ((await res.json())?.content?.[0]?.text ?? '').trim();

  // parse robusto: JSON primeiro; se falhar, linhas.
  let beats: string[] = [];
  try {
    const m = txt.match(/\{[\s\S]*\}/);
    const j = JSON.parse(m ? m[0] : txt);
    if (Array.isArray(j.beats)) beats = j.beats.map((b: unknown) => String(b));
  } catch {
    beats = txt.split('\n').map((l: string) => l.replace(/^\s*[-*\d.)\]]+\s*/, '').trim()).filter(Boolean);
  }
  beats = beats.map((b) => limparTravessoes(b.replace(/^["«»]+|["«»]+$/g, '').trim())).filter(Boolean);
  if (!beats.length) throw new Error('sem beats');
  return beats;
}
