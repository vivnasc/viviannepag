import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';

const SYSTEM = `És assistente de escrita da Vivianne dos Santos. Escreves em português europeu, na voz dela: directo, na 2ª pessoa do singular ("tu"), italics para ênfase, frases curtas alternadas com reflexivas mais longas, sem chavões, sem jargão clínico, terapêutico mas firme. Usas "## " para sub-cabeçalhos. Tópicos: o "nó" (padrões herdados), véus (proteções psíquicas), presença, sistemas familiares, voltar a si. Imagística concreta (fio, casa, silêncio, gesto). Nunca termines com "espero que te ajude" ou genericidades. Termina o texto numa linha curta com peso.`;

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ erro: 'auth' }, { status: 401 });
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });
  }

  const body = (await req.json()) as {
    prompt?: string;
    titulo?: string;
    tematica?: string;
    modo?: 'esboco' | 'titulo' | 'resumo' | 'continuar' | 'expandir' | 'sugerir-temas' | 'prompt-imagem';
    contexto?: string;
    escritosExistentes?: string;
  };

  let userPrompt = '';
  switch (body.modo) {
    case 'titulo':
      userPrompt = `Sugere 5 títulos curtos (5–9 palavras), poéticos mas concretos, para um texto sobre: ${body.prompt}.\nResponde só com a lista numerada.`;
      break;
    case 'resumo':
      userPrompt = `Lê este texto e devolve um resumo de 1 a 2 frases (até 35 palavras), no tom dela, que aguce a leitura sem dar tudo:\n\n${body.contexto}`;
      break;
    case 'continuar':
      userPrompt = `Continua este texto a partir de onde parou, mantendo a voz. Não repitas o que já está escrito.\n\n${body.contexto}`;
      break;
    case 'expandir':
      userPrompt = `Este texto está demasiado curto/resumido. Expande-o para o dobro do tamanho mantendo a voz, o ritmo e a estrutura. Aprofunda as ideias, acrescenta exemplos concretos e imagens. Não mudes o titulo, não mudes o tom. Devolve o texto completo (com as partes originais integradas, não separadas).\n\n${body.contexto}`;
      break;
    case 'sugerir-temas':
      userPrompt = `Estes são os escritos já publicados pela Vivianne, organizados por temática:\n\n${body.escritosExistentes}\n\nCom base nisto, sugere 6 novos temas para escritos (2 por temática: o-no, presenca, veu). Para cada:\n- Título (5–9 palavras, poético mas concreto)\n- Temática (o-no / presenca / veu)\n- Resumo (1 frase, até 25 palavras)\n- Porquê este tema (1 frase justificando o gap)\n\nFormato: lista numerada, campos separados por " | ".`;
      break;
    case 'prompt-imagem':
      userPrompt = `Lê este texto e cria um prompt para o Midjourney que capture a essência visual do texto. O prompt deve funcionar directamente no Midjourney (em inglês). Termina com --ar 3:2 --v 6.\n\nSe o utilizador indicou um estilo preferido, respeita-o. Caso contrário, escolhe algo contemplativo e atmosférico que combine com o tom do texto.\n\n${body.contexto ? `Estilo preferido: ${body.prompt || 'livre'}\n\nTexto:\n${body.contexto}` : `Tema: ${body.prompt}`}\n\nResponde APENAS com o prompt, sem explicações.`;
      break;
    case 'esboco':
    default:
      userPrompt = `Escreve um texto novo no estilo da Vivianne sobre: ${body.prompt}.${
        body.titulo ? `\nTítulo sugerido: ${body.titulo}.` : ''
      }${
        body.tematica ? `\nTemática: ${body.tematica}.` : ''
      }\n\nO texto deve ter 400–600 palavras. Usa 2–3 sub-cabeçalhos com "## ". Inclui ao menos uma frase em **negrito** como remate de secção.`;
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-7',
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ erro: 'anthropic', detalhe: text }, { status: 500 });
  }
  const json = await res.json();
  const texto =
    (json.content?.[0]?.text as string | undefined) ?? '';
  return NextResponse.json({ texto });
}
