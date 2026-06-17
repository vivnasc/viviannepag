import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { estadoPredicao } from '@/lib/metodo/clip';

export const runtime = 'nodejs';
export const maxDuration = 120;

const BUCKET = 'viviannepag-assets';

type Slide = { imageUrl?: string | null; clipUrl?: string | null; clipPredId?: string | null; clipPend?: boolean; clipErro?: string | null };
type Dia = { slides?: Slide[]; videoUrl?: string | null };
type Row = { slug: string; dias?: Dia[] | null; theme?: Record<string, unknown> | null };

// POST { slug? } — COLHE os clips que já ficaram prontos no Replicate. Para cada
// face com previsão pendente (clipPredId + clipPend), lê o estado: se já está
// pronta, baixa o MP4, guarda-o e fixa-o como fundo (slides[i].clipUrl); se falhou,
// limpa o pendente. Sem `slug`, varre TODOS os posts do método (assim, voltar a
// QUALQUER conta colhe o que ficou pronto enquanto saíste — nada se perde).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'falta REPLICATE_API_TOKEN' }, { status: 500 });

  const { slug, force } = (await req.json().catch(() => ({}))) as { slug?: string; force?: boolean };
  const supabase = getSupabaseAdmin();

  const q = supabase.from('carousel_collections').select('slug, dias, theme');
  const { data, error } = slug ? await q.eq('slug', slug) : await q.like('slug', 'metodo-%');
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  let colhidos = 0;
  let pendentes = 0;
  for (const row of (data ?? []) as Row[]) {
    const slides = row.dias?.[0]?.slides ?? [];
    let mudou = false;
    for (let i = 0; i < slides.length; i++) {
      const s = slides[i];
      // RECUPERAÇÃO: processa qualquer face com previsão paga (clipPredId) que ainda
      // não tem clip guardado. Auto: só as que estão "a animar" (clipPend). Forçado
      // (botão "recuperar"): TODAS, mesmo as que marcámos falhadas (caso tenham
      // afinal terminado no Replicate). Nunca apagamos o id, por isso é sempre recuperável.
      if (!s?.clipPredId || s.clipUrl) continue;
      if (!force && !s.clipPend) continue;
      let est;
      try { est = await estadoPredicao(s.clipPredId, token); }
      catch { pendentes++; continue; } // erro de rede: tenta na próxima colheita
      if (est.status === 'succeeded' && est.url) {
        let clipUrl = est.url;
        try {
          const res = await fetch(est.url);
          if (!res.ok) throw new Error(`download ${res.status}`);
          const buf = Buffer.from(await res.arrayBuffer());
          const path = `metodo/${row.slug}/clip-${i}-${Date.now()}.mp4`;
          const { error: up } = await supabase.storage.from(BUCKET).upload(path, buf, { contentType: 'video/mp4', upsert: true });
          if (up) throw new Error(up.message);
          clipUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
        } catch (e) {
          console.warn('[colher] upload falhou, uso URL remoto:', e instanceof Error ? e.message : e);
        }
        s.clipUrl = clipUrl;
        s.clipPend = false;
        s.clipErro = null;
        // NÃO apagamos clipPredId — fica como registo (e garante recuperação futura).
        if (row.dias?.[0]) row.dias[0].videoUrl = null; // o MP4 fica desatualizado
        colhidos++;
        mudou = true;
      } else if (est.status === 'failed' || est.status === 'canceled') {
        s.clipPend = false;
        s.clipErro = est.erro ?? est.status;
        // mantém clipPredId: se foi um falso-falhado, o "recuperar" volta a tentar.
        mudou = true;
      } else {
        pendentes++; // ainda a processar
      }
    }
    if (mudou) {
      const primeiro = slides.find((s) => s.clipUrl)?.clipUrl ?? null;
      const theme = { ...((row.theme as Record<string, unknown>) ?? {}), clipTeste: primeiro };
      await supabase.from('carousel_collections').update({ dias: row.dias, theme }).eq('slug', row.slug);
    }
  }

  return NextResponse.json({ ok: true, colhidos, pendentes });
}
