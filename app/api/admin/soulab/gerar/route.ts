import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes } from '@/lib/texto';
import { SOULAB_MUNDO, getTipoSoulab, soulabHandle, type TipoSoulabId } from '@/lib/soulab/marca';
import { gerarPecaSoulab } from '@/lib/soulab/gerar-ia';
import { escolherVeia, type Veia } from '@/lib/knowledge/veias';

export const runtime = 'nodejs';
export const maxDuration = 300;

// SOULAB · gera N peças (reels contemplativos) de um ÂNGULO e grava-as em
// carousel_collections com theme.marca='soulab' (vehículo 'kinetico': imagem
// simbólica + fragmento que se revela). Assim aparecem no Publicar e no Analítico
// sem tocar nos outros motores. A imagem (Flux) gera-se já aqui — a peça nasce
// pronta a renderizar.

// gera a imagem de fundo (Flux) a partir do prompt e devolve o URL (ou null).
async function fundoImagem(prompt: string, slug: string): Promise<string | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token || !prompt) return null;
  try {
    const url = await gerarImagemFlux(prompt, token, { raw: true });
    try { return await guardarImagem(url, `soulab/${slug}/fundo-${Date.now()}.jpg`); } catch { return url; }
  } catch { return null; }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { tipo?: string; quantos?: number; tema?: string; formato?: 'frase' | 'momentos'; continuarDe?: string; modo?: 'abre' | 'encaminha'; fonte?: 'livro' | 'tema'; lingua?: 'pt' | 'en' };
  const modo = body.modo === 'encaminha' ? 'encaminha' : 'abre';
  // LÍNGUA: 'pt' = @soulab.studio · 'en' = a Soulab em inglês, na conta internacional.
  // Ao continuar um fio, herda-se a língua da peça-mãe (mais abaixo).
  let lingua: 'pt' | 'en' = body.lingua === 'en' ? 'en' : 'pt';
  // FONTE: 'livro' (defeito) = minera os livros dela; 'tema' = a partir do ângulo/tema.
  // ao continuar um fio, não se minera (segue o fio da peça-mãe).
  const fonte = body.continuarDe ? 'tema' : (body.fonte === 'tema' ? 'tema' : 'livro');
  let tipoId = (body.tipo ?? 'frase') as TipoSoulabId;

  // CONTINUAR O FIO (1+3): a parte seguinte de um reel que resultou. Herda da peça-mãe
  // a VOZ (frase/conceito), a CENA (evolui-a, não troca de sujeito), o FORMATO e a
  // TIPOGRAFIA, e LIGA-as como série (parteDe/parte) — para se sentir o passo seguinte
  // do MESMO reel, não outro do mesmo ângulo.
  let continuarDe: { frase: string; conceito?: string; cena?: string } | null = null;
  let formatoHerdado: 'frase' | 'momentos' | undefined;
  let tipografiaHerdada: Record<string, unknown> | undefined;
  let parteDe: string | undefined;
  let parteNum: number | undefined;
  if (body.continuarDe) {
    const supabaseC = getSupabaseAdmin();
    const { data } = await supabaseC.from('carousel_collections').select('dias, theme').eq('slug', body.continuarDe).maybeSingle();
    const s = (data?.dias as Array<{ slides?: Array<{ texto?: string; conceito?: string; notaVisual?: string; tipografia?: Record<string, unknown> | null }> }> | undefined)?.[0]?.slides?.[0];
    if (s?.texto) continuarDe = { frase: s.texto, conceito: s.conceito, cena: s.notaVisual ?? undefined };
    if (s?.tipografia) tipografiaHerdada = s.tipografia;
    const sl = (data?.theme as { soulab?: { tipo?: string; formato?: 'frase' | 'momentos'; parte?: number; lingua?: 'pt' | 'en' } } | undefined)?.soulab;
    if (sl?.tipo && getTipoSoulab(sl.tipo)) tipoId = sl.tipo as TipoSoulabId;
    if (sl?.formato === 'momentos' || sl?.formato === 'frase') formatoHerdado = sl.formato;
    if (sl?.lingua === 'en' || sl?.lingua === 'pt') lingua = sl.lingua; // a parte 2 fica na língua da peça-mãe
    parteDe = body.continuarDe;
    parteNum = (sl?.parte ?? 1) + 1;
  }

  if (!getTipoSoulab(tipoId)) return NextResponse.json({ erro: 'tipo-invalido' }, { status: 400 });
  const quantos = Math.min(4, Math.max(1, body.quantos ?? 1));
  const tema = body.tema?.trim() || undefined;
  // ao continuar, herda o formato da peça-mãe (se era "vários momentos", a parte 2 também).
  const formato = formatoHerdado ?? (body.formato === 'momentos' ? 'momentos' : 'frase');

  const supabase = getSupabaseAdmin();

  // memória anti-repetição: frases/conceitos E cenas de imagem já usadas na Soulab.
  // Por TIPO (o mesmo tipo repetia-se) + as imagens (portas/objetos partidos a mais).
  const evitar: string[] = [];
  const porTipo: Record<string, string[]> = {};
  const evitarImg: string[] = [];
  const veiasUsadas: string[] = []; // veias do livro já mineradas (anti-repetição)
  try {
    // MEMÓRIA POR LÍNGUA: as peças EN vivem em slugs 'soulab-en-*' e as PT em
    // 'soulab-<tipo>-*'. Cada língua tem a sua anti-repetição (comparar texto EN
    // com texto PT não faz sentido; e a EN pode cobrir os mesmos capítulos em inglês).
    const prefixo = lingua === 'en' ? 'soulab-en-%' : 'soulab-%';
    const { data } = await supabase.from('carousel_collections').select('slug, dias, theme').like('slug', prefixo);
    for (const r of (data ?? []) as { slug: string; dias?: Array<{ slides?: Array<{ texto?: string; conceito?: string; notaVisual?: string }> }>; theme?: { soulab?: { tipo?: string; veiaId?: string } } }[]) {
      // no modo PT, o 'soulab-%' também apanha as EN — salta-as (só conta a mesma língua).
      if (lingua === 'pt' && r.slug.startsWith('soulab-en-')) continue;
      const s = r.dias?.[0]?.slides?.[0];
      const tp = r.theme?.soulab?.tipo;
      if (s?.texto) { evitar.push(s.texto); if (tp) (porTipo[tp] = porTipo[tp] || []).push(s.texto); }
      if (s?.conceito) evitar.push(s.conceito);
      if (s?.notaVisual) evitarImg.push(s.notaVisual);
      if (r.theme?.soulab?.veiaId) veiasUsadas.push(r.theme.soulab.veiaId);
    }
  } catch { /* sem memória */ }
  // ao gerar um tipo, vê TODAS as frases já feitas desse tipo + as gerais recentes.
  const evitarDoTipo = () => [...new Set([...(porTipo[tipoId] || []), ...evitar.slice(-20)])];

  const rows: Record<string, unknown>[] = [];
  let ultimoErro = '';
  for (let i = 0; i < quantos; i++) {
    try {
      // MINERAÇÃO: no modo livro (e não a continuar), escolhe uma veia ainda não usada.
      const veia: Veia | null = fonte === 'livro' ? escolherVeia(veiasUsadas, evitar.length + i) : null;
      if (veia) veiasUsadas.push(veia.id);
      const peca = await gerarPecaSoulab(tipoId, apiKey, evitarDoTipo(), tema, formato, evitarImg, continuarDe, modo, veia, lingua);
      evitar.push(peca.frase); (porTipo[tipoId] = porTipo[tipoId] || []).push(peca.frase);
      if (peca.conceito) evitar.push(peca.conceito);
      if (peca.fundoPrompt) evitarImg.push(peca.fundoPrompt); // não repetir a cena nas seguintes

      // slug com prefixo de língua (EN: 'soulab-en-…') — é por aqui que o publicador
      // sabe que a peça vai para a conta internacional (ver lib/instagram/contas.ts).
      const slug = `soulab-${lingua === 'en' ? 'en-' : ''}${tipoId}-${Date.now()}-${i}`;
      const imageUrl = await fundoImagem(peca.fundoPrompt, slug);
      // FORMATO: "vários momentos" => N slides (1 por linha), MESMA cena/imagem; o
      // render sequencia-os sobre o fundo partilhado. "frase" => 1 slide (o de sempre).
      const linhas = peca.momentos && peca.momentos.length > 1 ? peca.momentos : [peca.frase];
      const slides = linhas.map((texto, idx) => ({
        tipo: 'kinetico',
        texto,
        destaque: peca.destaque,
        notaVisual: peca.fundoPrompt,
        imageUrl,
        capa: idx === 0,
        conceito: idx === 0 ? peca.conceito : undefined,
        // ao continuar, herda o LOOK (tipografia) da peça-mãe, para a série ser coerente.
        ...(tipografiaHerdada ? { tipografia: tipografiaHerdada } : {}),
      }));
      const numeroFaixa = (Math.floor(Date.now() / 1000) % 100) + 1;
      const faixa = { numero: numeroFaixa, titulo: `Faixa ${String(numeroFaixa).padStart(2, '0')}`, url: faixaUrl(numeroFaixa) };
      const legenda = limparTravessoes(`${peca.legenda}\n\nSoulab · @${soulabHandle(lingua)}`);
      const dias = [{ dia: 1, mundo: SOULAB_MUNDO, palavra: peca.frase.slice(0, 48), slides, faixa, legenda, hashtags: peca.hashtags }];
      rows.push({
        slug,
        title: peca.titulo.slice(0, 60),
        brief: peca.frase,
        dias,
        theme: { formato: 'reel', subtipo: 'kinetico', video: true, mundo: SOULAB_MUNDO, marca: 'soulab', soulab: { tipo: tipoId, formato, lingua, ...(parteDe ? { parteDe, parte: parteNum } : {}), ...(veia ? { veiaId: veia.id, veiaTitulo: veia.titulo, veiaLivro: veia.livroTitulo } : {}) } },
      });
    } catch (e) { ultimoErro = e instanceof Error ? e.message : String(e); }
  }

  if (!rows.length) return NextResponse.json({ erro: 'sem-pecas', detalhe: ultimoErro || undefined }, { status: 502 });
  const { error } = await supabase.from('carousel_collections').upsert(rows, { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gerados: rows.length, detalhe: ultimoErro || undefined });
}
