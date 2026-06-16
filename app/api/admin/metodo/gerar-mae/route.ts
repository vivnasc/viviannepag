import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes } from '@/lib/texto';
import { fraseReconhecimento } from '@/lib/metodo/ia';
import { nomeVeu } from '@/lib/metodo/posts';
import { hashtagsDoPost } from '@/lib/metodo/legenda';
import { planoSemanaMae } from '@/lib/metodo/semana';

export const runtime = 'nodejs';
export const maxDuration = 300;

// MÃE · post da manhã em 2 FACES (1 reel, motion): cada dia = 1 véu.
//   face 1 = a DOR (reconhecimento, gerada por IA do SABER, com anti-repetição)
//   face 2 = a REVELAÇÃO (do cânone, do plano)
// Gera SÓ texto (imageUrl null); as imagens das 2 faces vêm depois pela rota
// /imagens (cada slide com a sua imagem em par com o texto). O render junta as
// 2 faces num só MP4. Slug estável por data (não duplica; regenerar atualiza).

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { semanas?: number; offset?: number };
  const semanas = Math.min(4, Math.max(1, body.semanas ?? 1));
  const offset = Math.max(0, body.offset ?? 0);

  const supabase = getSupabaseAdmin();

  // memória anti-repetição: as dores (face 1) já usadas na mãe.
  const evitar: string[] = [];
  try {
    const { data: existentes } = await supabase.from('carousel_collections').select('dias, theme').like('slug', 'metodo-mae-2f-%');
    for (const r of (existentes ?? []) as { dias?: Array<{ slides?: Array<{ texto?: string }> }> }[]) {
      const tx = r.dias?.[0]?.slides?.[0]?.texto;
      if (tx) evitar.push(tx);
    }
  } catch { /* sem memória prévia */ }

  const rows: Record<string, unknown>[] = [];
  let i = 0;
  for (let w = 0; w < semanas; w++) {
    const dias = planoSemanaMae(offset + w);
    for (const d of dias) {
      let dor: string;
      try { dor = limparTravessoes(await fraseReconhecimento(d.veu, apiKey, evitar)); evitar.push(dor); }
      catch { continue; }
      const conceito = nomeVeu(d.veu);
      const rev = d.revelacao;
      const slides = [
        { tipo: 'metodo', face: 1, texto: dor, destaque: [], notaVisual: '', imageUrl: null, capa: true, conceito, contaId: 'mae' },
        { tipo: 'metodo', face: 2, texto: limparTravessoes(rev.texto), destaque: limparTravessoes(rev.destaque), notaVisual: '', imageUrl: null, capa: false, conceito: `Revelação · ${conceito}`, contaId: 'mae' },
      ];
      const numeroFaixa = ((Math.floor(Date.now() / 1000) + i) % 100) + 1;
      const faixa = { numero: numeroFaixa, titulo: `Faixa ${String(numeroFaixa).padStart(2, '0')}`, url: faixaUrl(numeroFaixa) };
      const legenda = limparTravessoes(`${dor}\n\n${rev.texto}`);
      const dias_ = [{ dia: 1, mundo: 'autora', palavra: dor.slice(0, 48), slides, faixa, legenda, hashtags: hashtagsDoPost(rev) }];
      rows.push({
        slug: `metodo-mae-2f-${d.data}`,
        title: dor.slice(0, 48),
        brief: dor,
        dias: dias_,
        theme: {
          formato: 'reel', subtipo: 'duasfaces', video: true, mundo: 'autora', marca: 'loja',
          agendadoEm: d.data, hora: d.hora,
          metodo: { conta: 'mae', tipo: 'duasfaces', veu: d.veu },
        },
      });
      i++;
    }
  }

  if (!rows.length) return NextResponse.json({ erro: 'nada-gerado' }, { status: 500 });
  const { error } = await supabase.from('carousel_collections').upsert(rows, { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gerados: rows.length });
}
