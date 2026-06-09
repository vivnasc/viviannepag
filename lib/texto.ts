// Limpeza de texto gerado. A Vivianne NÃO usa travessões (— nem –) em lado
// nenhum. Esta função substitui-os e normaliza espaços, recursivamente.

// REGRA DE ACENTUAÇÃO — anexar a TODOS os prompts de geração de texto. A ausência
// de acentos no português é inaceitável. Escrita aqui já acentuada (o modelo imita
// o estilo do prompt), de forma forte e com exemplos.
export const REGRA_ACENTOS = `ACENTUAÇÃO (OBRIGATÓRIO, SEM EXCEÇÕES): escreve em português europeu com TODOS os acentos, til (~) e cedilha (ç) corretos, segundo o Acordo Ortográfico de 1990. Texto sem acentos é um ERRO GRAVE e não é aceitável. Nunca devolvas palavras como "nao", "religiao", "dimensoes", "voce", "memoria", "constelacao", "irmao", "avo", "tras", "espiritualidade" mal acentuadas: o correto é "não", "religião", "dimensões", "você", "memória", "constelação", "irmão", "avó", "trás". Relê CADA palavra antes de responder e confirma que está acentuada. Usa o AO1990 (ex.: "ato", não "acto"; "ação", não "acção").`;

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

// REDE DE SEGURANÇA da acentuação: 2.ª passagem que corrige SÓ os acentos do JSON
// gerado, sem mudar palavras nem estrutura. Garante acentuação correta mesmo que a
// 1.ª geração escorregue. Em qualquer falha devolve o original (nunca quebra).
export async function corrigirAcentos<T>(obj: T, apiKey: string): Promise<T> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 3000,
        system: 'És um revisor de português europeu. Recebes um JSON. Corriges APENAS a acentuação (acentos, til, cedilha) para português europeu correto, Acordo Ortográfico de 1990. NÃO mudes palavras, ordem, pontuação, estrutura nem as chaves do JSON. NÃO traduzas nem reescrevas. Devolve SÓ o JSON, idêntico exceto nos acentos.',
        messages: [{ role: 'user', content: JSON.stringify(obj) }],
      }),
    });
    if (!res.ok) return obj;
    const t = (await res.json())?.content?.[0]?.text ?? '';
    const iObj = t.indexOf('{'), iArr = t.indexOf('[');
    const i = iArr >= 0 && (iObj < 0 || iArr < iObj) ? iArr : iObj;
    const j = Math.max(t.lastIndexOf('}'), t.lastIndexOf(']'));
    if (i < 0 || j <= i) return obj;
    return JSON.parse(t.slice(i, j + 1)) as T;
  } catch { return obj; }
}
