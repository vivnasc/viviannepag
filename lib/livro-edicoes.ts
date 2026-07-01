// Edições da Vivianne ao livro "A Grande Transição", guardadas em Supabase
// Storage (um único JSON), sem precisar de tabela nova. O livro.json (do git) é
// a BASE; este overlay sobrepõe o texto editado por unidade. O render do PDF
// continua a ler o git; exportar estas edições para o manuscrito é um passo à
// parte (botão "exportar"), para nada se perder sem ela querer.
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'viviannepag-assets';
const CAMINHO = 'livro-transicao/edicoes.json';

export type Edicao = { texto?: string[]; comentario?: string; ts?: number };
export type Edicoes = Record<string, Edicao>;

// id estável por unidade (o título é único por capítulo; tipo desambigua o resto)
export function idDe(u: { tipo: string; titulo?: string; kicker?: string }): string {
  return `${u.tipo}::${(u.titulo || u.kicker || '').trim()}`;
}

export async function readEdicoes(): Promise<Edicoes> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.storage.from(BUCKET).download(CAMINHO);
  if (error || !data) return {};
  try {
    return JSON.parse(await data.text()) as Edicoes;
  } catch {
    return {};
  }
}

export async function writeEdicoes(e: Edicoes): Promise<void> {
  const sb = getSupabaseAdmin();
  const body = Buffer.from(JSON.stringify(e, null, 2));
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(CAMINHO, body, { contentType: 'application/json', upsert: true });
  if (error) throw new Error(error.message);
}
