import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;
export const runtime = "nodejs";

/**
 * POST /api/admin/carrossel-veus/upload-fundo
 *
 * Multipart upload de uma imagem-fundo Midjourney (JPG/PNG/WebP) para
 * Supabase Storage: course-assets/carrossel-veus/fundos/.
 *
 * Body: FormData { file: File, slideId: string }
 * Returns: { name, url, sizeBytes }
 *
 * O `slideId` (ex.: "veu-1-slide-3") torna o nome estável: re-upload faz
 * upsert e a URL pública mantém-se. Útil para o manifest de render-submit
 * apanhar o ficheiro novo sem precisar de invalidar caches.
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const slideIdRaw = form.get("slideId");

    if (!(file instanceof File)) {
      return NextResponse.json({ erro: "file em falta" }, { status: 400 });
    }
    if (typeof slideIdRaw !== "string" || !/^veu-\d+-slide-\d+$/.test(slideIdRaw)) {
      return NextResponse.json(
        { erro: "slideId inválido (esperado: veu-{n}-slide-{n})" },
        { status: 400 }
      );
    }
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ erro: "Imagem >25MB. Reduz qualidade." }, { status: 413 });
    }
    const extMatch = file.name.match(/\.(jpe?g|png|webp)$/i);
    if (!extMatch) {
      return NextResponse.json(
        { erro: "Extensão tem de ser .jpg, .jpeg, .png ou .webp" },
        { status: 400 }
      );
    }
    const ext = extMatch[1].toLowerCase().replace("jpeg", "jpg");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const fileName = `${slideIdRaw}.${ext}`;
    const filePath = `carrossel-veus/fundos/${fileName}`;
    const arrayBuf = await file.arrayBuffer();
    const contentType =
      file.type ||
      (ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg");

    const { error } = await supabase.storage
      .from("course-assets")
      .upload(filePath, new Uint8Array(arrayBuf), { contentType, upsert: true });

    if (error) {
      return NextResponse.json({ erro: `Supabase upload: ${error.message}` }, { status: 500 });
    }

    // Cache-bust simples: anexa updated=timestamp para o template não
    // apanhar versão antiga em re-uploads.
    const url = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}?updated=${Date.now()}`;
    return NextResponse.json({ name: fileName, url, sizeBytes: file.size });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
