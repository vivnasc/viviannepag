import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/carrossel-veus/generate-voice
 *
 * Gera UM áudio de narração para um slide do carrossel via ElevenLabs e
 * faz upload para Supabase. Mesma família de /api/admin/audio-bulk/generate-one
 * mas com path scoped por jobId para a UI poder regerar individualmente.
 *
 * Body: { jobId, dia, slide, text, voiceId?, modelId? }
 * Returns: { audioUrl, durationSec, sizeBytes, charsUsed }
 */
export async function POST(req: NextRequest) {
  try {
    const {
      jobId,
      dia,
      slide,
      text,
      voiceId = process.env.ELEVENLABS_VOICE_ID || "JGnWZj684pcXmK2SxYIv",
      modelId = "eleven_multilingual_v2",
    } = await req.json();

    if (!jobId || !dia || !slide || !text) {
      return NextResponse.json(
        { erro: "jobId, dia, slide, text obrigatórios" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ erro: "ELEVENLABS_API_KEY nao configurada" }, { status: 500 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
    }

    const body: Record<string, unknown> = {
      text: String(text).replace(/\n+/g, " ").trim(),
      model_id: modelId,
      output_format: "mp3_44100_128",
      voice_settings: {
        stability: 0.55,
        similarity_boost: 0.8,
        style: 0.15,
      },
    };

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { erro: `ElevenLabs ${res.status}: ${err.slice(0, 300)}` },
        { status: 502 }
      );
    }

    const audioBuffer = await res.arrayBuffer();
    const sizeBytes = audioBuffer.byteLength;
    // Estimativa rápida — ~16kB/s para mp3 128kbps
    const durationSec = sizeBytes / 16000;

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const filePath = `carrossel-veus/${jobId}/audios/dia-${dia}/slide-${slide}.mp3`;
    const { error } = await supabase.storage
      .from("course-assets")
      .upload(filePath, new Uint8Array(audioBuffer), {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (error) {
      return NextResponse.json(
        { erro: `Upload Supabase: ${error.message}` },
        { status: 500 }
      );
    }

    const audioUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}?t=${Date.now()}`;

    return NextResponse.json({
      audioUrl,
      durationSec,
      sizeBytes,
      charsUsed: String(text).length,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
