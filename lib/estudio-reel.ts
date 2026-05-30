import type { ConteudoDia, ReelScript } from './estudio-conteudo';

export type ReelIntent = 'capa' | 'conteudo' | 'citacao' | 'cta' | 'assinatura';

export type ReelLinha = {
  idx: number;
  intent: ReelIntent;
  texto: string;       // texto cru (para legenda) — sem voice tag
  ttsTexto: string;    // o que enviamos ao TTS — com voice tag inline no inicio
};

// v3 le parentheticals iniciais como direccao de leitura (style transfer).
const VOICE_TAGS: Record<ReelIntent, string> = {
  capa: 'amigável',
  conteudo: 'didática',
  citacao: 'reflexiva',
  cta: 'compreensiva',
  assinatura: 'com calma',
};

const VOICE_TAG_RX = /^\s*\([^)]*\)\s*/;

export function stripVoiceTag(s: string): string {
  return s.replace(VOICE_TAG_RX, '').trim();
}

function comTag(intent: ReelIntent, texto: string): string {
  return `(${VOICE_TAGS[intent]}) ${stripVoiceTag(texto)}`.trim();
}

export function linhasFromScript(rs: ReelScript): ReelLinha[] {
  const linhas: ReelLinha[] = [];
  let idx = 0;

  const push = (intent: ReelIntent, raw: string) => {
    const texto = stripVoiceTag(raw).trim();
    if (!texto) return;
    linhas.push({ idx, intent, texto, ttsTexto: comTag(intent, texto) });
    idx++;
  };

  push('capa', rs.gancho);
  for (const c of rs.corpo) push('conteudo', c);
  push('cta', rs.cta);

  return linhas;
}

export function ehReel(c: ConteudoDia): boolean {
  return c.tipo.startsWith('reel');
}
