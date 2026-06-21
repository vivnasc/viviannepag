import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { limparTravessoes } from '@/lib/texto';
import { CONTAS, type ContaId, type VeuNome } from '@/lib/metodo/contas';
import { personagemDoDia } from '@/lib/metodo/peca';
import { gerarStoryboard } from '@/lib/metodo/storyboard-ia';

export const runtime = 'nodejs';
export const maxDuration = 120;

// CARTA DE RENOMEAR (tarde da vir) · gera UMA carta e PERSISTE-a como post para
// testar/render no admin. Corre o gerarStoryboard no ramo cartaRen (6 passos:
// cena -> vida -> nome -> releitura -> preço -> abertura). Slide 0 = a CENA (capa,
// alto contraste); restantes = o corpo (papel). subtipo 'carta' -> render próprio
// (CartaSlide). Só texto; o render do MP4 faz-se depois ("renderizar").
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { conta?: string; dia?: string };
  const contaId = (body.conta ?? 'vir') as ContaId;
  const conta = CONTAS[contaId];
  if (!conta) return NextResponse.json({ erro: 'conta-desconhecida' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const fmtData = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  // anti-repetição (cenas/nomes já usados) + próxima tarde livre para esta conta.
  const evitar: string[] = [];
  const ocupadas = new Set<string>();
  try {
    const { data: ex } = await supabase.from('carousel_collections').select('dias, theme').like('slug', 'metodo-carta-%');
    for (const r of (ex ?? []) as { dias?: Array<{ slides?: Array<{ texto?: string }> }>; theme?: { agendadoEm?: string; metodo?: { conta?: string } } }[]) {
      if (r.theme?.metodo?.conta !== contaId) continue;
      if (r.theme?.agendadoEm) ocupadas.add(r.theme.agendadoEm);
      const t0 = r.dias?.[0]?.slides?.[0]?.texto; if (t0) evitar.push(t0);
    }
  } catch { /* sem memória prévia */ }

  let data = body.dia && /^\d{4}-\d{2}-\d{2}$/.test(body.dia) ? body.dia : '';
  if (!data) { const d = new Date(); for (let k = 0; k < 90; k++) { const c = fmtData(d); if (!ocupadas.has(c)) { data = c; break; } d.setDate(d.getDate() + 1); } if (!data) data = fmtData(new Date()); }

  // o véu alterna entre os 2 da porta; a personagem do dia dá voz ao banco (o
  // conteúdo de fundo vem do SABER/faces, infinito; os nomes antigos são o molde).
  const veu = (conta.veus[ocupadas.size % conta.veus.length]) as VeuNome;
  const personagem = personagemDoDia(veu, new Date(data + 'T12:00:00'));
  if (!personagem) return NextResponse.json({ erro: 'sem-personagem' }, { status: 409 });

  let beats: string[];
  try {
    const sb = await gerarStoryboard(contaId, 'profundidade', veu, personagem, apiKey, evitar);
    beats = sb.beats.map((b) => limparTravessoes(b.texto)).filter(Boolean);
  } catch (e) {
    return NextResponse.json({ erro: 'ia', detalhe: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
  if (beats.length < 2) return NextResponse.json({ erro: 'carta-curta', detalhe: 'storyboard devolveu poucos beats' }, { status: 502 });

  // slide 0 = a CENA (capa, alto contraste); restantes = corpo (papel).
  const slides = beats.map((texto, i) => ({
    tipo: 'metodo' as const,
    texto,
    destaque: [] as string[],
    notaVisual: '',
    imageUrl: null,
    capa: i === 0,
    conceito: i === 0 ? 'Carta de renomear' : '',
    contaId,
  }));

  const slug = `metodo-carta-${contaId}-${data}`;
  const legenda = limparTravessoes(`${beats.join('\n\n')}\n\nMétodo VS · @${conta.handle}`);
  const dias = [{ dia: 1, mundo: 'autora', palavra: beats[0].slice(0, 48), slides, legenda, hashtags: [] as string[] }];
  const row = {
    slug,
    title: beats[0].slice(0, 48),
    brief: beats[0],
    dias,
    theme: {
      formato: 'reel', subtipo: 'carta', video: true, mundo: 'autora', marca: conta.marca,
      agendadoEm: data, hora: '14:00',
      metodo: { conta: contaId, tipo: 'cartaRenomear', veu },
    },
  };

  const { error } = await supabase.from('carousel_collections').upsert([row], { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, slug, conta: contaId, beats });
}
