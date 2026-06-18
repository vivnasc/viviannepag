import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { CONTAS, type ContaId, type VeuNome } from '@/lib/metodo/contas';
import { veuDoDia, personagemDoDia } from '@/lib/metodo/peca';
import { gerarStoryboard, type TipoPeca } from '@/lib/metodo/storyboard-ia';

export const runtime = 'nodejs';
export const maxDuration = 120;

// Gera o STORYBOARD de UMA peça (conta × tipo × dia) à mecânica + veste da conta.
// SÓ texto/indicações de imagem (sem render). "Gera um e mostra" das 2 peças/dia.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { conta?: string; tipo?: string; dia?: string; evitar?: string[]; clarificar?: boolean };
  const contaId = (body.conta ?? '') as ContaId;
  if (!CONTAS[contaId]) return NextResponse.json({ erro: 'conta-desconhecida' }, { status: 400 });
  const tipo = (body.tipo === 'profundidade' ? 'profundidade' : 'descoberta') as TipoPeca;
  const evitar = Array.isArray(body.evitar) ? body.evitar.filter((s) => typeof s === 'string') : [];
  const clarificar = body.clarificar === true;

  // o dia (default hoje); o véu e a personagem do dia (partilhados pelas contas).
  let d = new Date();
  if (body.dia && /^\d{4}-\d{2}-\d{2}$/.test(body.dia)) { const [y, m, dd] = body.dia.split('-').map(Number); d = new Date(y, m - 1, dd); }
  const veu = veuDoDia(d) as VeuNome;
  const personagem = personagemDoDia(veu, d);
  if (!personagem) return NextResponse.json({ erro: 'sem-personagem' }, { status: 409 });

  try {
    const sb = await gerarStoryboard(contaId, tipo, veu, personagem, apiKey, evitar, clarificar);
    return NextResponse.json({ ok: true, conta: contaId, veu, personagem: personagem.nome, ...sb });
  } catch (e) {
    return NextResponse.json({ erro: 'ia', detalhe: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
