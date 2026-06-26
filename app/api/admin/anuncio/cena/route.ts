import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { lerManifesto, definirCena, apagarFicheiros } from '@/lib/anuncio/manifest';
import GUIOES from '@/lib/anuncio/guiao.json';

export const runtime = 'nodejs';
export const maxDuration = 300;

type Cena = { id: string; cenaPrompt: string };

// PASSO 1 (por PLANO): gera a imagem de UMA cena do anúncio (9:16) com a IA da casa
// (Flux). NÃO é a capa do livro chapada — é uma cena cinematográfica do mundo de
// Véspera. O anúncio tem VÁRIOS planos (4), que vão trocando ao longo do vídeo; cada
// um gera-se aqui, um de cada vez. A e B têm planos diferentes (ver cenas[] no guião).
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'falta REPLICATE_API_TOKEN' }, { status: 500 });

  let variante = 'A', idx = 0;
  try { const b = await req.json(); if (b?.variante === 'B') variante = 'B'; if (Number.isInteger(b?.idx)) idx = b.idx; } catch {}
  const g = (GUIOES as Record<string, { cenas?: Cena[] }>)[variante];
  const cena = g?.cenas?.[idx];
  if (!cena?.cenaPrompt) return NextResponse.json({ erro: 'sem-cena-no-guiao' }, { status: 400 });

  try {
    const sb = getSupabaseAdmin();
    // o que este plano tinha antes (para apagar o ficheiro órfão) + lixo legado
    const antes = await lerManifesto(sb, variante);
    const orfaos = [antes.cenas?.[idx]?.cenaUrl, antes.cenas?.[idx]?.motionUrl, antes.cenaUrl, antes.motionUrl];
    // raw = o prompt é a cena completa; só as regras de segurança por cima (a cena já
    // traz o estilo painterly, a paleta e o mood de Véspera).
    const replicateUrl = await gerarImagemFlux(cena.cenaPrompt, token, { raw: true });
    const cenaUrl = await guardarImagem(replicateUrl, `anuncios/cena-${variante.toLowerCase()}-${idx}-${Date.now()}.jpg`);
    // a imagem MUDOU → o motion antigo deste plano deixa de servir; limpa-o.
    await definirCena(sb, variante, idx, { cenaUrl, motionUrl: undefined });
    // zero lixo: apaga a imagem/motion anteriores deste plano e a cena única legada.
    await apagarFicheiros(sb, orfaos);
    return NextResponse.json({ ok: true, url: cenaUrl, idx });
  } catch (e) {
    return NextResponse.json({ erro: (e as Error).message }, { status: 500 });
  }
}
