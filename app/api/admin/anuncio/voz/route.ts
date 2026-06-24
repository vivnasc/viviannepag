import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { gerarVoz } from '@/lib/metodo/voz';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { escreverManifesto } from '@/lib/anuncio/manifest';
import GUIOES from '@/lib/anuncio/guiao.json';

export const runtime = 'nodejs';
export const maxDuration = 120;

// PASSO 3 da prévia: gera, na hora, a TUA voz (eleven_v3) a ler a narração do guião,
// para a ouvires ANTES de montar. Usa a mesma função/voz dos teus conteúdos
// (lib/metodo/voz) e o endpoint COM TIMESTAMPS — guardamos o tempo de cada PALAVRA,
// para o render fazer KARAOKÊ (a palavra acende no momento exato em que a dizes).
// É EXATAMENTE a voz que o vídeo final vai ter — sem surpresas.
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const v = (req.nextUrl.searchParams.get('variante') === 'B' ? 'B' : 'A') as 'A' | 'B';
  const g = (GUIOES as Record<string, { falas: string[] }>)[v];
  const texto = g.falas.join(' ');
  try {
    const { url, dur, palavras } = await gerarVoz(texto, `anuncio-${v.toLowerCase()}`);
    // guarda no manifesto: o render usa ESTA voz + ESTES tempos (karaokê), sem regerar.
    try { await escreverManifesto(getSupabaseAdmin(), v, { voz: { url, dur, palavras } }); } catch { /* sem manifesto, o render gera a voz na hora */ }
    return NextResponse.json({ ok: true, url, dur, texto });
  } catch (e) {
    return NextResponse.json({ erro: (e as Error).message }, { status: 500 });
  }
}
