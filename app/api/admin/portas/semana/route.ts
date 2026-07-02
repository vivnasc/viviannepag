import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes } from '@/lib/texto';
import { getPorta, type PortaId } from '@/lib/portas/marca';
import { gerarPecaPorta } from '@/lib/portas/gerar-ia';

export const runtime = 'nodejs';
export const maxDuration = 300;

// PORTAS · PRODUTOR SEMANAL AUTONOMO. Gera a semana de UMA porta: um post por dia,
// cada dia um ANGULO diferente em rotacao (sem repetir, cobre o motor ao longo das
// semanas), ja AGENDADO no calendario (agendadoEm + hora + aprovado). A Vivianne so
// reve e ajusta; publica-se sozinho a hora. Motor separado da Soulab.

const mod = (n: number, m: number) => ((n % m) + m) % m;

// 'YYYY-MM-DD' + i dias, a partir de componentes locais (nunca toISOString, que
// recuava um dia em PT). Determinista: nao usa Date.now.
function addDias(iso: string, i: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d) + i * 86400000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${dt.getUTCFullYear()}-${p(dt.getUTCMonth() + 1)}-${p(dt.getUTCDate())}`;
}

async function fundoImagem(prompt: string, slug: string): Promise<string | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token || !prompt) return null;
  try {
    const url = await gerarImagemFlux(prompt, token, { raw: true });
    try { return await guardarImagem(url, `portas/${slug}/fundo-${Date.now()}.jpg`); } catch { return url; }
  } catch { return null; }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { porta?: string; inicio?: string; hora?: string; dias?: number };
  const porta = getPorta(body.porta ?? '');
  if (!porta) return NextResponse.json({ erro: 'porta-invalida' }, { status: 400 });
  const portaId = porta.id as PortaId;
  const inicio = (body.inicio ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(inicio)) return NextResponse.json({ erro: 'inicio-invalido' }, { status: 400 });
  const hora = (body.hora ?? '13:00').trim() || '13:00';
  const dias = Math.min(7, Math.max(1, body.dias ?? 6));

  const supabase = getSupabaseAdmin();

  // memoria anti-repeticao (frases/cenas ja usadas nesta porta) + rotacao dos angulos.
  const evitar: string[] = [];
  const evitarImg: string[] = [];
  try {
    const { data } = await supabase.from('carousel_collections').select('dias').like('slug', `${portaId}-%`);
    for (const r of (data ?? []) as { dias?: Array<{ slides?: Array<{ texto?: string; conceito?: string; notaVisual?: string }> }> }[]) {
      const s = r.dias?.[0]?.slides?.[0];
      if (s?.texto) evitar.push(s.texto);
      if (s?.conceito) evitar.push(s.conceito);
      if (s?.notaVisual) evitarImg.push(s.notaVisual);
    }
  } catch { /* sem memoria */ }

  // rotacao: a semana escolhe angulos a partir de um offset ligado a semana do
  // inicio, para semanas seguidas nao repetirem e o motor rodar por inteiro.
  const tipos = porta.tipos;
  const [iy, im, idd] = inicio.split('-').map(Number);
  const semanaIndex = Math.floor(Date.UTC(iy, im - 1, idd) / 86400000 / 7);
  const offset = mod(semanaIndex * dias, tipos.length);

  const rows: Record<string, unknown>[] = [];
  const plano: { dia: string; angulo: string }[] = [];
  let ultimoErro = '';
  for (let i = 0; i < dias; i++) {
    const tipo = tipos[mod(offset + i, tipos.length)];
    const data = addDias(inicio, i);
    try {
      const peca = await gerarPecaPorta(portaId, tipo.id, apiKey, [...new Set(evitar)].slice(-40), undefined, 'frase', evitarImg);
      evitar.push(peca.frase); if (peca.conceito) evitar.push(peca.conceito);
      if (peca.fundoPrompt) evitarImg.push(peca.fundoPrompt);

      const slug = `${portaId}-${tipo.id}-${Date.now()}-${i}`;
      const imageUrl = await fundoImagem(peca.fundoPrompt, slug);
      const slides = [{ tipo: 'kinetico', texto: peca.frase, destaque: peca.destaque, notaVisual: peca.fundoPrompt, imageUrl, capa: true, conceito: peca.conceito }];
      const numeroFaixa = (Math.floor(Date.now() / 1000) % 100) + 1;
      const faixa = { numero: numeroFaixa, titulo: `Faixa ${String(numeroFaixa).padStart(2, '0')}`, url: faixaUrl(numeroFaixa) };
      const legenda = limparTravessoes(`${peca.legenda}\n\n@${porta.handle}`);
      const diasArr = [{ dia: 1, mundo: portaId, palavra: peca.frase.slice(0, 48), slides, faixa, legenda, hashtags: peca.hashtags }];
      rows.push({
        slug,
        title: peca.titulo.slice(0, 60),
        brief: peca.frase,
        dias: diasArr,
        // ja agendado no dia (aprovado = a trava do cron; publica-se sozinho a hora).
        theme: { formato: 'reel', subtipo: 'kinetico', video: true, mundo: portaId, marca: portaId, porta: { tipo: tipo.id, formato: 'frase' }, agendadoEm: data, hora, aprovado: true },
      });
      plano.push({ dia: data, angulo: tipo.label });
    } catch (e) { ultimoErro = e instanceof Error ? e.message : String(e); }
  }

  if (!rows.length) return NextResponse.json({ erro: 'sem-pecas', detalhe: ultimoErro || undefined }, { status: 502 });
  const { error } = await supabase.from('carousel_collections').upsert(rows, { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gerados: rows.length, plano, detalhe: ultimoErro || undefined });
}
