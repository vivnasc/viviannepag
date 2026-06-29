// CRESCER · gerador de UMA peça a partir de uma TEMÁTICA × FORMATO × VISUAL.
//
// Uma peça = um reel 9:16 (vehículo 'kinetico', o mesmo render já testado): uma
// imagem + texto que se revela. O que muda é o ÂNGULO (temática), a ESTRUTURA
// (formato) e o ESTILO da imagem (visual). A voz é sempre DIRETA (decisão da
// Vivianne), com a base das áreas dela por baixo, sem jargão.
//
// Só devolve texto/indicações; a imagem gera-se a seguir, no route, com Flux.

import { CRESCER, LIVRO, getTematica, getFormato, getVisual, getVoz, type TematicaId, type FormatoId, type VisualId, type VozId } from './marca';
import { profundidadePorBaixo, SINAIS_DESENCAIXE } from '@/lib/knowledge/saber';
import { limparTravessoes } from '@/lib/texto';

export interface PecaCrescer {
  titulo: string;       // título interno curto (não vai para o feed)
  frase: string;        // o texto da capa (o que aparece grande no reel)
  destaque: string[];   // 1-3 palavras/expressões a realçar
  momentos?: string[];  // formatos multi (momentos/lista): as linhas em sequência
  fundoPrompt: string;  // prompt da imagem (Flux), em inglês ('' = sem imagem)
  legenda: string;      // legenda do Instagram
  hashtags: string[];   // hashtags
  conceito: string;     // selo curto (o tema em 1-3 palavras)
}

const lp = (s: unknown) => limparTravessoes(String(s ?? '').replace(/^["«»]+|["«»]+$/g, '').trim());

export async function gerarPecaCrescer(
  tematicaId: TematicaId,
  formatoId: FormatoId,
  visualId: VisualId,
  apiKey: string,
  evitar: string[] = [],
  tema?: string,
  vozId: VozId = 'direta',
  seed = 0,
): Promise<PecaCrescer> {
  const tematica = getTematica(tematicaId) ?? getTematica('transformacao')!;
  const formato = getFormato(formatoId) ?? getFormato('frase')!;
  const visual = getVisual(visualId) ?? getVisual('conceptual')!;
  const voz = getVoz(vozId) ?? getVoz('direta')!;
  const semImagem = !visual.promptBase;
  // ARQUÉTIPO de cena desta peça (roda por seed) — para as imagens NÃO repetirem.
  const arqs = visual.arquetipos ?? [];
  const arquetipo = arqs.length ? arqs[((seed % arqs.length) + arqs.length) % arqs.length] : '';

  const sys = `És a voz da conta de Instagram da Vivianne dos Santos (@${CRESCER.handle}) sobre CRESCIMENTO e EVOLUÇÃO. ${CRESCER.posicionamento}

A VOZ (decisão de marca, inviolável): ${CRESCER.voz}

FUNDAMENTO (só por baixo, para pensares mais fundo; PROIBIDO nomeá-lo, citar autores, áreas, véus ou usar jargão no texto): a Vivianne vem destas áreas, ${CRESCER.areas.join(', ')}. Âncoras: ${CRESCER.ancoras.join(' · ')}.

A FONTE PROFUNDA é o livro DELA, "${LIVRO.titulo}". O arco dos sete movimentos (o que cada um ENCOBRE e o que REVELA, NUNCA nomear no texto): ${LIVRO.veus.map((v) => `${v.nome} (encobre ${v.encobre}; revela que ${v.revela})`).join(' · ')}. As correntes que atravessam tudo: ${LIVRO.correntes.join(' · ')}.

O OUTRO LIVRO DELA, "Os 7 Sinais de Desencaixe" (pertencer sem deixar de se ser inteiro; a dor de deixar de caber num lugar que foi bom, sem que ninguém tenha feito nada de errado). Os sinais (não os nomeies como lista; vive-os): ${SINAIS_DESENCAIXE.join(' · ')}.

PROFUNDIDADE (a base de conhecimento dela, só para PENSARES com mais densidade; PROIBIDO nomear conceitos, domínios ou autores no texto, que sai sempre em linguagem de vida real): ${profundidadePorBaixo(seed, 3)}

O que SAI é a vida real, na linguagem das dores e passagens de qualquer pessoa, NUNCA a teoria, NUNCA o nome de um véu, autor ou tradição.

A TEMÁTICA DE HOJE, ${tematica.label}: ${tematica.foco}

O FORMATO, ${formato.label}: ${formato.estrutura}

A VOZ DE HOJE (${voz.label}): ${voz.instrucao}

REGRAS DE VOZ (duras):
- DIGNIDADE (inviolável): a peça abre SEMPRE com uma FACA (a 1.ª linha pára o scroll), nunca um arranque morno ou descritivo. O texto é forte e claro do princípio ao fim, nunca difuso, nunca encheção para ocupar slides. Se não houver uma faca e uma verdade que valham, escreve menos, nunca enches.
- Português europeu NATURAL, falado por uma pessoa real, NUNCA traduzido nem "de manual". PROIBIDO decalques: "nem todo" (nunca "não todo"), "cada" (nunca "a cada"); evita gerúndios de tradução. Lê em voz alta: se soar a máquina, reescreve.
- SEM travessões (— nem –): usa vírgulas, pontos ou parênteses.
- DIRETA: nomeia a cena concreta que a pessoa vive. A pessoa tem de pensar "isto sou eu". Nada de enigmas a decifrar, nada de títulos-conceito herméticos, nada de metáfora obscura.
- VARIA SEMPRE a FORMA de abrir (anti-padrão, importante): NUNCA comeces sempre com "Há...", "Às vezes...", "Talvez...". Roda entre arranques bem diferentes: uma afirmação seca e direta · uma pergunta que vira por dentro · uma cena/imagem concreta · uma inversão (pôr ao contrário o que se assume) · "há quem..." · uma constatação serena · uma 2.ª pessoa suave. Escolhe a forma que MENOS se parece com as frases recentes.
- Profunda mas leve. Nunca pregadora, nunca académica, nunca clichê de autoajuda ("acredite em si", "você merece").
- NUNCA inventes biografia, marcos, clientes ou histórias pessoais da Vivianne. A autoridade vem do caminho ("reconheci primeiro em mim"), não de factos inventados.
- NUNCA táticas de "viralizar" nem isco de engagement vazio. Verdade, não espetáculo da dor.
- A LEGENDA nunca repete nem reformula a frase da capa (quem lê já a viu no ecrã): começa onde a frase acaba, aprofunda ou abre. Parágrafos curtos separados por linha em branco (\\n\\n). Termina com um convite leve (refletir, guardar, partilhar com quem precisa), nunca uma ordem nem venda.
${semImagem ? '- ESTA peça é TIPOGRÁFICA (sem imagem): devolve fundoPrompt como string vazia "".' : '- A IMAGEM vive no MUNDO PÓS-SOBREVIVÊNCIA (consciência evoluída materializada em arquitetura, paisagem e ESCALA; nunca néon, sci-fi, robôs, doméstico, terapia literal). TRADUZ o sentimento da FRASE pela TENSÃO entre o mundo antigo (pesado, o encaixe forçado) e o que emerge (orgânico, luminoso, escala impossível). REGRA DE OURO: mostra o LIMIAR e a tensão, NUNCA a chegada como solução; o novo mundo vislumbra-se ao longe, por uma fenda, no horizonte. Inventa uma cena concreta e ORIGINAL (segue o estilo do visual), diferente das anteriores, com escala que provoca admiração em 5 segundos.'}

DEVOLVE APENAS JSON válido, sem texto à volta:
{
  "titulo": "título interno curto (2-4 palavras)",
  "conceito": "o tema em 1 a 3 palavras (selo da capa)",
  "frase": "o texto da CAPA: ${formato.multi ? 'a 1.ª linha/faca que para o scroll' : 'a frase única (1 a 3 linhas curtas)'}, sem aspas",
  "destaque": ["1 a 3 palavras ou expressões EXATAS da frase para realçar"],
  "fundoPrompt": ${semImagem ? '""' : `"prompt em INGLÊS: UMA cena concreta e original que TRADUZA VISUALMENTE o sentimento da frase que escreveste acima (ligação imagem↔texto).${arquetipo ? ` PARTE OBRIGATORIAMENTE deste arquétipo de cena (compõe-o à tua maneira, ligado à frase, NUNCA um desfiladeiro/garganta verde): ${arquetipo}.` : ''} Estilo ${visual.label}. ${visual.variar} Escreve a cena específica e termina com este estilo/qualidade: ${visual.promptBase}"`},
  "legenda": "legenda para Instagram, parágrafos curtos separados por \\n\\n, SEM repetir a frase da capa, a terminar num convite leve",
  "hashtags": ["8 a 12 hashtags em português, de crescimento/autoconhecimento/evolução, sem repetir"]${formato.multi ? ',\n  "momentos": ["As telas em sequência, EXATAMENTE conforme a estrutura do formato indicada acima. A 1.ª tela é a CAPA (igual ao campo frase). Cada tela é uma respiração/parágrafo conforme o formato, todas diferentes, sem repetir a ideia. Sem travessões, leitura clara e interessante do princípio ao fim."]' : ''}
}`;

  const pedido = tema?.trim()
    ? `Uma peça de ${tematica.label} no formato ${formato.label}, a partir de: "${tema.trim()}".`
    : `Uma peça de ${tematica.label} no formato ${formato.label}.`;
  const naoRepetir = evitar.length
    ? `\n\nNÃO repitas estas frases/ângulos já usados (encontra outro): ${evitar.slice(-20).map((e) => `"${e}"`).join('; ')}.`
    : '';
  // ANTI-PADRÃO de ABERTURA: junta os primeiros 2 termos das frases recentes para o
  // modelo NÃO começar sempre igual (ex.: "Há...", "Há...", "Às vezes...").
  const aberturas = [...new Set(evitar.map((e) => e.split(/\s+/).slice(0, 2).join(' ').trim().toLowerCase()).filter(Boolean))].slice(-14);
  const evitarAberturas = aberturas.length
    ? `\n\nABERTURAS recentes (começa de forma DIFERENTE, NUNCA repitas o mesmo arranque, sobretudo "Há..." e "Às vezes..."): ${aberturas.map((a) => `"${a}…"`).join('; ')}.`
    : '';

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: formato.multi ? 2800 : 1200, // o carrossel pode ter 8-13 slides de texto
      system: sys,
      messages: [{ role: 'user', content: pedido + naoRepetir + evitarAberturas }],
    }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}`);
  const txt = ((await res.json())?.content?.[0]?.text ?? '').trim();

  let o: Partial<Record<keyof PecaCrescer, unknown>> = {};
  try { const m = txt.match(/\{[\s\S]*\}/); o = JSON.parse(m ? m[0] : txt); } catch { /* fallback abaixo */ }

  const momentos = Array.isArray(o.momentos) ? (o.momentos as unknown[]).map((x) => lp(x)).filter(Boolean) : [];
  const frase = lp(o.frase) || momentos[0] || '';
  if (!frase) throw new Error('sem frase');
  const destaque = Array.isArray(o.destaque) ? (o.destaque as unknown[]).map((x) => lp(x)).filter(Boolean) : [];
  const hashtags = Array.isArray(o.hashtags)
    ? (o.hashtags as unknown[]).map((x) => String(x).trim()).filter(Boolean)
    : [...CRESCER.hashtagsBase];
  return {
    titulo: lp(o.titulo) || frase.slice(0, 40),
    conceito: lp(o.conceito),
    frase,
    destaque,
    momentos: formato.multi && momentos.length > 1 ? momentos : undefined,
    fundoPrompt: semImagem ? '' : lp(o.fundoPrompt),
    legenda: lp(o.legenda),
    hashtags,
  };
}
