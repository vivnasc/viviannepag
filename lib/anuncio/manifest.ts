// Anúncio do Amparo · MANIFESTO por variante.
//
// As peças PESADAS (cena/imagem Flux, motion Kling, voz com timestamps) são
// geradas no ADMIN (Vercel, onde existe a REPLICATE_API_TOKEN) e PRÉ-VISTAS por
// ela ANTES de montar. Guardamos o que ela aprovou neste manifesto (um JSON no
// Storage), e o render no GitHub Actions LÊ daqui e só MONTA — usa a MESMA cena,
// o MESMO motion e a MESMA voz que ela viu/ouviu. Sem surpresas, motion a sério.

import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'viviannepag-assets';

export interface PalavraVoz { w: string; t0: number; t1: number }
export interface ManifestoAnuncio {
  cenaUrl?: string;                                  // imagem da cena (Flux)
  motionUrl?: string;                                // clip com movimento (Kling)
  voz?: { url: string; dur: number; palavras: PalavraVoz[] }; // voz + timing p/ karaokê
  atualizadoEm?: number;
}

export function caminhoManifesto(variante: string): string {
  return `anuncios/_manifesto-${variante.toLowerCase()}.json`;
}

export async function lerManifesto(sb: SupabaseClient, variante: string): Promise<ManifestoAnuncio> {
  try {
    const { data, error } = await sb.storage.from(BUCKET).download(caminhoManifesto(variante));
    if (error || !data) return {};
    return JSON.parse(await data.text()) as ManifestoAnuncio;
  } catch {
    return {};
  }
}

export async function escreverManifesto(sb: SupabaseClient, variante: string, patch: Partial<ManifestoAnuncio>): Promise<ManifestoAnuncio> {
  const atual = await lerManifesto(sb, variante);
  const novo: ManifestoAnuncio = { ...atual, ...patch, atualizadoEm: Date.now() };
  const corpo = Buffer.from(JSON.stringify(novo, null, 2));
  const { error } = await sb.storage.from(BUCKET).upload(caminhoManifesto(variante), corpo, {
    contentType: 'application/json', upsert: true,
  });
  if (error) throw new Error(`manifesto: ${error.message}`);
  return novo;
}
