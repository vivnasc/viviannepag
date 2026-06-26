import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { GerarAnuncio } from '@/components/admin/GerarAnuncio';
import { romanceCapaUrl } from '@/lib/romance-loja';
import GUIOES from '@/lib/anuncio/guiao.json';

export const dynamic = 'force-dynamic';

type Anuncio = { nome: string; url: string; criado: string | null };
type Cena = { id: string; rotulo: string; cenaPrompt?: string; klingPrompt?: string; usarCapa?: boolean };
type Guiao = { nome: string; cenas: Cena[]; intro: { texto: string; st: number; en: number }[]; introDur: number; falas: string[]; fim: { titulo: string; cta: string; site: string } };

export default async function AnuncioAdmin() {
  if (!(await isAdmin())) {
    return (
      <main className="max-w-[720px] mx-auto px-7 py-12">
        <p className="text-creme-2/70 font-serif italic">Sem acesso. Entra primeiro no admin.</p>
      </main>
    );
  }

  const sb = getSupabaseAdmin();
  const { data } = await sb.storage.from('viviannepag-assets').list('anuncios', {
    limit: 50, sortBy: { column: 'created_at', order: 'desc' },
  });
  const anuncios: Anuncio[] = (data ?? [])
    .filter((f) => f.name.endsWith('.mp4'))
    .map((f) => ({
      nome: f.name,
      url: sb.storage.from('viviannepag-assets').getPublicUrl(`anuncios/${f.name}`).data.publicUrl,
      criado: (f as { created_at?: string }).created_at ?? null,
    }));

  return (
    <main className="max-w-[980px] mx-auto px-7 py-12">
      <header className="mb-8">
        <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin</p>
        <h1 className="font-serif font-light text-creme text-3xl">o anúncio</h1>
        <p className="text-creme-2/60 text-[0.85rem] mt-3 font-serif italic">
          Vê o storyboard e ouve a tua voz primeiro. Só quando estiver do teu agrado é que mandas montar o vídeo. Sem surpresas.
        </p>
      </header>

      <GerarAnuncio guioes={GUIOES as Record<string, Guiao>} capaUrl={romanceCapaUrl('rom-01-amparo', 'pt')} />

      <h2 className="font-serif font-light text-creme text-xl mb-4 mt-12">vídeos já montados</h2>
      {anuncios.length === 0 ? (
        <p className="text-creme-2/50 italic font-serif">Ainda nenhum. Depois de "montar o vídeo final", aparece aqui.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {anuncios.map((a) => (
            <div key={a.nome} className="rounded-[12px] border border-ocre/20 p-3">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video src={a.url} controls className="w-full rounded-[8px] aspect-[9/16] object-cover bg-black" />
              <div className="flex items-center justify-between mt-2">
                <span className="text-creme-2/60 text-[0.72rem]">
                  {a.nome.includes('-b-') ? 'B' : 'A'}
                  {a.criado ? ` · ${new Date(a.criado).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}` : ''}
                </span>
                <a href={a.url} download className="text-ambar text-[0.74rem] no-underline hover:opacity-80">descarregar</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
