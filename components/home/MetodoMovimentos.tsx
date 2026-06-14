import Link from 'next/link';
import { MANUAIS } from '@/lib/livros';
import { VerSoltarMark, VirSoltarMark, ViverSoltarMark } from '@/components/icons/SocialMarks';

// "Por onde começar?" — escrito para quem chega de um reel sobre ansiedade,
// culpa ou exaustão, e ainda está na dor. Lidera a pergunta que a pessoa faz a
// si própria (a língua da dor), não "Ver/Vir/Viver" nem "a consciência" (língua
// interna do método). A marca aparece como a porta a seguir, e a seguir o que
// ela aprende. O símbolo distingue cada um.

const MARKS: Record<string, () => React.JSX.Element> = {
  'ver-soltar': VerSoltarMark,
  'vir-soltar': VirSoltarMark,
  'viver-soltar': ViverSoltarMark,
};

export function MetodoMovimentos({ locale }: { locale: string }) {
  const isEn = locale === 'en';
  const base = isEn ? '/en' : '';

  return (
    <section className="my-4">
      <p className="rv text-center font-sans text-[0.72rem] tracking-[0.32em] uppercase text-ocre mb-3">
        {isEn ? 'Method VS · See and Release' : 'Método VS · Ver e Soltar'}
      </p>
      <h2 className="rv text-center font-serif font-light text-creme text-[clamp(1.7rem,5vw,2.4rem)] leading-[1.2] mb-3">
        {isEn ? 'Where do you recognise yourself?' : 'Onde te reconheces?'}
      </h2>
      <p className="rv text-center text-creme-2/70 max-w-[540px] mx-auto mb-12 text-[1.02rem] leading-relaxed">
        {isEn
          ? 'Start with the pain you recognise. Each door is a short method, in PDF, to use, with its own protocol.'
          : 'Começa pela dor que reconheces. Cada porta é um método curto, em PDF, para usar, com o seu protocolo.'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-[940px] mx-auto">
        {MANUAIS.map((m) => {
          const Mark = MARKS[m.slug];
          return (
            <Link
              key={m.slug}
              href={`${base}/${m.slug}`}
              className="rv group flex flex-col no-underline rounded-[18px] border border-ocre/20 bg-creme/[0.03] hover:bg-creme/[0.05] hover:border-ambar/40 transition-colors p-7"
            >
              <div className="w-10 h-10 mb-5 opacity-90 [&_svg]:w-10 [&_svg]:h-10">
                <Mark />
              </div>
              <h3 className="font-serif font-light text-creme text-[1.3rem] leading-[1.24] mb-4">
                {isEn ? m.dorTituloEn : m.dorTitulo}
              </h3>
              <ul className="space-y-1.5 mb-6 flex-1">
                {(isEn ? m.sintomasEn : m.sintomas).map((s, i) => (
                  <li key={i} className="flex gap-2 text-creme-2/75 text-[0.9rem] leading-[1.45]">
                    <span className="text-ambar/60">·</span><span>{s}</span>
                  </li>
                ))}
              </ul>
              <span className="font-serif text-ambar text-[1.05rem] group-hover:text-ocre transition-colors">
                {m.marca} →
              </span>
            </Link>
          );
        })}
      </div>

      <div className="rv text-center mt-12 flex flex-col items-center gap-3">
        <Link href={`${base}/diagnostico`} className="inline-block bg-ambar text-[#2A1C12] no-underline rounded-full px-7 py-3 text-[0.9rem] font-sans tracking-[0.02em] hover:bg-ocre transition-colors">
          {isEn ? 'Not sure which is yours? Take the diagnostic' : 'Não sabes qual é a tua? Faz o diagnóstico'}
        </Link>
        <Link href={`${base}/os-sete-veus`} className="font-sans text-[0.85rem] tracking-[0.04em] text-creme-2/70 no-underline border-b border-ocre/30 hover:text-ambar hover:border-ambar pb-0.5 transition-colors">
          {isEn ? 'The whole map: The Seven Veils' : 'O mapa inteiro: Os Sete Véus'}
        </Link>
      </div>
    </section>
  );
}
