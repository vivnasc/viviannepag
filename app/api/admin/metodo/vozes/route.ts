import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';

// MÉTODO VS · lista as VOZES da biblioteca ElevenLabs (para a Vivianne escolher uma voz
// GENÉRICA — ela NÃO aparece, não usa a voz dela). Devolve nome + sotaque/idioma + se é
// clonada (para podermos esconder/avisar as clonadas).
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const key = process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_API_KEY;
  if (!key) return NextResponse.json({ erro: 'falta ELEVENLABS_API_KEY' }, { status: 500 });
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': key } });
    if (!res.ok) return NextResponse.json({ erro: 'elevenlabs', detalhe: (await res.text()).slice(0, 200) }, { status: 502 });
    const j = (await res.json()) as { voices?: Array<{ voice_id: string; name: string; category?: string; labels?: Record<string, string> }> };
    const vozes = (j.voices ?? []).map((v) => ({
      id: v.voice_id,
      nome: v.name,
      clonada: v.category === 'cloned' || v.category === 'professional',
      sotaque: v.labels?.accent ?? v.labels?.language ?? '',
      descricao: [v.labels?.gender, v.labels?.accent ?? v.labels?.language, v.labels?.age].filter(Boolean).join(' · '),
    }));
    return NextResponse.json({ ok: true, vozes });
  } catch (e) { return NextResponse.json({ erro: 'falha', detalhe: String(e instanceof Error ? e.message : e) }, { status: 502 }); }
}
