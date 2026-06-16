import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes } from '@/lib/texto';
import { getConta, type ContaId } from '@/lib/metodo/contas';
import { horaDoMetodo, dataLocal } from '@/lib/metodo/agenda';
import { realceAuto } from '@/lib/metodo/reels';

export const runtime = 'nodejs';
export const maxDuration = 120;

// Reel de FRASE rápido (emergências / inspiração da hora): 1 frase + 1 fundo JÁ
// guardado + motion (cinético, 1 face). Autónomo, à PARTE da produção semanal:
// a Vivianne escolhe a conta, escreve a frase, escolhe um fundo do que já existe
// e agenda (data + hora). Depois renderiza e publica (agora ou na data).
// Não gera imagem nova (reaproveita) e não toca na produção semanal.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as {
    conta?: string; texto?: string; destaque?: string[]; imageUrl?: string; conceito?: string; data?: string; hora?: string;
  };

  const contaId = (body.conta ?? '') as ContaId;
  const conta = getConta(contaId);
  if (!conta) return NextResponse.json({ erro: 'conta-desconhecida' }, { status: 400 });

  const texto = limparTravessoes((body.texto ?? '').trim());
  if (!texto) return NextResponse.json({ erro: 'sem-texto' }, { status: 400 });

  const imageUrl = (body.imageUrl ?? '').trim() || null;
  const destaque = body.destaque && body.destaque.length ? body.destaque : realceAuto(texto);
  const conceito = (body.conceito ?? '').trim();
  const data = (body.data ?? '').trim() || dataLocal(new Date());
  const hora = (body.hora ?? '').trim() || horaDoMetodo(contaId);

  const slug = `metodo-frase-${contaId}-${Date.now()}`;
  const numeroFaixa = (Math.floor(Date.now() / 1000) % 100) + 1;
  const faixa = { numero: numeroFaixa, titulo: `Faixa ${String(numeroFaixa).padStart(2, '0')}`, url: faixaUrl(numeroFaixa) };
  const slides = [
    { tipo: 'metodo', face: 1, texto, destaque, notaVisual: '', imageUrl, capa: true, conceito, contaId },
  ];
  const dias = [{ dia: 1, mundo: 'autora', palavra: texto.slice(0, 48), slides, faixa, legenda: texto, hashtags: [] as string[] }];

  const row = {
    slug,
    title: texto.slice(0, 48),
    brief: texto,
    dias,
    theme: {
      formato: 'reel', subtipo: 'kinetico', video: true, mundo: 'autora', marca: conta.marca,
      agendadoEm: data, hora,
      metodo: { conta: contaId, tipo: 'frase' },
    },
  };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('carousel_collections').insert(row);
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, slug, data, hora });
}
