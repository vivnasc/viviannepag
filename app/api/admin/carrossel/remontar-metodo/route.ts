import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getCatalogoProdutos, amostraEcossistema, ecossistemaPrompt } from '@/lib/carrossel/catalogo';
import { ofertasAnterioresPrompt } from '@/lib/carrossel/ofertas';
import { REGRAS_GLOBAIS } from '@/lib/carrossel/overrides';
import { METODO_ESPINHA, METODO_VOZ, metodoOfertasPrompt, eixoSemanaPrompt, movimentoDoDia, CTA_FILOSOFIA } from '@/lib/carrossel/metodo';
import { getColecao, type ColecaoId } from '@/lib/colecoes';

export const runtime = 'nodejs';
export const maxDuration = 300;

type Rec = Record<string, unknown>;

// POST /api/admin/carrossel/remontar-metodo { slug }
// "Passar pelo Método": reescreve SÓ o texto e os CTAs de uma semana JÁ gerada,
// para passar a correr pelo Método VS. NÃO toca nas imagens (nem no pool) nem nas
// PALAVRAS-DESTAQUE (as palavras grandes) nem nos subtítulos — esses mantêm-se
// exactamente. Serve para alinhar conteúdo já feito sem perder a estética curada.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!slug) return NextResponse.json({ erro: 'falta-slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row } = await supabase
    .from('carousel_collections')
    .select('slug, title, brief, dias, theme')
    .eq('slug', slug)
    .maybeSingle();
  if (!row) return NextResponse.json({ erro: 'nao-encontrada' }, { status: 404 });

  const theme = (row.theme ?? {}) as Rec;
  const universo = theme.universo as ColecaoId | undefined;
  const territorio = (theme.territorio as string) ?? (row.title as string) ?? '';
  const estacao = (theme.estacao as string) ?? 'inverno';
  const brief = (row.brief as string) ?? '';
  if (!universo) return NextResponse.json({ erro: 'sem-universo' }, { status: 400 });
  const col = getColecao(universo);

  const diasAntigos = (Array.isArray(row.dias) ? row.dias : []) as Rec[];
  if (!diasAntigos.length) return NextResponse.json({ erro: 'sem-dias' }, { status: 400 });

  // O que SE MANTÉM (palavra grande + subtítulo) + o movimento de cada dia.
  const resumoDias = diasAntigos
    .map((d, i) => {
      const diaNum = typeof d.dia === 'number' ? d.dia : i + 1;
      return `dia ${diaNum} (${d.diaSemana ?? ''}) · movimento ${movimentoDoDia(diaNum)} · palavra "${d.palavra ?? ''}" · subtitulo "${d.subtitulo ?? ''}"`;
    })
    .join('\n');

  const catalogo = await getCatalogoProdutos();
  const amostra = amostraEcossistema(catalogo, universo, 2);
  const ecossistema = `ECOSSISTEMA COMPLETO (o universo TODO — usa-o INTEIRO nos CTAs, com variedade; amplia, nao reduzas):\n\nPRODUTOS DA LOJA (ebooks, guias, packs):\n${ecossistemaPrompt(amostra)}\n\nOFERTAS ANTERIORES (LUMINA, Loranne, Sete Ecos, livro, Escola — links proprios):\n${ofertasAnterioresPrompt()}\n\nMÉTODO VS (mais uma familia: pilar e manuais — a par dos outros, nunca o unico destino):\n${metodoOfertasPrompt()}`;

  const SYSTEM = `Es a voz dos Carrosseis dos 7 Veus da Vivianne dos Santos (psicologia transpessoal, constelacao familiar).

${METODO_ESPINHA}

A TUA TAREFA: reescrever o TEXTO de uma semana de carrosseis JA EXISTENTE, para passar a correr pelo Método VS, SEM mexer no que ja esta bom.
REGRA ABSOLUTA E INVIOLAVEL: a PALAVRA-DESTAQUE (a palavra grande de cada dia) e o SUBTITULO MANTEM-SE EXACTAMENTE como estao. Nao os reescrevas, nao os traduzas, nao os "melhores". As IMAGENS tambem se mantem (nao falas delas). So reescreves o texto a volta, e fazes esse texto encaixar na palavra que JA la esta.

REGRAS DE VOZ:
${[...METODO_VOZ, ...REGRAS_GLOBAIS].map((r) => `- ${r}`).join('\n')}
- ACENTUACAO obrigatoria (portugues europeu, todos os acentos). Tom generoso e nao-vendedor: valor primeiro, o produto e um sussurro no fim.

O QUE REESCREVES em cada dia (na voz do Método, coerente com a palavra que se mantem):
- gancho: a frase de abertura da capa. Verdade tensa e RECONHECIVEL do dia a dia ("isto sou eu"), curta (1-2 linhas), concreta.
- prosa: reflexao em prosa curta e intima.
- poetico1: frase poetica (pode ter quebras de linha).
- pratica: um convite ou pergunta pratica.
- poetico2: fecho poetico que volta a palavra do dia.
- cta: fecho generoso. UM produto do ecossistema TODO, com variedade (ver a seccao CTA em baixo). titulo = nome do produto; texto = convite curto e generoso, nunca "compra"/"adquire"; url = a URL exacta da lista.

${ecossistema}

${CTA_FILOSOFIA}

${eixoSemanaPrompt(diasAntigos.length)}

A SEMANA (mantem o territorio): "${territorio}" — ${brief}. Universo: ${col.nome}. Estacao: ${estacao}.
DIAS (a palavra e o subtitulo de cada um MANTEM-SE):
${resumoDias}

DEVOLVE APENAS JSON valido, sem texto a volta:
{
  "jornada": { "fio": "1 frase que nomeia o arco Ver->Vir->Viver->o todo desta semana" },
  "dias": [
    { "dia": 1, "gancho": "...", "prosa": "...", "poetico1": "...", "pratica": "...", "poetico2": "...", "cta": { "nome": "nome do produto", "texto": "convite curto e generoso", "url": "a URL exacta" } }
  ]
}`;

  const userPrompt = `Passa esta semana pelo Método VS. Mantem TODAS as palavras-destaque e subtitulos. Reescreve so o gancho, os 4 slides do meio e o CTA de cada dia, na voz do Método. Os CTAs variam por TODO o ecossistema (loja, ofertas anteriores e metodo), nunca so o metodo. ${diasAntigos.length} dias. Agora.`;

  let texto = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-opus-4-7', max_tokens: 16000, system: SYSTEM, messages: [{ role: 'user', content: userPrompt }] }),
    });
    if (!res.ok) return NextResponse.json({ erro: 'claude', detalhe: await res.text() }, { status: 502 });
    texto = (await res.json())?.content?.[0]?.text ?? '';
  } catch (e) {
    return NextResponse.json({ erro: 'claude-fetch', detalhe: String(e) }, { status: 502 });
  }

  const ini = texto.indexOf('{');
  const fim = texto.lastIndexOf('}');
  if (ini < 0 || fim <= ini) return NextResponse.json({ erro: 'sem-json', amostra: texto.slice(0, 300) }, { status: 502 });
  let parsed: { dias?: Rec[]; jornada?: Rec };
  try {
    parsed = JSON.parse(texto.slice(ini, fim + 1));
  } catch {
    return NextResponse.json({ erro: 'json-invalido', amostra: texto.slice(0, 300) }, { status: 502 });
  }

  const novos = new Map<number, Rec>();
  for (const d of Array.isArray(parsed.dias) ? parsed.dias : []) {
    const n = d as Rec;
    if (typeof n.dia === 'number') novos.set(n.dia, n);
  }

  // Costura o texto novo nos slides existentes, PRESERVANDO imagens, notaVisual,
  // a palavra (capa.texto) e o subtitulo (capa.titulo). So muda o que e copy.
  const diasFinal = diasAntigos.map((d, i) => {
    const diaNum = typeof d.dia === 'number' ? d.dia : i + 1;
    const n = novos.get(diaNum);
    if (!n) return d;
    const meio = [n.prosa, n.poetico1, n.pratica, n.poetico2];
    let mi = 0;
    const slides = (Array.isArray(d.slides) ? d.slides : []) as Rec[];
    const novosSlides = slides.map((s) => {
      if (s.tipo === 'capa') return { ...s, destaque: String(n.gancho ?? s.destaque ?? '') };
      if (s.tipo === 'cta') {
        const cta = (n.cta ?? {}) as Rec;
        return {
          ...s,
          titulo: String(cta.nome ?? s.titulo ?? ''),
          texto: String(cta.texto ?? s.texto ?? ''),
          destaque: String(cta.url ?? s.destaque ?? ''),
        };
      }
      const txt = mi < meio.length ? meio[mi] : undefined;
      mi++;
      return { ...s, texto: String(txt ?? s.texto ?? '') };
    });
    return { ...d, movimento: movimentoDoDia(diaNum), slides: novosSlides };
  });

  // Backup da versao anterior (ate 3), como o gerar.
  const histAnt = (theme.historico as unknown[]) ?? [];
  const historico = [{ dias: row.dias, em: new Date().toISOString() }, ...histAnt].slice(0, 3);
  const jornada = parsed.jornada ?? (theme.jornada as Rec) ?? null;

  const { data, error } = await supabase
    .from('carousel_collections')
    .upsert(
      { slug, title: row.title, brief, dias: diasFinal, theme: { ...theme, jornada, historico } },
      { onConflict: 'slug' },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, coleccao: data });
}
