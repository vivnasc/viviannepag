// Método VS · VOZ (ElevenLabs text-to-speech) a partir do TEXTO de um post.
// Usa a voz clonada (ELEVEN_VOICE_ID) em eleven_multilingual_v2 (o modelo ESTÁVEL,
// não o v3 alpha que oscilava para sotaque brasileiro). similarity_boost ALTO puxa
// para o sotaque da própria voz clonada (PT-PT); stability mantém-no consistente
// entre gerações. SEM language_code (o 'pt' do ElevenLabs tende a puxar p/ brasileiro;
// é a voz clonada + similarity que seguram o PT-PT).
// Endpoint COM TIMESTAMPS: devolve o tempo de cada caráter → derivamos o tempo de
// cada PALAVRA, para o render fazer KARAOKÊ (acender a palavra no momento exato),
// como um vídeo-lyrics. A Vivianne tinha razão: o texto já é conhecido, o que falta
// é o timing — e o ElevenLabs dá-o.

import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'viviannepag-assets';

export interface PalavraVoz { w: string; t0: number; t1: number }
export interface VozResultado { url: string; palavras: PalavraVoz[]; dur: number }

// VOZ EXPRESSIVA (eleven_v3): a Vivianne quer a voz HUMANA e INTERPRETADA, não plana.
// O eleven_v3 lê audio tags inline tipo [whispers]/[sighs]/[softly]. Mapeamos cada
// EMOÇÃO a um punhado pequeno de tags (em inglês, o que o motor entende) e tecemo-las
// COM PARCIMÓNIA no texto (no arranque + numa pausa natural), nunca em todas as linhas.
export type EmocaoVoz = 'serena' | 'intima' | 'firme' | 'calorosa' | 'sussurro';

// tags por emoção (sóbrias; usadas com conta-gotas para não soar teatral).
const TAGS_EMOCAO: Record<EmocaoVoz, string[]> = {
  serena: ['[gently]'],
  intima: ['[softly]'],
  firme: ['[emphasis]'],
  calorosa: ['[warmly]'],
  sussurro: ['[whispers]'],
};

// tece UMA tag no arranque e, se houver mais do que uma frase, outra numa pausa
// natural (a seguir ao 1.º ponto final / quebra de parágrafo). Nunca em todas as linhas.
function texComTags(texto: string, emocao: EmocaoVoz): string {
  const tags = TAGS_EMOCAO[emocao] ?? [];
  if (!tags.length) return texto;
  let out = `${tags[0]} ${texto.trim()}`;
  // 2.ª tag (a mesma, se só houver uma) numa pausa natural a meio, uma só vez.
  const seg = tags[1] ?? tags[0];
  const m = out.match(/([.!?]\s+|\n\n)/); // primeira pausa forte depois do arranque
  if (m && typeof m.index === 'number') {
    const corte = m.index + m[0].length;
    out = `${out.slice(0, corte)}${seg} ${out.slice(corte)}`;
  }
  return out;
}

type Alinhamento = { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] };

// agrupa os carateres (com tempos) em PALAVRAS com início/fim.
// IMPORTANTE (voz expressiva): o texto falado pode levar audio tags como [whispers]
// que NÃO aparecem no ecrã. O karaokê mapeia o texto DOS SLIDES, por isso as tags não
// podem virar "palavras" no alinhamento. Filtramos qualquer palavra que contenha '['
// ou ']' (uma tag, ou um resto de tag colado a uma palavra) para o karaokê ficar limpo.
function ehTag(w: string): boolean {
  return w.includes('[') || w.includes(']');
}

function palavrasDeAlinhamento(a?: Alinhamento): PalavraVoz[] {
  if (!a?.characters?.length) return [];
  const out: PalavraVoz[] = [];
  let buf = ''; let t0 = 0; let aberto = false;
  const fechar = (tEnd: number) => { const w = buf.trim(); if (w && !ehTag(w)) out.push({ w, t0, t1: tEnd }); buf = ''; aberto = false; };
  for (let i = 0; i < a.characters.length; i++) {
    const ch = a.characters[i];
    const cs = a.character_start_times_seconds[i] ?? 0;
    const ce = a.character_end_times_seconds[i] ?? cs;
    if (/\s/.test(ch)) { if (aberto) fechar(ce); continue; }
    if (!aberto) { t0 = cs; aberto = true; }
    buf += ch;
  }
  if (aberto) fechar(a.character_end_times_seconds[a.character_end_times_seconds.length - 1] ?? t0);
  return out;
}

export interface VozOpts { emocao?: EmocaoVoz; expressiva?: boolean }

export async function gerarVoz(texto: string, slug: string, opts: VozOpts = {}): Promise<VozResultado> {
  const key = process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || process.env.ELEVEN_VOICE_ID;
  if (!key) throw new Error('falta ELEVENLABS_API_KEY');
  if (!voiceId) throw new Error('falta ELEVENLABS_VOICE_ID (a tua voz clonada)');

  // VOZ EXPRESSIVA: pedida com expressiva=true OU dando uma emoção. Usa o eleven_v3 e
  // tece audio tags no texto FALADO (não no karaokê — esse vem dos slides). stability
  // ALTO + similarity ALTO + speaker_boost = trava a deriva do v3 para o sotaque
  // brasileiro. Default (sem expressiva): o caminho estável de sempre (v2).
  const expressiva = opts.expressiva === true || !!opts.emocao;
  const emocao: EmocaoVoz = opts.emocao ?? 'serena';
  const textoFalado = expressiva ? texComTags(texto, emocao) : texto;
  const corpo = expressiva
    ? {
        text: textoFalado,
        model_id: 'eleven_v3',
        // stability alto = trava a deriva de sotaque do v3; similarity alto = agarra-se à
        // voz clonada (PT-PT); speaker_boost reforça-a. SEM language_code (puxa p/ brasileiro).
        voice_settings: { stability: 0.6, similarity_boost: 0.9, use_speaker_boost: true },
      }
    : {
        text: textoFalado,
        model_id: 'eleven_multilingual_v2',
        // similarity ALTO = agarra-se ao sotaque da voz clonada (PT-PT); stability médio-alto
        // = consistente entre gerações (sem oscilar p/ brasileiro); style 0 = sem dramatizar.
        voice_settings: { stability: 0.55, similarity_boost: 0.9, style: 0, use_speaker_boost: true },
      };

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(corpo),
  });
  if (!res.ok) throw new Error(`elevenlabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const j = (await res.json()) as { audio_base64?: string; alignment?: Alinhamento; normalized_alignment?: Alinhamento };
  if (!j.audio_base64) throw new Error('elevenlabs: sem áudio');

  const palavras = palavrasDeAlinhamento(j.alignment ?? j.normalized_alignment);
  const dur = palavras.length ? palavras[palavras.length - 1].t1 : 0;

  const audio = Buffer.from(j.audio_base64, 'base64');
  const sb = getSupabaseAdmin();
  const slugSeguro = slug.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9_-]/g, '-');
  const path = `metodo/${slugSeguro}/voz-${Date.now()}.mp3`;
  const { error } = await sb.storage.from(BUCKET).upload(path, audio, { contentType: 'audio/mpeg', upsert: true });
  if (error) throw new Error(`upload voz: ${error.message}`);
  const url = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  return { url, palavras, dur };
}
