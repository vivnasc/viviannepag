// SOULAB · gerador de UMA peça (reel contemplativo) a partir de um ÂNGULO.
//
// Uma peça = um reel 9:16 simples e elegante: uma imagem simbólica + um fragmento
// de texto que se revela (vehículo 'kinetico', o mesmo render já testado). O que
// muda por tipo é a VOZ e a IMAGEM (o ângulo da investigação), nunca a estrutura.
//
// Só devolve texto/indicações (a imagem gera-se a seguir, no route, com Flux).

import { SOULAB, getTipoSoulab, type TipoSoulabId } from './marca';
import { limparTravessoes } from '@/lib/texto';

export interface PecaSoulab {
  titulo: string;       // título interno curto (não vai para o feed)
  frase: string;        // o texto que aparece no reel (o fragmento)
  destaque: string[];   // 1-3 palavras a realçar (ouro/lilás no kinetico)
  fundoPrompt: string;  // prompt da imagem simbólica (Flux), em inglês
  legenda: string;      // legenda do Instagram (parágrafos curtos)
  hashtags: string[];   // hashtags
  conceito: string;     // selo curto (ex.: nome do arquétipo / do símbolo)
  momentos?: string[];  // formato "vários momentos": 3-5 linhas que desdobram a ideia
}

const lp = (s: unknown) => limparTravessoes(String(s ?? '').replace(/^["«»]+|["«»]+$/g, '').trim());

export async function gerarPecaSoulab(
  tipoId: TipoSoulabId,
  apiKey: string,
  evitar: string[] = [],
  tema?: string,
  formato: 'frase' | 'momentos' = 'frase',
  evitarImg: string[] = [], // CENAS de imagem já usadas (para não repetir portas/objetos partidos)
  continuarDe?: { frase: string; conceito?: string } | null, // PARTE 2 de um reel que resultou
  modo: 'abre' | 'encaminha' = 'abre', // 'abre' = deixa em aberto; 'encaminha' = desdobra e pousa
): Promise<PecaSoulab> {
  const tipo = getTipoSoulab(tipoId) ?? getTipoSoulab('frase')!;

  const sys = `És a curadoria criativa da SOULAB (@${SOULAB.handle}) — ${SOULAB.posicionamento}

A MISSÃO: ${SOULAB.missao}

O QUE A SOULAB É (e o que a distingue):
- ${SOULAB.distincao.join('\n- ')}
Cada publicação é tratada como uma EXPERIÊNCIA DE LABORATÓRIO: uma observação, um símbolo, uma hipótese ou um fragmento de algo maior. Não é uma conta de frases motivacionais nem uma página espiritual tradicional.

O TOM (a régua de cada peça, sem exceção): ${SOULAB.tom.join(' · ')}.

A VOZ DA SOULAB (decisão de marca, inviolável): ${SOULAB.voz}.

AMPLA, ANCORADA: a Soulab explora a alma humana em geral, mas o seu centro de gravidade é o território real desta curadoria. Estas correntes dão GRAVIDADE (não são o tema obrigatório, são o que atravessa tudo): ${SOULAB.territorio.join(' · ')}.
ÂNCORAS DE PROFUNDIDADE (só para pensares mais fundo; PROIBIDO nomeá-las, citar autores ou usar jargão no texto): ${SOULAB.ancoras.join(' · ')}.
NÃO uses os 7 véus nem o baralho de personagens "Sou Aquela" (Salvadora, Provedora, Órfã…): isso pertence a outra conta. A Soulab é mais ampla e mais impessoal.

ESTE ÂNGULO DE HOJE — ${tipo.label}: ${tipo.descricao}
${tipo.angulo}

REGRAS DE VOZ (duras):
- Português europeu, elegante e límpido. SEM travessões (— nem –): usa vírgulas, pontos ou parênteses.
- Profundo mas leve; nunca pesado, nunca pregador, nunca académico, nunca kitsch místico.
- CONVITE, não confissão: impessoal e aberto. NUNCA "isto és tu", nunca um diagnóstico da pessoa que lê.
- NÃO motivacional, NÃO conselho, NÃO autoajuda, NÃO "põe-te em primeiro". Explora, não convence.
- Deixa a peça ABERTA: uma pergunta interessante vale mais que uma resposta fechada.
- A legenda termina SEMPRE com um CTA, mas LEVE (um convite, não uma ordem): ficar com a pergunta, guardar para um momento de silêncio, partilhar com quem precisa, seguir o laboratório. NUNCA vender, NUNCA "link na bio", NUNCA imperativo agressivo.
- A FRASE que aparece no ecrã é CURTA (cabe grande num reel 9:16): uma a três linhas, densa, com uma virada.
- A IMAGEM é arte conceptual/simbólica/surrealista/contemplativa: SEM pessoas reconhecíveis a posar, SEM texto, SEM letras, SEM marcas de água. Original, não um postal genérico.

DEVOLVE APENAS JSON válido, sem texto à volta:
{
  "titulo": "título interno curto (2-4 palavras)",
  "conceito": "selo curto para a capa (ex.: o nome do arquétipo, do símbolo ou do tema) — 1 a 3 palavras",
  "frase": "o fragmento que aparece no reel (1 a 3 linhas curtas, sem aspas)",
  "destaque": ["1 a 3 palavras-chave da frase para realçar"],
  "fundoPrompt": "prompt em INGLÊS para a imagem simbólica de fundo (arte conceptual, fine art, evocativa do sentido), sem pessoas a posar, sem texto, a terminar com --ar 9:16 --style raw",
  "legenda": "legenda para Instagram em parágrafos curtos separados por LINHA EM BRANCO (\\n\\n). Abre com o fragmento ou um gancho contemplativo; 1 a 2 parágrafos curtos que exploram a hipótese SEM a fechar. TERMINA SEMPRE (obrigatório) com um CTA LEVE numa linha à parte: um convite suave a ficar com a pergunta, a guardar, a partilhar com quem precisa, ou a seguir o laboratório. O CTA é gentil e contemplativo, NUNCA marketing, NUNCA 'compra/link na bio', NUNCA imperativo agressivo. Nunca vender, nunca nomear o formato.",
  "hashtags": ["8 a 12 hashtags em português, simbólicas e de nicho da alma/arte/arquétipos, sem repetir"]${formato === 'momentos' ? ',\n  "momentos": ["3 a 5 LINHAS curtas que desdobram UMA só ideia, em sequência (cada uma uma respiração, aparecem uma a uma sobre a mesma cena). Não são frases soltas: constroem um arco (abre, aprofunda, vira, fecha em aberto). A 1.ª é uma faca que para o scroll; a última deixa uma pergunta ou um eco. Mesma voz de convite, sem travessões."]' : ''}
}`;

  const pedido = tema?.trim()
    ? `Uma peça Soulab no ângulo ${tipo.label}, a partir de: "${tema.trim()}".`
    : `Uma peça Soulab no ângulo ${tipo.label}.`;
  // CONTINUAR O FIO: parte 2 de um reel que resultou. Mantém a voz e a atmosfera,
  // aprofunda ou vira a ideia, NÃO repete a frase nem diz "parte 2".
  // MODO ENCAMINHA: o terceiro tempo que falta. Não deixa a peça só aberta; desdobra
  // e pousa num movimento. Continua a NÃO ser conselho/ordem/autoajuda (regra da marca).
  const encaminhar = modo === 'encaminha'
    ? `\n\nMODO ENCAMINHA (importante nesta peça): NÃO a deixes totalmente aberta. Depois de abrir, DESDOBRA mais uma volta (o mecanismo por baixo, o que a maioria não vê) e POUSA num movimento sentido: uma direção pequena e concreta onde a pessoa pode descansar, o alívio a que o método chama "soltar". NÃO é resposta fechada, NÃO é conselho, NÃO é ordem nem autoajuda; é o terceiro tempo. Vale para a frase/momentos E para a legenda (a legenda desdobra e POUSA, em vez de só perguntar).`
    : '';
  const seguimento = continuarDe?.frase
    ? `\n\nISTO É UM REEL DE SEGUIMENTO. Um reel anterior resultou muito: "${continuarDe.frase}"${continuarDe.conceito ? ` (tema: ${continuarDe.conceito})` : ''}. Escreve a CONTINUAÇÃO desse fio, no MESMO registo e voz: aprofunda ou vira a ideia para um ângulo novo. Aguenta-se sozinha, mas quem viu a primeira sente-a como o passo seguinte. NÃO repitas a frase nem anuncies "parte 2".`
    : '';
  const naoRepetir = evitar.length
    ? `\n\nNÃO repitas estes ângulos/frases/símbolos já usados (encontra outro): ${evitar.slice(-40).map((e) => `"${e}"`).join('; ')}.`
    : '';
  // ALARGAR O MUNDO IMAGÉTICO (pedido da Vivianne) sem perder a identidade: o
  // imaginário andava preso em portas e objetos partidos. Damos REGISTOS amplos
  // (não cenas prontas) e as cenas recentes a evitar, mantendo o fine art contemplativo.
  const naoRepetirImg = `\n\nIMAGEM, AMPLIA O IMAGINÁRIO mantendo a identidade (fine art, contemplativo, simbólico, sem pessoas a posar, sem texto): NÃO recaias sempre em portas, soleiras e objetos partidos. Há mundo por explorar no natural e cósmico (água, neblina, fogo, céu, pedra, deserto, oceano, raízes, sementes, constelações), no líquido e no têxtil, no mineral e no botânico, na arquitetura do vazio, na luz e na sombra, no microscópico e no imenso. Que cada imagem traga um SUJEITO inesperado.${evitarImg.length ? ` E foge destas cenas recentes: ${evitarImg.slice(-10).map((e) => `"${String(e).slice(0, 90)}"`).join('; ')}.` : ''}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1100,
      system: sys,
      messages: [{ role: 'user', content: pedido + encaminhar + seguimento + naoRepetir + naoRepetirImg }],
    }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}`);
  const txt = ((await res.json())?.content?.[0]?.text ?? '').trim();

  let o: Partial<Record<keyof PecaSoulab, unknown>> = {};
  try { const m = txt.match(/\{[\s\S]*\}/); o = JSON.parse(m ? m[0] : txt); } catch { /* fallback abaixo */ }

  const momentos = Array.isArray(o.momentos) ? (o.momentos as unknown[]).map((x) => lp(x)).filter(Boolean) : [];
  const frase = lp(o.frase) || momentos[0] || '';
  if (!frase) throw new Error('sem frase');
  const destaque = Array.isArray(o.destaque) ? (o.destaque as unknown[]).map((x) => lp(x)).filter(Boolean) : [];
  const hashtags = Array.isArray(o.hashtags)
    ? (o.hashtags as unknown[]).map((x) => String(x).trim()).filter(Boolean)
    : [...SOULAB.hashtagsBase];
  return {
    titulo: lp(o.titulo) || frase.slice(0, 40),
    conceito: lp(o.conceito),
    frase,
    destaque,
    fundoPrompt: lp(o.fundoPrompt),
    legenda: lp(o.legenda),
    hashtags,
    momentos: formato === 'momentos' && momentos.length > 1 ? momentos : undefined,
  };
}
