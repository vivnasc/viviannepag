import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { gerarSlideComClaude } from "@/lib/carousel-generate";
import type { Dia } from "@/lib/carousel-types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/colecoes/[id]/regenerate-slide
 * Body: { diaIdx: number, slideIdx: number, hint?: string }
 * Carrega a colecção, pede ao Claude para regerar UM slide preservando
 * o tipo. Não persiste — devolve o novo slide e o cliente decide se grava.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ erro: "ANTHROPIC_API_KEY não configurada" }, { status: 500 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    diaIdx?: number;
    slideIdx?: number;
    hint?: string;
  };
  const diaIdx = Number(body.diaIdx);
  const slideIdx = Number(body.slideIdx);
  if (!Number.isInteger(diaIdx) || !Number.isInteger(slideIdx)) {
    return NextResponse.json({ erro: "diaIdx e slideIdx obrigatórios" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ erro: "Supabase admin indisponível" }, { status: 500 });
  }

  const { data, error } = await admin
    .from("carousel_collections")
    .select("dias")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) {
    return NextResponse.json({ erro: "colecção não encontrada" }, { status: 404 });
  }
  const dias = data.dias as Dia[];
  const dia = dias[diaIdx];
  if (!dia) {
    return NextResponse.json({ erro: "diaIdx fora do range" }, { status: 400 });
  }

  try {
    const { slide, usage } = await gerarSlideComClaude({
      apiKey,
      dia,
      slideIdx,
      hint: body.hint,
    });
    return NextResponse.json({ slide, usage });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: `Claude falhou: ${msg}` }, { status: 502 });
  }
}
