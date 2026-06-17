import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { CONTAS, type ContaId } from '@/lib/metodo/contas';
import { CALENDARIO_UNIVERSO } from '@/lib/metodo/universo';
import { personagensPorVeu } from '@/lib/metodo/personagens';
import { gerarReelAnatomia } from '@/lib/metodo/reel-ia';

export const runtime = 'nodejs';
export const maxDuration = 300;

// UNIVERSO VS · gera a SEMANA de UMA conta (os 7 dias, 1 véu/dia), à anatomia.
// Autónomo: a personagem é escolhida pelo sistema (roda pelas que atravessam o
// véu), a Vivianne NÃO escolhe nada. SÓ texto (sem imagem/render). A página chama
// esta rota uma vez por conta (4x), para não estourar o tempo da função.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { conta?: string };
  const contaId = (body.conta ?? '') as ContaId;
  if (!CONTAS[contaId] || contaId === undefined) return NextResponse.json({ erro: 'conta-desconhecida' }, { status: 400 });

  const evitar: string[] = []; // anti-repetição dentro da semana desta conta (hooks)
  const dias: { wd: number; nome: string; veu: string; personagem: string; reel: Awaited<ReturnType<typeof gerarReelAnatomia>> | null }[] = [];

  for (let i = 0; i < CALENDARIO_UNIVERSO.length; i++) {
    const d = CALENDARIO_UNIVERSO[i];
    const pool = personagensPorVeu(d.veu);
    if (!pool.length) { dias.push({ wd: d.wd, nome: d.nome, veu: d.veu, personagem: '', reel: null }); continue; }
    // roda a máscara: desloca por dia + conta para variar entre contas no mesmo dia.
    const offset = i + CONTAS[contaId].handle.length;
    const personagem = pool[offset % pool.length];
    try {
      const reel = await gerarReelAnatomia(contaId, d.veu, personagem, apiKey, evitar);
      if (reel.hook) evitar.push(reel.hook);
      dias.push({ wd: d.wd, nome: d.nome, veu: d.veu, personagem: personagem.nome, reel });
    } catch {
      dias.push({ wd: d.wd, nome: d.nome, veu: d.veu, personagem: personagem.nome, reel: null });
    }
  }

  return NextResponse.json({ ok: true, conta: contaId, dias });
}
