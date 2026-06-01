import Link from 'next/link';
import { listarLivros } from '@/lib/editora';

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
          {livros.length} livros escritos · {totalPalavras.toLocaleString('pt-PT')} palavras · para reveres antes de publicar
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
                  <Link
                    key={l.slug}
                    href={`/admin/editora/${l.slug}`}
                    className="block border border-ocre/15 rounded-[14px] p-5 hover:bg-terra-2/40 hover:border-ocre/30 transition-colors no-underline group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-serif text-creme text-[1.15rem] group-hover:text-ambar transition-colors">{l.titulo}</h3>
                        {l.subtitulo && <p className="text-creme-2/70 text-[0.85rem] mt-1 italic font-serif">{l.subtitulo}</p>}
                        <p className="text-creme-2/40 text-[0.72rem] mt-2">{l.slug}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-ocre text-[0.8rem]">{l.capitulos.length} capítulos</p>
                        <p className={`text-[0.78rem] mt-1 ${l.palavras >= 8000 ? 'text-salvia' : 'text-rosa/70'}`}>
                          {l.palavras.toLocaleString('pt-PT')} palavras
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
