// Limpeza de texto gerado. A Vivianne NÃO usa travessões (— nem –) em lado
// nenhum. Esta função substitui-os e normaliza espaços, recursivamente.

export function limparTravessoes<T>(v: T): T {
  if (typeof v === 'string') {
    return v
      .replace(/\s*[—–]\s*/g, ', ')   // travessão entre espaços -> vírgula
      .replace(/[—–]/g, ', ')           // qualquer travessão restante
      .replace(/\s+,/g, ',')            // espaço antes de vírgula
      .replace(/,\s*,/g, ',')           // vírgulas duplicadas
      .replace(/ {2,}/g, ' ')           // espaços a mais
      .trim() as unknown as T;
  }
  if (Array.isArray(v)) return v.map((x) => limparTravessoes(x)) as unknown as T;
  if (v && typeof v === 'object') {
    const o: Record<string, unknown> = {};
    for (const k of Object.keys(v as Record<string, unknown>)) o[k] = limparTravessoes((v as Record<string, unknown>)[k]);
    return o as unknown as T;
  }
  return v;
}
