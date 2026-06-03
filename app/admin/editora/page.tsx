import Link from 'next/link';
import { listarLivros } from '@/lib/editora';
import { JaLiToggle } from '@/components/admin/JaLiToggle';

export const dynamic = 'force-dynamic';

export default function EditoraAdmin() {
  const livros = listarLivros();

  // agrupa por coleção, preservando a ordem de listarLivros
  const grupos: { colecao: string; mundo: string; livros: typeof livros }[] = [];
  for (const l of livros) {
    let g = grupos.find(x => x.colecao === l.colecao);
    if (!g) { g = { colecao: l.colecao, mundo: l.mundo, livros: [] }; grupos.push(g); }
    g.livros.push(l);
  }

  const totalPalavras = livros.reduce((s, l) => s + l.palavras, 0);

  return (
    <main className="max-w-[960px] mx-auto px-7 py-12">
      <header className="mb-10">
        <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin</p>
        <h1 className="font-serif font-light text-creme text-3xl">editora</h1>
        <p className="text-creme-2/60 text-[0.85rem] mt-3 font-serif italic">
          {livros.length} livros · {totalPalavras.toLocaleString('pt-PT')} palavras · tudo publicado — marca o que já leste
        </p>
      </header>

      {grupos.length === 0 ? (
        <p className="text-creme-2/70 italic font-serif">Ainda não há livros escritos em content/produtos.</p>
      ) : (
        <div className="space-y-12">
          {grupos.map(g => (
            <section key={g.colecao}>
              <div className="flex items-baseline gap-3 mb-5">
                <h2 className="font-serif text-ambar text-xl font-light">{g.colecao}</h2>
                <span className="text-creme-2/40 text-[0.78rem]">{g.livros.length} livros</span>
              </div>
              <div className="grid gap-3">
                {g.livros.map(l => (
                  <div
                    key={l.slug}
                    className="block border border-ocre/15 rounded-[14px] p-5 hover:border-ocre/30 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link href={`/admin/editora/${l.slug}`} className="no-underline">
                          <h3 className="font-serif text-creme text-[1.15rem] group-hover:text-ambar transition-colors">{l.titulo}</h3>
                        </Link>
                        {l.subtitulo && <p className="text-creme-2/70 text-[0.85rem] mt-1 italic font-serif">{l.subtitulo}</p>}
                        <p className="text-creme-2/40 text-[0.72rem] mt-2">{l.slug}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <JaLiToggle slug={l.slug} />
                        <p className="text-ocre text-[0.8rem] mt-1">{l.capitulos.length} capítulos</p>
                        <p className="text-creme-2/60 text-[0.78rem]">
                          {l.palavras.toLocaleString('pt-PT')} palavras
                        </p>
                        <p className={`text-[0.74rem] ${l.auditoria.erros ? 'text-rosa/80' : l.auditoria.avisos ? 'text-ambar/80' : 'text-salvia'}`}>
                          {l.auditoria.erros
                            ? `⚠ ${l.auditoria.erros} erro(s)`
                            : l.auditoria.avisos
                            ? `${l.auditoria.avisos} aviso(s)`
                            : '✓ compliance'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
