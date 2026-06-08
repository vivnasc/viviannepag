import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { gerarImagemFlux, guardarImagem, ESTILOS } from '@/lib/banda/flux';

export const runtime = 'nodejs';
export const maxDuration = 300;

// POST { estilos?: string[], cena?: string } — gera UMA ilustração por estilo
// pedido, com a MESMA cena, para a Vivianne comparar e escolher a assinatura
// visual da série. Devolve [{ estilo, nome, imageUrl }].
const CENA_AMOSTRA = 'a woman at home in the evening, holding a phone, a quiet tender domestic moment, warm kitchen light, seen from a calm distance';

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'sem-replicate-token' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { estilos?: string[]; cena?: string };
  const pedidos = (Array.isArray(body.estilos) && body.estilos.length ? body.estilos : Object.keys(ESTILOS)).filter((e) => ESTILOS[e]);
  const cena = (body.cena || '').trim() || CENA_AMOSTRA;

  const ts = Date.now();
  const amostras = await Promise.all(
    pedidos.map(async (estilo) => {
      try {
        const url = await gerarImagemFlux(cena, token, estilo);
        let imageUrl = url;
        try { imageUrl = await guardarImagem(url, `banda/amostras/${estilo}-${ts}.jpg`); } catch { /* fica o URL do Replicate */ }
        return { estilo, nome: ESTILOS[estilo].nome, imageUrl };
      } catch (e) {
        return { estilo, nome: ESTILOS[estilo].nome, imageUrl: null, erro: e instanceof Error ? e.message : String(e) };
      }
    }),
  );
  return NextResponse.json({ amostras });
}
