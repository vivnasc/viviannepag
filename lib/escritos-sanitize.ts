export function semTravessoes(s: string | null | undefined): string {
  if (!s) return '';
  return s.replace(/\s*[—–]\s*/g, '. ').replace(/\.\s*\./g, '.');
}

export function limparEscrito<T extends { titulo?: unknown; resumo?: unknown; conteudo?: unknown }>(row: T): T {
  const out = { ...row };
  if (typeof out.titulo === 'string') (out as { titulo: string }).titulo = semTravessoes(out.titulo);
  if (typeof out.resumo === 'string') (out as { resumo: string }).resumo = semTravessoes(out.resumo);
  if (typeof out.conteudo === 'string') (out as { conteudo: string }).conteudo = semTravessoes(out.conteudo);
  return out;
}
