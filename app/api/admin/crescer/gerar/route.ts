import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { LUZ_PREFIXO } from '@/lib/crescer/mundo-visual';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes } from '@/lib/texto';
import {
  CRESCER_MUNDO, TEMATICAS, FORMATOS, VISUAIS,
  getTematica, getFormato, getVisual, getVoz,
  type TematicaId, type FormatoId, type VisualId, type VozId,
} from '@/lib/crescer/marca';
import { gerarPecaCrescer } from '@/lib/crescer/gerar-ia';
import { escolherVeia, type Veia } from '@/lib/knowledge/veias';

export const runtime = 'nodejs';
export const maxDuration = 300;

// CRESCER · gera um LOTE de peças escolhendo VÁRIAS temáticas × formatos × visuais
// (ou "surpreende-me"), com a base das áreas da Vivianne. Grava em
// carousel_collections com theme.marca='crescer' (aparece em Publicar na conta
// vivianne.dos.santos). A imagem (Flux) gera-se já aqui, exceto no visual minimal.

const TOTAL_MAX = 8; // teto por lote (custo/tempo do Flux); ela carrega outra vez para mais.

async function fundoImagem(prompt: string, slug: string): Promise<string | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token || !prompt) return null;
  try {
    const url = await gerarImagemFlux(LUZ_PREFIXO + prompt, token, { raw: true });
    try { return await guardarImagem(url, `crescer/${slug}/fundo-${Date.now()}.jpg`, { clarear: true }); } catch { return url; }
  } catch { return null; }
}

const pick = <T,>(arr: T[], i: number) => arr[i % arr.length];

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as {
    tematicas?: string[]; formatos?: string[]; visuais?: string[];
    quantos?: number; surpreender?: boolean; tema?: string; voz?: string;
    tipografia?: { fonte?: string; tamanho?: number; cor?: string; corDestaque?: string; alinhV?: string; alinhH?: string };
    efeito?: string; saida?: 'reel' | 'carrossel'; fonte?: 'livro' | 'tema'; imagemModo?: 'cena' | 'ilustrar';
  };
  const imagemModo = body.imagemModo === 'ilustrar' ? 'ilustrar' : 'cena';
  const voz = (getVoz(body.voz ?? '') ? body.voz : 'direta') as VozId;
  // ela escolhe COMO sai: reel (defeito, mais alcance) ou carrossel. reel=true => sempre reel.
  const ehReel = body.saida !== 'carrossel';
  // FONTE da peça: 'livro' (defeito) = MINERA os livros dela (a fonte de descoberta);
  // 'tema' = a partir das temáticas/tema livre (o modo antigo). A regra dela: minerar
  // primeiro os livros, não os comportamentos do quotidiano.
  const fonte = body.fonte === 'tema' ? 'tema' : 'livro';

  const temasSel = (body.tematicas ?? []).filter((t) => getTematica(t)) as TematicaId[];
  const fmtsSel = (body.formatos ?? []).filter((f) => getFormato(f)) as FormatoId[];
  const visSel = (body.visuais ?? []).filter((v) => getVisual(v)) as VisualId[];
  const quantos = Math.max(1, Math.min(TOTAL_MAX, body.quantos ?? 1));
  const tema = body.tema?.trim() || undefined;
  // a "surpresa" (acaso) só vale no modo TEMA; no modo LIVRO a fonte é a veia.
  const surpreender = fonte === 'tema' && (!!body.surpreender || (!temasSel.length && !fmtsSel.length));

  // monta a lista de "trabalhos" (temática × formato × visual), até ao teto.
  type Job = { tematica: TematicaId; formato: FormatoId; visual: VisualId };
  const jobs: Job[] = [];
  if (fonte === 'livro') {
    // MINERAÇÃO: a fonte é o livro (a veia escolhe-se no loop); aqui só rodam o
    // FORMATO e o VISUAL pelas seleções dela (ou defaults). A temática é ignorada.
    const fPool = fmtsSel.length ? fmtsSel : (['frase'] as FormatoId[]);
    const vPool = visSel.length ? visSel : (VISUAIS.filter((v) => v.id !== 'minimal').map((v) => v.id) as VisualId[]);
    for (let i = 0; i < quantos && jobs.length < TOTAL_MAX; i++) {
      jobs.push({ tematica: 'transformacao', formato: pick(fPool, i), visual: pick(vPool, i) });
    }
  } else if (surpreender) {
    // acaso: quantos peças, cada uma com combinação aleatória (das selecionadas, ou de todas).
    const tPool = temasSel.length ? temasSel : (TEMATICAS.map((t) => t.id) as TematicaId[]);
    const fPool = fmtsSel.length ? fmtsSel : (FORMATOS.map((f) => f.id) as FormatoId[]);
    const vPool = visSel.length ? visSel : (VISUAIS.map((v) => v.id) as VisualId[]);
    for (let i = 0; i < quantos; i++) {
      jobs.push({
        tematica: tPool[Math.floor(Math.random() * tPool.length)],
        formato: fPool[Math.floor(Math.random() * fPool.length)],
        visual: vPool[Math.floor(Math.random() * vPool.length)],
      });
    }
  } else {
    // matriz: cada temática × cada formato, visual a rodar pelas selecionadas; repete "quantos" vezes.
    const fmts = fmtsSel.length ? fmtsSel : (['frase'] as FormatoId[]);
    const vis = visSel.length ? visSel : (['conceptual'] as VisualId[]);
    let k = 0;
    for (let r = 0; r < quantos && jobs.length < TOTAL_MAX; r++) {
      for (const t of temasSel) {
        for (const f of fmts) {
          if (jobs.length >= TOTAL_MAX) break;
          jobs.push({ tematica: t, formato: f, visual: pick(vis, k++) });
        }
      }
    }
  }
  if (!jobs.length) return NextResponse.json({ erro: 'nada-a-gerar' }, { status: 400 });

  const supabase = getSupabaseAdmin();

  // memória anti-repetição: frases já usadas (por temática + recentes gerais).
  const evitar: string[] = [];
  const porTema: Record<string, string[]> = {};
  const veiasUsadas: string[] = []; // veias do livro já mineradas (anti-repetição)
  try {
    const { data } = await supabase.from('carousel_collections').select('dias, theme').like('slug', 'crescer-%');
    for (const r of (data ?? []) as { dias?: Array<{ slides?: Array<{ texto?: string }> }>; theme?: { crescer?: { tematica?: string; veiaId?: string } } }[]) {
      const t = r.dias?.[0]?.slides?.[0]?.texto;
      const tm = r.theme?.crescer?.tematica;
      if (t) { evitar.push(t); if (tm) (porTema[tm] = porTema[tm] || []).push(t); }
      if (r.theme?.crescer?.veiaId) veiasUsadas.push(r.theme.crescer.veiaId);
    }
  } catch { /* sem memória */ }
  const evitarDoTema = (t: string) => [...new Set([...(porTema[t] || []), ...evitar.slice(-20)])];

  const rows: Record<string, unknown>[] = [];
  let ultimoErro = '';
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    try {
      // seed roda o ARQUÉTIPO de cena por peça (anti-repetição das imagens): conta
      // o que já existe + a posição no lote, para cada imagem sair de um arquétipo diferente.
      const seed = evitar.length + i;
      // MINERAÇÃO: no modo livro, escolhe uma veia ainda não usada e passa-a como fonte.
      const veia: Veia | null = fonte === 'livro' ? escolherVeia(veiasUsadas, seed) : null;
      if (veia) veiasUsadas.push(veia.id);
      const peca = await gerarPecaCrescer(job.tematica, job.formato, job.visual, apiKey, evitarDoTema(job.tematica), tema, voz, seed, veia, imagemModo);
      evitar.push(peca.frase); (porTema[job.tematica] = porTema[job.tematica] || []).push(peca.frase);

      const slug = `crescer-${job.tematica}-${job.formato}-${Date.now()}-${i}`;
      // ENSAIO = carrossel tipográfico (texto longo, sem imagem, editorial: serif
      // menor, alinhado à esquerda, mais tempo por momento). Os outros levam imagem.
      const ehEnsaio = job.formato === 'ensaio';
      // imagem: nos formatos normais é partilhada por todos os slides; no ENSAIO
      // (carrossel de texto) a imagem fica SÓ na capa e os slides seguintes são
      // tipográficos limpos (como o modelo "As armadilhas do ego").
      const imageUrl = await fundoImagem(peca.fundoPrompt, slug);
      const linhas = peca.momentos && peca.momentos.length > 1 ? peca.momentos : [peca.frase];
      const padraoTip = body.tipografia && Object.keys(body.tipografia).length ? body.tipografia : undefined;
      // ENSAIO: a CAPA é faca sobre imagem (tipografia de capa: maior, centrada);
      // os SLIDES de texto são editoriais (serif menor, alinhado à esquerda, sem
      // imagem). Antes o editorial caía também na capa — era o bug.
      const tipCapa = ehEnsaio
        ? { fonte: body.tipografia?.fonte ?? 'serif', tamanho: 80, cor: body.tipografia?.cor, corDestaque: body.tipografia?.corDestaque, alinhV: 'centro', alinhH: 'centro' }
        : padraoTip;
      const tipBody = ehEnsaio
        ? { fonte: body.tipografia?.fonte ?? 'serif', tamanho: 46, cor: body.tipografia?.cor, corDestaque: body.tipografia?.corDestaque, alinhV: 'centro', alinhH: 'esq' }
        : undefined;
      // REGRA (Vivianne): num CARROSSEL (várias telas), a IMAGEM é SÓ na CAPA; os
      // outros slides são texto. Só as peças de 1 tela (frase) levam imagem no slide.
      const carrossel = linhas.length > 1;
      const slides = linhas.map((texto, idx) => ({
        tipo: 'kinetico',
        texto,
        destaque: idx === 0 ? peca.destaque : [],
        notaVisual: peca.fundoPrompt,
        imageUrl: carrossel ? (idx === 0 ? imageUrl : null) : imageUrl,
        capa: idx === 0,
        conceito: idx === 0 ? peca.conceito : undefined,
        // capa: tipografia de capa; ensaio (slides de texto): editorial; outros formatos: só a capa leva o padrão
        ...(idx === 0 ? (tipCapa ? { tipografia: tipCapa } : {}) : (tipBody ? { tipografia: tipBody } : {})),
        ...(idx === 0 && ehEnsaio ? { segPorMomento: 8 } : {}),
        ...(idx === 0 && body.efeito ? { efeito: body.efeito } : {}),
      }));
      const numeroFaixa = (Math.floor(Date.now() / 1000) % 100) + 1;
      const faixa = { numero: numeroFaixa, titulo: `Faixa ${String(numeroFaixa).padStart(2, '0')}`, url: faixaUrl(numeroFaixa) };
      const legenda = limparTravessoes(`${peca.legenda}\n\n@vivianne.dos.santos`);
      const dias = [{ dia: 1, mundo: CRESCER_MUNDO, palavra: peca.frase.slice(0, 48), slides, faixa, legenda, hashtags: peca.hashtags }];
      rows.push({
        slug,
        title: peca.titulo.slice(0, 60),
        brief: peca.frase,
        dias,
        // reel: escolha dela; veia*: a fonte minerada do livro (para ver a cobertura e não repetir).
        theme: { formato: 'reel', subtipo: 'kinetico', video: true, mundo: CRESCER_MUNDO, marca: 'crescer', crescer: { tematica: job.tematica, formato: job.formato, visual: job.visual, voz, reel: ehReel, ...(veia ? { veiaId: veia.id, veiaTitulo: veia.titulo, veiaLivro: veia.livroTitulo } : {}) } },
      });
    } catch (e) { ultimoErro = e instanceof Error ? e.message : String(e); }
  }

  if (!rows.length) return NextResponse.json({ erro: 'sem-pecas', detalhe: ultimoErro || undefined }, { status: 502 });
  const { error } = await supabase.from('carousel_collections').upsert(rows, { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gerados: rows.length, pedidos: jobs.length, detalhe: ultimoErro || undefined });
}
