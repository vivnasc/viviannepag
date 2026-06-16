import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getFormato } from '@/lib/metodo/formatos';
import { gerarFormatoBeats } from '@/lib/metodo/formato-ia';
import type { VeuNome } from '@/lib/metodo/contas';

export const runtime = 'nodejs';
export const maxDuration = 120;

// POST { formato, veu } — CAMADA 1: gera os BEATS de um motor editorial para um
// véu (SÓ texto, sem recipiente/render). É o "gera um e mostra" dos motores.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { formato?: string; veu?: string; evitar?: string[] };
  const formato = getFormato(body.formato ?? '');
  if (!formato) return NextResponse.json({ erro: 'formato-desconhecido' }, { status: 400 });
  const veu = (body.veu ?? '') as VeuNome;
  if (!veu) return NextResponse.json({ erro: 'veu' }, { status: 400 });
  // MEMÓRIA anti-repetição: o cliente manda os ângulos já gerados deste véu; o
  // motor é obrigado a fugir deles e a procurar um ângulo novo de cada vez.
  const evitar = Array.isArray(body.evitar) ? body.evitar.filter((s) => typeof s === 'string') : [];

  try {
    const beats = await gerarFormatoBeats(formato, veu, apiKey, evitar);
    return NextResponse.json({ ok: true, formato: formato.id, nome: formato.nome, veu, beats });
  } catch (e) {
    return NextResponse.json({ erro: 'ia', detalhe: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
