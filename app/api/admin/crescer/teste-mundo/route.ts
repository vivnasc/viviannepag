import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { cenaMundoTeste } from '@/lib/crescer/mundo-teste';

export const runtime = 'nodejs';
export const maxDuration = 300;

// SANDBOX · gera AMOSTRAS do mundo a partir do motor de TESTE (mundo-teste.ts).
// NÃO cria posts, NÃO toca em nada — só devolve URLs para a Vivianne ver e afinar.
// Guarda em crescer/_teste/ (lixo descartável). Passa pela grade editorial (claro).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'sem-replicate' }, { status: 500 });
  const body = (await req.json().catch(() => ({}))) as { quantos?: number; seed?: number };
  const quantos = Math.max(1, Math.min(6, body.quantos ?? 4));
  const base = typeof body.seed === 'number' ? body.seed : Math.floor(Date.now() / 1000);

  const amostras: { url: string; categoria: string }[] = [];
  let ultimoErro = '';
  for (let i = 0; i < quantos; i++) {
    const seed = base + i * 7;
    const { briefing, categoria } = cenaMundoTeste(seed);
    try {
      const url = await gerarImagemFlux(briefing, token, { raw: true });
      let saved = url;
      try { saved = await guardarImagem(url, `crescer/_teste/${Date.now()}-${i}.jpg`); } catch { /* fica o url cru */ }
      amostras.push({ url: saved, categoria });
    } catch (e) { ultimoErro = String(e instanceof Error ? e.message : e); }
  }
  if (!amostras.length) return NextResponse.json({ erro: 'falhou', detalhe: ultimoErro }, { status: 502 });
  return NextResponse.json({ ok: true, amostras });
}
