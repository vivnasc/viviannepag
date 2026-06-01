// Auditoria deterministica de compliance das regras de escrita dos livros.
// Usada na aba Editora (e pode correr em script) para a Vivianne ver, de
// relance, se cada livro cumpre as regras antes de publicar.

export type Estado = 'ok' | 'aviso' | 'erro';
export type ItemAuditoria = { label: string; estado: Estado; detalhe: string };
export type Auditoria = { ok: boolean; avisos: number; erros: number; itens: ItemAuditoria[] };

// Grafias pre-AO90 (com c/p mudo) que NAO devem aparecer em pt-PT pos-AO90.
// Nota: facto, contacto, caracteristica, intacta, pacto MANTEM o c (corretas).
const AO90 = new RegExp(
  '\\b(' +
  [
    'exact[ao]s?', 'exactamente', 'exactid[ãa]o',
    'acç(ão|ões)', 'protecç(ão|ões)', 'direcç(ão|ões)', 'selecç(ão|ões)',
    'objectiv[ao]s?', 'object[oa]s?',
    'afect(o|os|ar|iv[ao])', 'aspect[oa]s?', 'perspectiv[ao]s?',
    'respectiv[ao]s?', 'respectivamente',
    'activ[ao]s?', 'actividades?', 'actu(al|ais|almente|alidade|ar|a|ação)',
    'colectiv[ao]s?', 'reflect(ir|e|ia)', 'adopt(ar|a|ou)',
    'óptim[ao]s?', 'correct[ao]s?', 'correctamente',
    'eléctric[ao]s?', 'arquitect[oa]s?', 'arquitectura',
    'direct(o|a|os|as|amente|or|ora)', 'fact(or|ores)',
    'caráct[eo]r', 'baptism[oa]', 'Egipto',
  ].join('|') +
  ')\\b',
  'gi',
);

function contarPalavras(s: string): number {
  const t = s.trim();
  return t ? t.split(/\s+/).length : 0;
}

export function auditar(raw: string): Auditoria {
  const itens: ItemAuditoria[] = [];

  // 1. travessoes
  const travessoes = (raw.match(/[—–]/g) ?? []).length;
  itens.push({
    label: 'Sem travessões',
    estado: travessoes === 0 ? 'ok' : 'erro',
    detalhe: travessoes === 0 ? 'nenhum — ou –' : `${travessoes} travessão(ões) encontrados`,
  });

  // 2. AO90
  const ao90 = raw.match(AO90) ?? [];
  const ao90uniq = Array.from(new Set(ao90.map(w => w.toLowerCase())));
  itens.push({
    label: 'Português pós-AO90',
    estado: ao90.length === 0 ? 'ok' : 'erro',
    detalhe: ao90.length === 0 ? 'sem grafias pré-acordo' : `corrigir: ${ao90uniq.join(', ')}`,
  });

  // 3. copyright unico 2026
  const anos = Array.from(new Set((raw.match(/\b20\d{2}\b/g) ?? [])));
  const outros = anos.filter(a => a !== '2026');
  const tem2026 = anos.includes('2026');
  itens.push({
    label: 'Copyright 2026',
    estado: tem2026 && outros.length === 0 ? 'ok' : (!tem2026 ? 'aviso' : 'erro'),
    detalhe: !tem2026 ? 'sem © 2026' : (outros.length ? `outros anos: ${outros.join(', ')}` : 'só 2026'),
  });

  // 4. 8 capitulos
  const caps = (raw.match(/^## /gm) ?? []).length;
  itens.push({
    label: '8 capítulos',
    estado: caps === 8 ? 'ok' : 'erro',
    detalhe: `${caps} capítulos`,
  });

  // 5. palavras 8000-12000
  const palavras = contarPalavras(raw);
  itens.push({
    label: 'Extensão 8000–12000',
    estado: palavras >= 8000 && palavras <= 12000 ? 'ok' : 'aviso',
    detalhe: `${palavras.toLocaleString('pt-PT')} palavras`,
  });

  // 6. disclaimer (tem de comecar por "*Este ebook" senao o parseEbook descarta)
  const disclaimer = /^\*Este ebook/m.test(raw);
  itens.push({
    label: 'Disclaimer correto',
    estado: disclaimer ? 'ok' : 'erro',
    detalhe: disclaimer ? 'começa por *Este ebook' : 'falta linha *Este ebook…',
  });

  // 7. nota de etica / encaminhamento clinico
  const etica = /profissional|acompanhamento|terapeut|psicólog/i.test(raw);
  itens.push({
    label: 'Nota de ética / clínica',
    estado: etica ? 'ok' : 'aviso',
    detalhe: etica ? 'presente' : 'não encontrada',
  });

  const erros = itens.filter(i => i.estado === 'erro').length;
  const avisos = itens.filter(i => i.estado === 'aviso').length;
  return { ok: erros === 0, avisos, erros, itens };
}
