// PORTAS · gerador de UMA peca (reel 9:16) a partir de um ANGULO de uma porta.
//
// Molde da Soulab (lib/soulab/gerar-ia.ts), mas motor SEPARADO: NAO toca na Soulab.
// Uma peca = uma imagem simbolica + um fragmento de texto que se revela (vehiculo
// 'kinetico', o mesmo render ja testado). O que muda por PORTA e a VOZ, a paleta,
// a assinatura visual e o motor (as faces / os sinais / as tensoes).
//
// As 3 contas publicam em INGLES: o texto que sai e ingles nativo, escrito de raiz.
// So devolve texto/indicacoes; a imagem gera-se a seguir, no route, com Flux.

import { getPorta, getTipoPorta, DOMINIOS_TRANSICAO, type PortaId } from './marca';
import { limparTravessoes } from '@/lib/texto';

export interface PecaPorta {
  titulo: string;      // titulo interno curto (nao vai para o feed)
  frase: string;       // o texto que aparece no reel (a faca)
  destaque: string[];  // 1-3 palavras a realcar
  fundoPrompt: string; // prompt da imagem simbolica (Flux), em ingles
  legenda: string;     // legenda do Instagram
  hashtags: string[];  // hashtags
  conceito: string;    // selo curto (ex.: o nome da face / do sinal)
  momentos?: string[]; // formato "varios momentos": 3-5 linhas que desdobram a ideia
}

const lp = (s: unknown) => limparTravessoes(String(s ?? '').replace(/^["«»]+|["«»]+$/g, '').trim());

export async function gerarPecaPorta(
  portaId: PortaId,
  tipoId: string,
  apiKey: string,
  evitar: string[] = [],
  tema?: string,
  formato: 'frase' | 'momentos' = 'frase',
  evitarImg: string[] = [],
): Promise<PecaPorta> {
  const porta = getPorta(portaId);
  if (!porta) throw new Error('porta-invalida');
  const tipo = getTipoPorta(portaId, tipoId) ?? porta.tipos[0];

  const dominios = portaId === 'transicao'
    ? `\nDOMAINS to choose from (pick ONE, to vary the scene): ${DOMINIOS_TRANSICAO.join(' · ')}.`
    : '';

  const sys = `You are the voice of ${porta.nome} (@${porta.handle}), a door of the world of Vivianne dos Santos.

LANGUAGE: write EVERYTHING that reaches the reader (the on-screen line, the caption, the hashtags, the concept label) in natural, literary British English, as a native writer. Never a translation, never machine-sounding. No dashes anywhere (no em dash, no en dash): use commas, colons, parentheses, full stops.

WHAT THIS DOOR IS: ${porta.posicionamento}
THE THESIS: ${porta.tese}
THE DOOR'S QUESTION (what every piece serves, without quoting it): ${porta.pergunta}

THE VOICE (inviolable): ${porta.voz}
THE EMOTION in the first seconds: ${porta.emocao}
THE TONE (the ruler for every piece): ${porta.tom.join(' · ')}.

HARD VOICE RULES:
- ${porta.regrasVoz.join('\n- ')}

TODAY'S ANGLE, ${tipo.label}: ${tipo.descricao}
${tipo.angulo}${dominios}

THE IMAGE:
- This door's visual signature (present in EVERY image): ${porta.assinaturaVisual}.
- Fine art, cinematic, symbolic, evocative. NO posing people, NO text, NO letters, NO watermark.
- NEVER show: ${porta.proibidoImg.join(', ')}.

THE CAPTION (this door's anatomy):
- Begin with the PAIN in the first person (the recognition): the reader thinks "this is me".
- Then the REVELATION (the turn of meaning), without closing into a solution.
- End on the FISSURE and a QUESTION (or, when the door calls for it, on an open scene).
- Close with a LIGHT call to action (save it to reread, follow the door, sit with the question), NEVER selling, NEVER "link in bio", NEVER an aggressive imperative.
- NEVER repeat the line already on the image: begin where it ends.

RETURN ONLY valid JSON, no text around it:
{
  "titulo": "short internal title (2-4 words)",
  "conceito": "short cover label (the name of the face / sign / theme), 1 to 3 words",
  "frase": "the fragment that appears in the reel (the KNIFE that stops the scroll, 1 to 3 short lines, no quotes)",
  "destaque": ["1 to 3 keywords from the line to highlight"],
  "fundoPrompt": "prompt in ENGLISH for the symbolic background image, fine art, carrying this door's visual signature, no posing people, no text, ending with --ar 9:16 --style raw",
  "legenda": "Instagram caption in short paragraphs separated by a BLANK LINE (\\n\\n), in the anatomy above (pain, revelation, fissure with a question, light CTA on its own line)",
  "hashtags": ["8 to 12 hashtags in English, from this door's world, no repeats"]${formato === 'momentos' ? ',\n  "momentos": ["3 to 5 short LINES unfolding ONE idea in sequence (they appear one by one over the same scene). The 1st is the KNIFE that stops the scroll; the last leaves the question or an echo. Same voice, no dashes."]' : ''}
}`;

  const pedido = tema?.trim()
    ? `A piece for ${porta.nome} in the angle ${tipo.label}, from: "${tema.trim()}".`
    : `A piece for ${porta.nome} in the angle ${tipo.label}.`;
  const naoRepetir = evitar.length
    ? `\n\nDo NOT repeat these lines/scenes already used (find another): ${evitar.slice(-40).map((e) => `"${e}"`).join('; ')}.`
    : '';
  const naoRepetirImg = evitarImg.length
    ? `\n\nIMAGE: avoid these recent scenes (bring a new subject, within the door's signature): ${evitarImg.slice(-10).map((e) => `"${String(e).slice(0, 90)}"`).join('; ')}.`
    : '';

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1100,
      system: sys,
      messages: [{ role: 'user', content: pedido + naoRepetir + naoRepetirImg }],
    }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}`);
  const txt = ((await res.json())?.content?.[0]?.text ?? '').trim();

  let o: Partial<Record<keyof PecaPorta, unknown>> = {};
  try { const m = txt.match(/\{[\s\S]*\}/); o = JSON.parse(m ? m[0] : txt); } catch { /* fallback abaixo */ }

  const momentos = Array.isArray(o.momentos) ? (o.momentos as unknown[]).map((x) => lp(x)).filter(Boolean) : [];
  const frase = lp(o.frase) || momentos[0] || '';
  if (!frase) throw new Error('sem frase');
  const destaque = Array.isArray(o.destaque) ? (o.destaque as unknown[]).map((x) => lp(x)).filter(Boolean) : [];
  const hashtags = Array.isArray(o.hashtags) && o.hashtags.length
    ? (o.hashtags as unknown[]).map((x) => String(x).trim()).filter(Boolean)
    : [...porta.hashtagsBase];
  return {
    titulo: lp(o.titulo) || frase.slice(0, 40),
    conceito: lp(o.conceito) || tipo.label,
    frase,
    destaque,
    fundoPrompt: lp(o.fundoPrompt),
    legenda: lp(o.legenda),
    hashtags,
    momentos: formato === 'momentos' && momentos.length > 1 ? momentos : undefined,
  };
}
