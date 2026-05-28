import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { limparEscrito } from '@/lib/escritos-sanitize';

export const maxDuration = 300;

const SYSTEM = `És tradutora da Vivianne dos Santos. Traduzes de português para inglês mantendo a mesma voz (directa, 2ª pessoa "you"), o mesmo ritmo, as mesmas quebras de parágrafo, os mesmos ## sub-cabeçalhos, e o mesmo markdown. Traduz fielmente mas com fluência natural em inglês.`;

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ erro: 'auth' }, { status: 401 });
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });
  }

  const supabase = getSupabaseAdmin();
  const { data: todos } = await supabase
    .from('escritos')
    .select('*')
    .eq('locale', 'pt');

  if (!todos || todos.length === 0) {
    return NextResponse.json({ erro: 'sem-escritos-pt' }, { status: 404 });
  }

  const { data: enExistentes } = await supabase
    .from('escritos')
    .select('slug')
    .eq('locale', 'en');
  const jaTemEN = new Set((enExistentes ?? []).map((e: { slug: string }) => e.slug));

  const porTraduzir = todos.filter((e) => !jaTemEN.has(e.slug as string));
  if (porTraduzir.length === 0) {
    return NextResponse.json({ ok: true, traduzidos: 0, mensagem: 'Todos já têm versão EN.' });
  }

  const traduzidos: string[] = [];
  const erros: string[] = [];

  for (const escrito of porTraduzir) {
    const prompt = `Traduz este texto. Devolve APENAS no formato:\nTITLE: ...\nSUMMARY: ...\n\n[corpo traduzido]\n\nTítulo: ${escrito.titulo}\nResumo: ${escrito.resumo}\n\nTexto:\n${escrito.conteudo}`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 3000,
          system: SYSTEM,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!res.ok) {
        erros.push(`${escrito.slug}: API ${res.status}`);
        continue;
      }

      const json = await res.json();
      const texto = (json.content?.[0]?.text as string) ?? '';
      const titleMatch = texto.match(/^TITLE:\s*(.+)/m);
      const summaryMatch = texto.match(/^SUMMARY:\s*(.+)/m);
      const bodyStart = texto.indexOf('\n\n', texto.indexOf('SUMMARY:'));
      const enTitulo = titleMatch?.[1]?.trim() ?? escrito.titulo;
      const enResumo = summaryMatch?.[1]?.trim() ?? escrito.resumo;
      const enConteudo = bodyStart > 0 ? texto.slice(bodyStart).trim() : texto;

      const { error } = await supabase.from('escritos').insert(limparEscrito({
        slug: escrito.slug,
        locale: 'en',
        titulo: enTitulo,
        resumo: enResumo,
        conteudo: enConteudo,
        tematica: escrito.tematica,
        capa: escrito.capa,
        data: escrito.data,
        publicado: escrito.publicado,
      }));

      if (error) {
        erros.push(`${escrito.slug}: DB ${error.message}`);
      } else {
        traduzidos.push(escrito.slug as string);
      }
    } catch (e) {
      erros.push(`${escrito.slug}: ${e instanceof Error ? e.message : 'erro'}`);
    }
  }

  return NextResponse.json({
    ok: true,
    traduzidos: traduzidos.length,
    slugs: traduzidos,
    erros: erros.length > 0 ? erros : undefined,
    total: porTraduzir.length,
  });
}
