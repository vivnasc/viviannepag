import Link from 'next/link';
import Image from 'next/image';
import { MANUAIS } from '@/lib/livros';
import { VerSoltarMark, VirSoltarMark, ViverSoltarMark } from '@/components/icons/SocialMarks';

// O método em três movimentos, na própria landing, com a dignidade dos produtos:
// cada movimento é um cartão liderado pela sua capa (a imagem distingue-os, ao
// contrário dos gradientes que se confundiam), numerado como a jornada
// (I ver → II vir → III viver), com promessa e preço, e o diagnóstico a
// encaminhar. Enquanto a capa não está renderizada, há um fundo digno com o
// símbolo do movimento.

const SB = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
const capaUrl = (slug: string) =>
  `${SB}/storage/v1/object/public/viviannepag-assets/livro-pilar/${slug}/capa-composta.png`;

const MARKS: Record<string, () => React.JSX.Element> = {
  'ver-soltar': VerSoltarMark,
  'vir-soltar': VirSoltarMark,
  'viver-soltar': ViverSoltarMark,
};
const ROMANO = ['I', 'II', 'III'];

async function capaExiste(url: string): Promise<boolean> {
  if (!SB) return false;
  try {
    const r = await fetch(url, { method: 'HEAD', next: { revalidate: 300 } });
    return r.ok;
  } catch {
    return false;
  }
}

export async function MetodoMovimentos({ locale }: { locale: string }) {
  const isEn = locale === 'en';
  const base = isEn ? '/en' : '';
  const temCapa = await Promise.all(MANUAIS.map((m) => capaExiste(capaUrl(m.slug))));

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
          ? 'First one sees, then one returns, finally one embodies. Three doors into the same method, each a short, usable manual.'
          : 'Primeiro vê-se, depois regressa-se, por fim encarna-se. Três portas para o mesmo método, cada uma um manual curto, para usar.'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-[980px] mx-auto">
        {MANUAIS.map((m, i) => {
          const Mark = MARKS[m.slug];
          return (
            <Link
              key={m.slug}
              href={`${base}/${m.slug}`}
              className="rv group block no-underline rounded-[18px] overflow-hidden border border-ocre/25 hover:border-ambar/50 transition-colors"
            >
              {/* topo: a capa (ou fundo digno com o símbolo, até renderizar) */}
              <div className="relative aspect-[3/4] overflow-hidden" style={{ background: `linear-gradient(168deg, ${m.cor.topo}, ${m.cor.baixo})` }}>
                {temCapa[i] ? (
                  <Image
                    src={capaUrl(m.slug)}
                    alt={m.marca}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-14 h-14 mb-5 opacity-90 [&_svg]:w-14 [&_svg]:h-14">
                      <Mark />
                    </div>
                    <p className="font-serif text-creme text-[1.7rem] leading-none">{m.marca}</p>
                    <p className="font-serif italic text-creme-2/70 text-[0.85rem] mt-2">{m.movimento}</p>
                  </div>
                )}
                <span className="absolute top-4 left-4 font-serif text-[0.9rem] text-ambar/90 bg-[#16101F]/70 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center">
                  {ROMANO[i]}
                </span>
              </div>

              {/* corpo: como os produtos — título, promessa, ação */}
              <div className="p-5 bg-[#16101F]/40">
                <p className="font-sans text-[0.66rem] tracking-[0.26em] uppercase text-salvia mb-1.5">{m.movimento}</p>
                <h3 className="font-serif font-light text-creme text-[1.3rem] leading-[1.15] mb-2 group-hover:text-ambar transition-colors">{m.marca}</h3>
                <p className="text-creme-2/75 text-[0.9rem] leading-[1.55] mb-4 line-clamp-3">{isEn ? m.promessaEn : m.promessa}</p>
                <div className="flex items-baseline justify-between">
                  <span className="font-sans text-[0.78rem] tracking-[0.1em] text-ambar">{isEn ? 'see the method →' : 'ver o método →'}</span>
                  <span className="font-serif text-ambar/90 text-[1.05rem]">{m.preco}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="rv text-center mt-12 flex flex-col items-center gap-3">
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
