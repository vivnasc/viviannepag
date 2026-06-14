import Link from 'next/link';
import { MANUAIS } from '@/lib/livros';

// Apresenta o método e os três movimentos na própria landing (não só links):
// cada movimento com a sua promessa e o estado-depois, e o diagnóstico a
// encaminhar. O mapa inteiro é o pilar.
export function MetodoMovimentos({ locale }: { locale: string }) {
  const isEn = locale === 'en';
  const base = isEn ? '/en' : '';
  return (
    <section className="my-4">
      <p className="rv text-center font-sans text-[0.72rem] tracking-[0.32em] uppercase text-ocre mb-3">
        {isEn ? 'The method, in three movements' : 'O método, em três movimentos'}
      </p>
      <h2 className="rv text-center font-serif font-light text-creme text-[clamp(1.6rem,5vw,2.3rem)] leading-[1.2] mb-3">
        {isEn ? 'See. Come back. Live.' : 'Ver. Vir. Viver.'}
      </h2>
      <p className="rv text-center text-creme-2/70 max-w-[560px] mx-auto mb-12 text-[1.02rem] leading-relaxed">
        {isEn
          ? 'First one sees, then one returns, finally one embodies. Three doors into the same method. Each one a short, usable manual.'
          : 'Primeiro vê-se, depois regressa-se, por fim encarna-se. Três portas para o mesmo método. Cada uma um manual curto, para usar.'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-[920px] mx-auto">
        {MANUAIS.map((m) => (
          <Link
            key={m.slug}
            href={`${base}/${m.slug}`}
            className="rv group block rounded-[16px] border border-ocre/20 hover:border-ambar/50 transition-colors p-6 no-underline"
            style={{ background: `linear-gradient(168deg, ${m.cor.topo}, ${m.cor.baixo})` }}
          >
            <p className="font-serif text-creme text-[1.45rem] leading-none">{m.marca}</p>
            <p className="font-serif italic text-creme-2/75 text-[0.9rem] mt-2">{m.movimento}</p>
            <p className="text-creme-2/80 text-[0.92rem] leading-relaxed mt-4">
              {(isEn ? m.promessaEn : m.promessa)}
            </p>
            <p className="font-sans text-[0.78rem] tracking-[0.12em] text-ambar mt-5">
              {isEn ? 'see the method →' : 'ver o método →'}
            </p>
          </Link>
        ))}
      </div>

      <div className="rv text-center mt-10 flex flex-col items-center gap-3">
        <Link href={`${base}/diagnostico`} className="inline-block bg-ambar text-[#2A1C12] no-underline rounded-full px-7 py-3 text-[0.9rem] font-sans tracking-[0.02em] hover:bg-ocre transition-colors">
          {isEn ? 'Not sure where to begin? Take the diagnostic' : 'Não sabes por onde começar? Faz o diagnóstico'}
        </Link>
        <Link href={`${base}/os-sete-veus`} className="font-sans text-[0.85rem] tracking-[0.04em] text-creme-2/70 no-underline border-b border-ocre/30 hover:text-ambar hover:border-ambar pb-0.5 transition-colors">
          {isEn ? 'The whole map: The Seven Veils' : 'O mapa inteiro: Os Sete Véus'}
        </Link>
      </div>
    </section>
  );
}
