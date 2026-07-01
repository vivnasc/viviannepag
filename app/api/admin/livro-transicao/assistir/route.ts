import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { VOZ_REGRAS } from '@/lib/livro-voz';

export const runtime = 'nodejs';
export const maxDuration = 120;
export const dynamic = 'force-dynamic';

const SYSTEM = `És o editor literário de Vivianne dos Santos para o livro "A Grande Transição · Introdução às Ciências da Consciência Emergente".

A tua tarefa: reescrever UMA passagem do livro seguindo o COMENTÁRIO dela, sem trair a voz dela.

${VOZ_REGRAS}

Mais:
- Português europeu (PT-PT). Nunca português do Brasil.
- Mantém o sentido e o argumento da passagem, a não ser que o comentário peça outra coisa.
- Faz exatamente o que o comentário pede (encurtar, aclarar, dar mais força, mudar o tom, etc.).
- Devolve APENAS a passagem reescrita, em prosa corrida. Sem aspas, sem títulos, sem explicações, sem "Aqui está", sem opções.`;

// POST { titulo, passagem, comentario } — devolve { sugestao } reescrita.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json()) as { titulo?: string; passagem?: string; comentario?: string };
  const passagem = (body.passagem ?? '').trim();
  const comentario = (body.comentario ?? '').trim();
  if (!passagem) return NextResponse.json({ erro: 'sem-passagem' }, { status: 400 });
  if (!comentario) return NextResponse.json({ erro: 'sem-comentario' }, { status: 400 });

  const prompt = [
    body.titulo ? `Capítulo: "${body.titulo}".` : '',
    '',
    'Passagem a reescrever:',
    passagem,
    '',
    'Comentário da Vivianne (o que ela quer):',
    comentario,
    '',
    'Reescreve a passagem seguindo o comentário. Devolve só o texto reescrito.',
  ]
    .filter((l) => l !== undefined)
    .join('\n');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-7',
      max_tokens: 1500,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    return NextResponse.json(
      { erro: 'claude', detalhe: (await res.text()).slice(0, 300) },
      { status: 502 },
    );
  }
  const json = (await res.json()) as { content?: Array<{ text?: string }> };
  const sugestao = (json.content?.[0]?.text ?? '').trim();
  if (!sugestao) return NextResponse.json({ erro: 'vazio' }, { status: 502 });
  return NextResponse.json({ ok: true, sugestao });
}
