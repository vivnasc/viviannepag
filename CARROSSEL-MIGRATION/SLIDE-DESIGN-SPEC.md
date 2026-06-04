import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import type { Dia } from "@/lib/carousel-types";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ erro: "Supabase admin indisponível" }, { status: 500 });

  const { data, error } = await admin
    .from("carousel_collections")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ erro: "não encontrada" }, { status: 404 });

  return NextResponse.json({
    id: data.id,
    slug: data.slug,
    title: data.title,
    brief: data.brief,
    dias: data.dias,
    theme: data.theme,
    ownerId: data.owner_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    dias?: Dia[];
    theme?: Record<string, unknown>;
  };

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ erro: "Supabase admin indisponível" }, { status: 500 });

  const patch: Record<string, unknown> = {};
  if (typeof body.title === "string") patch.title = body.title;
  if (Array.isArray(body.dias)) patch.dias = body.dias;
  if (body.theme && typeof body.theme === "object") patch.theme = body.theme;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ erro: "nada para actualizar" }, { status: 400 });
  }

  const { error } = await admin.from("carousel_collections").update(patch).eq("id", id);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ erro: "Supabase admin indisponível" }, { status: 500 });
  const { error } = await admin.from("carousel_collections").delete().eq("id", id);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
