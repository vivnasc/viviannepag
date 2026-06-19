import { TopNav } from '@/components/TopNav';
import { RomanceCompra } from '@/components/romance/RomanceCompra';
import { ROTA_PARA_ROM } from '@/lib/romance-produto';
import { romancePdfPronto, romanceCapaUrl } from '@/lib/romance-loja';

export type AmostraRomance = {
  titulo: string;       // título do capítulo 1
  assentos: string;     // página dos Assentos de abertura
  capitulo: string;     // capítulo 1 inteiro
  // versões EN (geradas dos md -en); quando existem, a landing EN usa-as.
  tituloEn?: string;
  assentosEn?: string;
  capituloEn?: string;
};

export type RomanceMeta = {
  slug: string;
  romano: string;       // numeral da estante (II, III…)
  serieLabel: { pt: string; en: string };  // "Biblioteca de Véspera · o terceiro romance"
  tituloPt: string;
  tituloEn: string;
  pitchPt: string;
  pitchEn: string;
  // classes Tailwind COMPLETAS da cor da estante irmã (o JIT só gera literais;
  // estes literais vivem nos ficheiros lib/, que o content do Tailwind lê)
  corTexto: string;     // p.ex. 'text-ouro'
  corBorda: string;     // p.ex. 'border-ouro/40'
};

// Bloco reutilizável para as páginas dos romances novos (a partir do livro 3).
// Mantém o padrão do /amparo e do /nome-da-irma: capa tipográfica, pitch,
// página dos Assentos + capítulo 1 em papel, e ponte para o Amparo (oferta).
export async function RomancePreview({
  meta, amostra, locale,
}: { meta: RomanceMeta; amostra: AmostraRomance; locale: string }) {
  const isEn = locale === 'en';
  const paragrafos = (s: string) => s.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const corTexto = meta.corTexto;
  const corBorda = meta.corBorda;
  // Estado de loja lido UMA vez do Storage e partilhado com a CTA: assim o topo
  // da página nunca diz "chega em breve" enquanto o botão de compra já está em
  // baixo (o que fazia o livro renderizado parecer que não tinha ficado à venda).
  const rom = ROTA_PARA_ROM[meta.slug] ?? '';
  const pronto = await romancePdfPronto(rom);
  // Em EN, mostra a amostra EN quando existe; senão cai no PT (com aviso).
  const amEn = isEn && !!amostra.capituloEn;
  const aTitulo = amEn ? amostra.tituloEn! : amostra.titulo;
  const aAssentos = amEn ? amostra.assentosEn! : amostra.assentos;
  const aCapitulo = amEn ? amostra.capituloEn! : amostra.capitulo;

  return (
    <main className="min-h-screen">
      <TopNav />

      <section className="max-w-[920px] mx-auto px-6 pt-14 pb-10 flex flex-col md:flex-row items-center gap-10">
        <div className="shrink-0 w-[220px] md:w-[260px]">
          {pronto ? (
            // capa composta real (a mesma do render e da biblioteca)
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={romanceCapaUrl(rom, isEn ? 'en' : 'pt') ?? ''}
              alt={isEn ? meta.tituloEn : meta.tituloPt}
              className={`w-full aspect-[2/3] object-cover rounded-[10px] shadow-2xl border ${corBorda}`}
            />
          ) : (
            <div className={`aspect-[2/3] rounded-[10px] shadow-2xl border ${corBorda} bg-terra-2 flex flex-col items-center justify-center px-6 text-center`}>
              <p className={`text-[0.6rem] tracking-[0.3em] uppercase ${corTexto} opacity-70 mb-4`}>véspera</p>
              <p className="font-serif font-light text-creme text-2xl leading-snug mb-4">
                {isEn ? meta.tituloEn : meta.tituloPt}
              </p>
              <p className="text-[0.66rem] tracking-[0.24em] uppercase text-creme-2/50">Vivianne dos Santos</p>
            </div>
          )}
        </div>
        <div className="text-center md:text-left">
          <p className={`text-[0.7rem] tracking-[0.32em] uppercase ${corTexto} mb-3`}>
            {isEn ? meta.serieLabel.en : meta.serieLabel.pt}
          </p>
          <h1 className="font-serif font-light text-creme text-4xl md:text-5xl leading-[1.1] mb-4">
            {isEn ? meta.tituloEn : meta.tituloPt}
          </h1>
          <p className="font-serif italic text-creme-2/80 text-lg leading-relaxed mb-5">
            {isEn ? meta.pitchEn : meta.pitchPt}
          </p>
          <p className="text-creme-2/60 text-[0.9rem]">
            {isEn
              ? (pronto
                  ? 'A novel · 12 chapters, complete. Read the first one below; the whole book is in the shop.'
                  : 'A novel · 12 chapters, complete. Read the first one below. The full book is coming to the shop very soon.')
              : (pronto
                  ? 'Um romance · 12 capítulos, terminado. Lê o primeiro aqui em baixo; o livro inteiro está na loja.'
                  : 'Um romance · 12 capítulos, terminado. Lê o primeiro aqui em baixo. O livro inteiro chega à loja em breve.')}
          </p>
        </div>
      </section>

      <section className="max-w-[680px] mx-auto px-6 pb-12">
        <div className="bg-[#FFFDF9] text-[#3D2B1F] rounded-[14px] px-7 md:px-12 py-10 shadow-2xl">
          {isEn && !amostra.capituloEn && (
            <p className="text-center text-[0.78rem] text-[#9A5A43] font-serif italic mb-6">
              The English edition is on its way. Until then, the sample below is in the original Portuguese.
            </p>
          )}
          <p className="text-center text-[0.68rem] tracking-[0.3em] uppercase text-[#7D8A6A] mb-6">
            {isEn ? 'From the register of Véspera' : 'Do registo de Véspera'}
          </p>
          <div className="border-t border-b border-[#7D8A6A]/40 py-6 mb-10">
            {paragrafos(aAssentos).map((p, i) => (
              <p key={i} className="font-serif italic text-[0.92rem] leading-[1.75] text-[#6B5548] text-center mb-3 last:mb-0">{p}</p>
            ))}
          </div>
          <p className="text-center text-[0.68rem] tracking-[0.3em] uppercase text-[#7D8A6A] mb-2">
            {isEn ? 'chapter one' : 'capítulo um'}
          </p>
          <h2 className="font-serif italic text-center text-[#8C4A36] text-2xl mb-8">{aTitulo}</h2>
          <div className="font-serif text-[1.02rem] leading-[1.85]">
            {paragrafos(aCapitulo).map((p, i) => (
              <p key={i} className="mb-4 text-justify" style={{ hyphens: 'auto' }}>{p}</p>
            ))}
          </div>
          <p className="text-center text-[#9A5A43] mt-8 font-serif italic">
            {isEn ? '· end of the sample ·' : '· fim da amostra ·'}
          </p>
        </div>
      </section>

      <RomanceCompra slug={rom} locale={locale} pronto={pronto} />
    </main>
  );
}
