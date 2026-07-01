// PORTAS · gerador de UMA peca (reel 9:16) a partir de um ANGULO de uma porta.
//
// Molde da Soulab (lib/soulab/gerar-ia.ts), mas motor SEPARADO: NAO toca na Soulab.
// Uma peca = uma imagem simbolica + um fragmento de texto que se revela (vehiculo
// 'kinetico', o mesmo render ja testado). O que muda por PORTA e a VOZ, a paleta,
// a assinatura visual e o motor (as faces / os sinais / as tensoes).
//
// So devolve texto/indicacoes; a imagem gera-se a seguir, no route, com Flux.

import { getPorta, getTipoPorta, DOMINIOS_TRANSICAO, type PortaId } from './marca';
import { limparTravessoes } from '@/lib/texto';

export interface PecaPorta {
  titulo: string;      // titulo interno curto (nao vai para o feed)
  frase: string;       // o texto que aparece no reel (o fragmento / a faca)
  destaque: string[];  // 1-3 palavras a realcar
  fundoPrompt: string; // prompt da imagem simbolica (Flux), em ingles
  legenda: string;     // legenda do Instagram (paragrafos curtos)
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
    ? `\nDOMINIOS possiveis (escolhe UM, para variar a cena): ${DOMINIOS_TRANSICAO.join(' · ')}.`
    : '';

  const sys = `Es a voz de ${porta.nome} (@${porta.handle}), uma porta do territorio de Vivianne dos Santos.

O QUE ESTA PORTA E: ${porta.posicionamento}
A TESE: ${porta.tese}
A PERGUNTA DA PORTA (o que toda a peca serve, sem a citar): ${porta.pergunta}

A VOZ (inviolavel): ${porta.voz}
A EMOCAO nos primeiros segundos: ${porta.emocao}
O TOM (a regua de cada peca): ${porta.tom.join(' · ')}.

REGRAS DE VOZ (duras):
- ${porta.regrasVoz.join('\n- ')}

ESTE ANGULO DE HOJE, ${tipo.label}: ${tipo.descricao}
${tipo.angulo}${dominios}

A IMAGEM:
- Assinatura visual desta porta (entra em TODA a imagem): ${porta.assinaturaVisual}.
- Arte fine art, cinematografica, simbolica, evocativa. SEM pessoas a posar, SEM texto, SEM letras, SEM marcas de agua.
- NUNCA mostrar: ${porta.proibidoImg.join(', ')}.

A LEGENDA (a anatomia desta porta):
- Comeca pela DOR na primeira pessoa (o reconhecimento): a pessoa pensa "isto sou eu".
- Depois a REVELACAO (a viragem de significado), sem fechar em solucao.
- Termina na FISSURA e numa PERGUNTA (ou, quando a porta pede, numa cena aberta).
- Fecha com um CTA LEVE (guardar para reler, seguir a porta, ficar com a pergunta), NUNCA vender, NUNCA "link na bio", NUNCA imperativo agressivo.
- NUNCA repete a frase que ja esta na imagem: comeca onde ela acaba.

DEVOLVE APENAS JSON valido, sem texto a volta:
{
  "titulo": "titulo interno curto (2-4 palavras)",
  "conceito": "selo curto para a capa (o nome da face / do sinal / do tema), 1 a 3 palavras",
  "frase": "o fragmento que aparece no reel (a FACA que para o scroll, 1 a 3 linhas curtas, sem aspas)",
  "destaque": ["1 a 3 palavras-chave da frase para realcar"],
  "fundoPrompt": "prompt em INGLES para a imagem simbolica de fundo, fine art, com a assinatura visual da porta, sem pessoas a posar, sem texto, a terminar com --ar 9:16 --style raw",
  "legenda": "legenda para Instagram em paragrafos curtos separados por LINHA EM BRANCO (\\n\\n), na anatomia acima (dor, revelacao, fissura com pergunta, CTA leve numa linha a parte)",
  "hashtags": ["8 a 12 hashtags em portugues, do mundo desta porta, sem repetir"]${formato === 'momentos' ? ',\n  "momentos": ["3 a 5 LINHAS curtas que desdobram UMA so ideia em sequencia (aparecem uma a uma sobre a mesma cena). A 1.a e a FACA que para o scroll; a ultima deixa a pergunta ou o eco. Mesma voz, sem travessoes."]' : ''}
}`;

  const pedido = tema?.trim()
    ? `Uma peca de ${porta.nome} no angulo ${tipo.label}, a partir de: "${tema.trim()}".`
    : `Uma peca de ${porta.nome} no angulo ${tipo.label}.`;
  const naoRepetir = evitar.length
    ? `\n\nNAO repitas estas frases/cenas ja usadas (encontra outra): ${evitar.slice(-40).map((e) => `"${e}"`).join('; ')}.`
    : '';
  const naoRepetirImg = evitarImg.length
    ? `\n\nIMAGEM: foge destas cenas recentes (traz um sujeito novo, dentro da assinatura da porta): ${evitarImg.slice(-10).map((e) => `"${String(e).slice(0, 90)}"`).join('; ')}.`
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
