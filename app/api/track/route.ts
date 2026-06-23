import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// POST /api/track — regista UMA visita ao site (chamado pelo SiteTracker no
// layout público). Guarda o caminho, a FONTE (de onde veio: Instagram, TikTok,
// Google, direto…) e o país. Público e à prova de falhas (nunca quebra a página).

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function classificar(ref: string, path: string): string {
  // utm_source explícito ganha sempre (ex.: link na bio com ?utm_source=instagram)
  try {
    const u = new URL(path, 'https://x');
    const utm = u.searchParams.get('utm_source');
    if (utm) return cap(utm.toLowerCase());
  } catch { /* path simples */ }

  if (!ref) return 'Direto';
  let host = '';
  try { host = new URL(ref).hostname.replace(/^www\./, ''); } catch { return 'Outro'; }

  const nosso = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  if (nosso && host.includes(nosso)) return 'Interno';
  if (host.includes('vercel')) return 'Interno'; // previews/painel Vercel = ruído de teste
  if (host.includes('instagram')) return 'Instagram';
  if (host.includes('tiktok')) return 'TikTok';
  if (host.includes('facebook') || host.includes('l.facebook') || host === 'fb.com') return 'Facebook';
  if (host.includes('google')) return 'Google';
  if (host.includes('bing')) return 'Bing';
  if (host.includes('linktr')) return 'Linktree';
  if (host === 't.co' || host.includes('twitter') || host === 'x.com') return 'X';
  if (host.includes('youtube') || host.includes('youtu.be')) return 'YouTube';
  if (host.includes('whatsapp')) return 'WhatsApp';
  return host; // domínio cru, para fontes não previstas
}

export async function POST(req: NextRequest) {
  try {
    const { path = '/', ref = '' } = (await req.json().catch(() => ({}))) as { path?: string; ref?: string };
    const source = classificar(ref, path);
    const pais = req.headers.get('x-vercel-ip-country') || null;
    const cidade = (() => { try { return decodeURIComponent(req.headers.get('x-vercel-ip-city') || '') || null; } catch { return req.headers.get('x-vercel-ip-city') || null; } })();
    const regiao = req.headers.get('x-vercel-ip-country-region') || null;
    const ua = req.headers.get('user-agent') || '';
    const dispositivo = /mobile|android|iphone|ipad|ipod/i.test(ua) ? 'Telemóvel' : 'Computador';

    const sb = getSupabaseAdmin();
    const base = { path: String(path).slice(0, 300), source, referrer: ref ? String(ref).slice(0, 300) : null, pais };
    // tenta com os campos novos (cidade/região/dispositivo); se as colunas ainda
    // não existirem, grava só o base — assim nunca se perde a visita.
    const { error } = await sb.from('site_views').insert({ ...base, cidade, regiao, dispositivo });
    if (error) await sb.from('site_views').insert(base);
  } catch { /* nunca falha para o utilizador */ }
  return new NextResponse(null, { status: 204 });
}
