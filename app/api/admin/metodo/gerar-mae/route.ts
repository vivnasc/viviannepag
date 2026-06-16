import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes } from '@/lib/texto';
import { fraseReconhecimento, revelacaoDaDor } from '@/lib/metodo/ia';
import { nomeVeu } from '@/lib/metodo/posts';
import { hashtagsDoPost } from '@/lib/metodo/legenda';
import { planoSemanaMae, diaMaeDaData, type DiaSemanaMae } from '@/lib/metodo/semana';
import { realceAuto } from '@/lib/metodo/reels';

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

  const body = (await req.json().catch(() => ({}))) as { semanas?: number; offset?: number; dia?: string };
  const semanas = Math.min(4, Math.max(1, body.semanas ?? 1));
  const offset = Math.max(-12, Math.min(12, body.offset ?? 0)); // 0 = esta semana

  const supabase = getSupabaseAdmin();

  // Uma só leitura dos posts da mãe, para:
  // - evitar/evitarRev: anti-repetição (texto das 2 faces)
  // - existentesDatas: QUALQUER dia que já tenha post da mãe (por data agendada
  //   OU pela data no slug) — robusto a esquemas de slug antigos
  // - publicadasDatas: dias JÁ publicados (nunca se tocam)
  const evitar: string[] = [];          // dores (face 1) já usadas
  const evitarRev = new Set<string>();  // revelações (face 2) já usadas
  const existentesDatas = new Set<string>();
  const publicadasDatas = new Set<string>();
  try {
    const { data: ex } = await supabase.from('carousel_collections').select('slug, dias, theme').like('slug', 'metodo-%');
    for (const r of (ex ?? []) as { slug: string; dias?: Array<{ slides?: Array<{ texto?: string }> }>; theme?: { agendadoEm?: string; igPublicado?: boolean; publicado?: boolean; metodo?: { conta?: string } } }[]) {
      const t = r.theme ?? {};
      const ehMae = t.metodo?.conta === 'mae' || r.slug.startsWith('metodo-mae-2f-');
      if (!ehMae) continue;
      const s0 = r.dias?.[0]?.slides?.[0]?.texto; if (s0) evitar.push(s0);
      const s1 = r.dias?.[0]?.slides?.[1]?.texto; if (s1) evitarRev.add(s1);
      const data = t.agendadoEm || (r.slug.startsWith('metodo-mae-2f-') ? r.slug.replace('metodo-mae-2f-', '') : '');
      if (data) {
        existentesDatas.add(data);
        if (t.igPublicado || t.publicado) publicadasDatas.add(data);
      }
    }
  } catch { /* sem memória prévia */ }

  // dias a gerar: 1 dia (body.dia, regenera esse) OU a(s) semana(s), SALTANDO os
  // dias que JÁ têm post (não duplica nem desorganiza). Nunca toca em publicados.
  let diasParaGerar: DiaSemanaMae[] = [];
  if (body.dia) {
    if (publicadasDatas.has(body.dia)) return NextResponse.json({ erro: 'publicado', detalhe: 'esse dia já foi publicado; não o regenero' }, { status: 409 });
    const dm = diaMaeDaData(body.dia);
    if (dm) diasParaGerar = [dm]; // 1 dia escolhido: regenera (se não publicado)
  } else {
    for (let w = 0; w < semanas; w++) diasParaGerar.push(...planoSemanaMae(offset + w));
    diasParaGerar = diasParaGerar.filter((d) => !existentesDatas.has(d.data)); // só os que faltam
  }
  if (!diasParaGerar.length) return NextResponse.json({ ok: true, gerados: 0, jaExistiam: true });

  const rows: Record<string, unknown>[] = [];
  let i = 0;
  for (const d of diasParaGerar) {
      let dor: string;
      try { dor = limparTravessoes(await fraseReconhecimento(d.veu, apiKey, evitar)); evitar.push(dor); }
      catch { continue; }
      const conceito = nomeVeu(d.veu);
      // face 2 (revelação): NASCE da face 1 — revela o MECANISMO INVISÍVEL daquela
      // cena (não um aforismo genérico). Fallback ao cânone se a IA falhar.
      let revTexto: string;
      try { revTexto = limparTravessoes(await revelacaoDaDor(d.veu, dor, apiKey)); }
      catch { revTexto = limparTravessoes(d.revelacao.texto); }
      evitarRev.add(revTexto);
      const slides = [
        { tipo: 'metodo', face: 1, texto: dor, destaque: [], notaVisual: '', imageUrl: null, capa: true, conceito, contaId: 'mae' },
        { tipo: 'metodo', face: 2, texto: revTexto, destaque: realceAuto(revTexto), notaVisual: '', imageUrl: null, capa: false, conceito: `Revelação · ${conceito}`, contaId: 'mae' },
      ];
      const numeroFaixa = ((Math.floor(Date.now() / 1000) + i) % 100) + 1;
      const faixa = { numero: numeroFaixa, titulo: `Faixa ${String(numeroFaixa).padStart(2, '0')}`, url: faixaUrl(numeroFaixa) };
      const legenda = limparTravessoes(`${dor}\n\n${revTexto}`);
      const dias_ = [{ dia: 1, mundo: 'autora', palavra: dor.slice(0, 48), slides, faixa, legenda, hashtags: hashtagsDoPost(d.revelacao) }];
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

  if (!rows.length) return NextResponse.json({ erro: 'nada-gerado' }, { status: 500 });
  const { error } = await supabase.from('carousel_collections').upsert(rows, { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gerados: rows.length });
}
