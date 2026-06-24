import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { type ContaId } from '@/lib/metodo/contas';
import { metodoVSConta, METODOVS_CONTAS_LISTA } from '@/lib/metodo-vs/marca';
import { SLUG_PADROES, mergePadroes, type PadroesVS, type PadroesPorConta } from '@/lib/metodo-vs/padroes';
import { gerarVoz } from '@/lib/metodo/voz';

export const runtime = 'nodejs';
export const maxDuration = 300;

// MÉTODO VS · PADRÕES GLOBAIS do estúdio (o sistema).
//  GET            -> devolve os padrões guardados de cada conta.
//  POST guardar   -> { acao:'guardar', conta, padroes } grava o padrão da conta.
//  POST aplicar   -> { acao:'aplicar', conta, alvo:'semana'|'conta'|'todas', offset?, padroes }
//                    escreve os padrões nas peças JÁ existentes (transição, ritmo, tipografia,
//                    motion) e, se vozTardeAuto, gera voz nas tardes. Salta publicadas.

async function lerConfig(supabase: ReturnType<typeof getSupabaseAdmin>): Promise<PadroesPorConta> {
  const { data } = await supabase.from('carousel_collections').select('theme').eq('slug', SLUG_PADROES).maybeSingle();
  const t = (data?.theme ?? {}) as { padroes?: PadroesPorConta };
  return t.padroes ?? {};
}

async function guardarConfig(supabase: ReturnType<typeof getSupabaseAdmin>, padroes: PadroesPorConta) {
  await supabase.from('carousel_collections').upsert(
    { slug: SLUG_PADROES, title: 'Método VS · padrões', dias: [], theme: { padroes, oculto: true } },
    { onConflict: 'slug' },
  );
}

const dataLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function segDaSemana(offset: number): Date {
  const x = new Date(); const wd = x.getDay();
  x.setDate(x.getDate() + (wd === 0 ? -6 : 1 - wd) + offset * 7); x.setHours(0, 0, 0, 0);
  return x;
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  return NextResponse.json({ ok: true, padroes: await lerConfig(supabase) });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { acao?: string; conta?: ContaId; alvo?: 'semana' | 'conta' | 'todas'; offset?: number; padroes?: Partial<PadroesVS> };
  const cfg = metodoVSConta(body.conta);
  const supabase = getSupabaseAdmin();

  // GUARDAR o padrão da conta (sem tocar nas peças).
  if (body.acao === 'guardar') {
    const config = await lerConfig(supabase);
    config[cfg.id] = { ...(config[cfg.id] ?? {}), ...(body.padroes ?? {}) };
    await guardarConfig(supabase, config);
    return NextResponse.json({ ok: true, padroes: config });
  }

  // APLICAR a peças existentes (a propagação: uma mudança -> centenas de conteúdos).
  if (body.acao === 'aplicar') {
    const p = mergePadroes(cfg.id, body.padroes);
    // que contas/prefixos: 'todas' = as 4; senão só esta.
    const contas = body.alvo === 'todas' ? METODOVS_CONTAS_LISTA : [cfg];
    let janela: { de: string; a: string } | null = null;
    if (body.alvo === 'semana') {
      const seg = segDaSemana(body.offset ?? 0); const dom = new Date(seg); dom.setDate(seg.getDate() + 6);
      janela = { de: dataLocal(seg), a: dataLocal(dom) };
    }

    let tocadas = 0; let vozes = 0;
    for (const c of contas) {
      const { data } = await supabase.from('carousel_collections').select('slug, dias, theme').like('slug', `${c.prefixo}-%`);
      for (const row of (data ?? []) as { slug: string; dias?: Array<Record<string, unknown>>; theme?: { agendadoEm?: string; igPublicado?: boolean; publicado?: boolean; metodovs?: { formato?: string } } }[]) {
        if (row.theme?.igPublicado || row.theme?.publicado) continue; // nunca tocar publicadas
        if (janela) { const d = (row.theme?.agendadoEm ?? '').slice(0, 10); if (!d || d < janela.de || d > janela.a) continue; }
        const dias = Array.isArray(row.dias) ? row.dias : [];
        const slides = (dias[0]?.slides as Array<Record<string, unknown>>) ?? [];
        if (slides[0]) {
          slides[0].transicao = p.transicao;
          slides[0].segPorMomento = p.segPorMomento;
          slides[0].motionAuto = p.motionAuto;
          slides[0].tipografia = { fonte: p.fonte, tamanho: p.tamanho, cor: p.cor, corDestaque: p.corDestaque };
          (dias[0] as Record<string, unknown>).slides = slides;
        }
        // voz automática nas TARDES (revelação): só se ligado e a peça não tem voz ainda.
        const ehTarde = row.theme?.metodovs?.formato && row.theme.metodovs.formato !== 'dissolucao';
        if (p.vozTardeAuto && ehTarde && !(dias[0] as { vozUrl?: string })?.vozUrl) {
          const texto = slides.map((s) => String((s as { texto?: string }).texto ?? '').trim()).filter(Boolean).join('\n\n');
          if (texto) {
            try {
              const r = await gerarVoz(texto, row.slug, { emocao: p.vozEmocao, expressiva: p.vozExpressiva });
              (dias[0] as Record<string, unknown>).vozUrl = r.url;
              (dias[0] as Record<string, unknown>).vozPalavras = r.palavras;
              (dias[0] as Record<string, unknown>).vozDur = r.dur;
              vozes++;
            } catch { /* segue sem voz */ }
          }
        }
        (dias[0] as Record<string, unknown>).videoUrl = null; // mudou: re-render
        const { error } = await supabase.from('carousel_collections').update({ dias }).eq('slug', row.slug);
        if (!error) tocadas++;
      }
    }
    // guarda também como o novo padrão da conta.
    const config = await lerConfig(supabase);
    config[cfg.id] = { ...(config[cfg.id] ?? {}), ...(body.padroes ?? {}) };
    await guardarConfig(supabase, config);
    return NextResponse.json({ ok: true, tocadas, vozes });
  }

  return NextResponse.json({ erro: 'acao-desconhecida' }, { status: 400 });
}
