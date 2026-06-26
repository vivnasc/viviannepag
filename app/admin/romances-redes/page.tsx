import { isAdmin } from '@/lib/admin-auth';
import { ROMANCES } from '@/lib/romances';
import { romanceCapaUrl } from '@/lib/romance-loja';
import { RomancesRedes } from '@/components/admin/RomancesRedes';

export const dynamic = 'force-dynamic';

const SITE = 'https://viviannedossantos.com';

// Página de apoio às redes: todas as capas + links dos romances num só sítio, para
// arrastar para Stories/anéis sem copiar URLs à mão.
export default async function RomancesRedesAdmin() {
  if (!(await isAdmin())) {
    return (
      <main className="max-w-[720px] mx-auto px-7 py-12">
        <p className="text-creme-2/70 font-serif italic">Sem acesso. Entra primeiro no admin.</p>
      </main>
    );
  }

  const itens = ROMANCES.map((r) => ({
    slug: r.slug,
    titulo: r.titulo,
    estante: r.estante,
    capa: romanceCapaUrl(r.slug, 'pt'),
    link: r.slug === 'rom-01-amparo' ? `${SITE}/amparo` : `${SITE}/loja/${r.slug}`,
    gratis: r.slug === 'rom-01-amparo',
  }));

  return (
    <main className="max-w-[1100px] mx-auto px-7 py-12">
      <header className="mb-8">
        <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin</p>
        <h1 className="font-serif font-light text-creme text-3xl">romances · capas &amp; links</h1>
        <p className="text-creme-2/60 text-[0.85rem] mt-3 font-serif italic">
          Todas as capas e links num só sítio, para os Stories e os anéis. No telemóvel, faz long-press na capa para a guardar; ou “descarregar capa”. “copiar link” põe o endereço do livro na área de transferência. (O “As Mãos de Amparo” aponta para a página grátis.)
        </p>
      </header>

      <RomancesRedes itens={itens} />
    </main>
  );
}
