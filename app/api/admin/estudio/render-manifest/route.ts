import { NextResponse } from 'next/server';
import { CALENDARIO_30_DIAS } from '@/lib/estudio-conteudo';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const maxDuration = 30;

// GET ?jobId=... — devolve tarefas (publico, usado pelo GitHub Actions job)
// Inclui URLs das imagens ja geradas em viviannepag-assets/estudio/{mundo}/dia-N/

export async function GET(req: Request) {
  const url = new URL(req.url);
  const jobId = url.searchParams.get('jobId');
  if (!jobId) return NextResponse.json({ erro: 'jobId obrigatorio' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const tarefas: Array<{
    dia: number;
    idx: number;
    tipo: string;
    layout: string;
    imageUrl?: string;
  }> = [];

  for (const conteudo of CALENDARIO_30_DIAS) {
    if (!conteudo.slides) continue;

    // Lista imagens existentes deste mundo+dia
    let imagensExistentes: Array<{ name: string; url: string; slideIdx: number }> = [];
    try {
      const prefix = `estudio/${conteudo.mundo}/dia-${conteudo.dia}`;
      const { data } = await supabase.storage.from('viviannepag-assets').list(prefix, { limit: 100 });
      if (data) {
        const rx = /^slide-(\d+)-(.+)-(\d{10,13})\.jpg$/;
        imagensExistentes = data
          .map(f => {
            const m = f.name.match(rx);
            if (!m) return null;
            const path = `${prefix}/${f.name}`;
            const { data: urlData } = supabase.storage.from('viviannepag-assets').getPublicUrl(path);
            return { name: f.name, url: urlData.publicUrl, slideIdx: Number(m[1]) };
          })
          .filter((x): x is { name: string; url: string; slideIdx: number } => x !== null)
          .sort((a, b) => a.name.localeCompare(b.name));
      }
    } catch {}

    for (let i = 0; i < conteudo.slides.length; i++) {
      const slide = conteudo.slides[i];
      const layout =
        slide.fundoClaro ? 'claro' :
        slide.tipo === 'cta' ? 'cta' :
        slide.tipo === 'capa' ? 'foto-fundo' :
        'statement';

      const imgMatch = imagensExistentes.find(img => img.slideIdx === i);

      tarefas.push({
        dia: conteudo.dia,
        idx: i,
        tipo: slide.tipo,
        layout,
        imageUrl: imgMatch?.url,
      });
    }
  }

  return NextResponse.json({
    jobId,
    geradoEm: new Date().toISOString(),
    tarefas,
    total: tarefas.length,
  });
}
