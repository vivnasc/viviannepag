import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { VOZ_REGRAS } from '@/lib/livro-voz';
import { readLivroEn, writeLivroEn, kickerEn, type LivroEn } from '@/lib/livro-traducao';
import livroPt from '@/livro/livro.json';

export const runtime = 'nodejs';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const POR_LOTE = 2; // unidades por chamada (fica dentro do tempo máximo)

const SYSTEM = `És o tradutor literário de Vivianne dos Santos. Traduzes o livro "A Grande Transição" de português europeu para INGLÊS, com a mesma alma.

${VOZ_REGRAS}

Tradução:
- Inglês literário, natural e sóbrio (nem britânico afetado nem americano coloquial). Ritmo de ensaio, não de manual.
- Fidelidade ao sentido e ao tom. Não resumas, não expandas, não expliques o que a autora deixou implícito.
- Recebes um objeto JSON com campos em português. Devolves SÓ um objeto JSON com as MESMAS chaves, traduzidas para inglês.
- Nos arrays (texto, destaque) mantém o MESMO número de elementos, um por um.
- Devolve APENAS o JSON, sem cercas de código, sem comentários, sem texto à volta.`;

function camposTraduziveis(u: Record<string, unknown>) {
  const o: Record<string, unknown> = {};
  if (u.titulo) o.titulo = u.titulo;
  if (u.epigrafe) o.epigrafe = u.epigrafe;
  if (Array.isArray(u.texto)) o.texto = u.texto;
  if (u.ideia) o.ideia = u.ideia;
  if (u.dica) o.dica = u.dica;
  if (u.pergunta) o.pergunta = u.pergunta;
  if (Array.isArray(u.destaque)) o.destaque = u.destaque;
  return o;
}

async function traduzUnidade(apiKey: string, u: Record<string, unknown>): Promise<Record<string, unknown>> {
  const campos = camposTraduziveis(u);
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-opus-4-7',
      max_tokens: 8000,
      system: SYSTEM,
      messages: [{ role: 'user', content: JSON.stringify(campos, null, 2) }],
    }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = (await res.json()) as { content?: Array<{ text?: string }> };
  const txt = json.content?.[0]?.text ?? '';
  const ini = txt.indexOf('{');
  const fim = txt.lastIndexOf('}');
  if (ini < 0 || fim < 0) throw new Error('resposta sem JSON');
  const trad = JSON.parse(txt.slice(ini, fim + 1)) as Record<string, unknown>;
  // devolve a unidade completa: kicker determinístico + campos traduzidos + resto
  return {
    ...u,
    kicker: kickerEn(String(u.kicker ?? '')),
    ...trad,
    _en: true,
  };
}

// POST — traduz o próximo lote de unidades por traduzir. Resumível.
export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const src = livroPt as unknown as LivroEn;
  let en = await readLivroEn();
  if (!en) {
    en = {
      titulo: 'The Great Transition',
      subtitulo: 'Introduction to the Sciences of Emerging Consciousness',
      selo: 'Sciences of Emerging Consciousness',
      autora: 'Vivianne dos Santos',
      unidades: src.unidades.map((u) => ({ ...u, _en: false })),
    };
  }

  const total = en.unidades.length;
  const feitasAntes = en.unidades.filter((u) => u._en === true).length;

  let feitasAgora = 0;
  for (let i = 0; i < en.unidades.length && feitasAgora < POR_LOTE; i++) {
    if (en.unidades[i]._en === true) continue;
    try {
      en.unidades[i] = await traduzUnidade(apiKey, src.unidades[i]);
      feitasAgora++;
    } catch (e) {
      await writeLivroEn(en); // guarda o progresso feito até aqui
      return NextResponse.json(
        { erro: 'traducao', detalhe: e instanceof Error ? e.message : String(e), feitas: feitasAntes + feitasAgora, total },
        { status: 502 },
      );
    }
  }

  await writeLivroEn(en);
  const feitas = feitasAntes + feitasAgora;
  return NextResponse.json({ ok: true, feitas, total, terminado: feitas >= total });
}
