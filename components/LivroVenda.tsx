import { setRequestLocale } from 'next-intl/server';
import { TopNav } from '@/components/TopNav';
import { LangToggle } from '@/components/LangToggle';
import { Footer } from '@/components/home/Footer';
import { BotaoCompra } from '@/components/BotaoCompra';
import { GotaAssina, GotaMini } from '@/components/icons/GotaAssina';
import { getManual } from '@/lib/livros';
import { notFound } from 'next/navigation';

// Página de venda de um manual-filho (um movimento). Modelada na do pilar.
// Herói tipográfico (a capa-símbolo entra depois), promessa, amostra, compra,
// e o bónus do rascunho de bolso incluído.
export async function LivroVenda({ slug, locale }: { slug: string; locale: string }) {
  setRequestLocale(locale);
  const m = getManual(slug);
  if (!m) notFound();
  const isEn = locale === 'en';
  const livroHref = isEn ? '/en/os-sete-veus' : '/os-sete-veus';

  return (
    <>
      <TopNav />
      <LangToggle />
      <div className="relative z-[2] max-w-wrap mx-auto px-7">

        {/* HERO */}
        <header className="pt-24 pb-12 text-center">
          <div
            className="w-[260px] h-[347px] mx-auto mb-9 rounded-[14px] border border-ocre/30 flex flex-col items-center justify-center text-center px-6"
            style={{ background: `linear-gradient(168deg, ${m.cor.topo}, ${m.cor.baixo})`, boxShadow: '0 24px 70px -24px rgba(0,0,0,0.7)' }}
          >
            <p className="font-sans text-[0.6rem] tracking-[0.3em] uppercase text-[#E6CE8E]/90 mb-4">Método VS · Ver e Soltar</p>
            <p className="font-serif text-creme text-[2rem] leading-none">{m.marca}</p>
            <p className="font-serif italic text-creme-2/80 text-[0.85rem] mt-3">{isEn ? m.movimento : m.movimento}</p>
          </div>
          <p className="font-sans text-[0.7rem] tracking-[0.34em] uppercase text-salvia mb-3">
            {isEn ? 'Method VS · See and Release' : 'Método VS · Ver e Soltar'} · {m.cacho}
          </p>
          <h1 className="font-serif font-light text-[clamp(2.2rem,6vw,3.4rem)] leading-[1.05] text-creme">{m.marca}</h1>
          <p className="font-serif italic font-light text-ocre text-[clamp(1.05rem,3.4vw,1.35rem)] mt-4 leading-[1.4] max-w-[600px] mx-auto">
            {isEn ? m.promessaEn : m.promessa}
          </p>
          <GotaAssina className="w-[60px] h-[60px] mx-auto mt-8 opacity-95 block" />
          <p className="max-w-[560px] mx-auto mt-8 text-[1.05rem] leading-[1.85] text-creme-2">{isEn ? m.introEn : m.intro}</p>
        </header>

        <div className="veu my-14" />

        {/* AMOSTRA */}
        <section className="max-w-[620px] mx-auto my-10 text-center">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-6">{isEn ? 'A taste' : 'Uma amostra'}</p>
          <div className="font-serif font-light text-creme-2 text-[1.08rem] leading-[1.9] space-y-4">
            {(isEn ? m.amostraEn : m.amostra).map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <GotaMini className="w-[22px] h-[22px] mx-auto mt-8 opacity-60 block" />
        </section>

        <div className="veu my-14" />

        {/* COMPRA + BÓNUS */}
        <section className="max-w-[440px] mx-auto my-10 text-center">
          <h2 className="font-serif font-light text-creme text-[clamp(1.5rem,5vw,2rem)] mb-2">
            {isEn ? 'Take the method home' : 'Leva o método contigo'}
          </h2>
          <p className="text-creme-2/70 text-[0.92rem] leading-relaxed mb-2">
            {isEn
              ? `Immediate PDF. A real method, with its own protocol, practices and a seven-day path. After it, you are ${m.depoisEn}.`
              : `PDF imediato. Um método a sério, com protocolo próprio, práticas e um caminho de sete dias. Depois dele, ficas ${m.depois}.`}
          </p>
          <p className="text-ambar/90 text-[0.86rem] italic font-serif mb-7">
            {isEn ? '+ bonus: the pocket sheet, to keep nearby.' : '+ bónus: o rascunho de bolso, para teres por perto.'}
          </p>
          <BotaoCompra slug={m.slug} locale={locale} titulo={m.marca} preco={m.preco} />
        </section>

        <p className="max-w-[600px] mx-auto pb-2 text-center text-creme-2/55 text-[0.88rem] font-serif">
          {isEn
            ? <>One of three movements, See, Come, Live. The whole map is in <a href={livroHref} className="text-ambar no-underline border-b border-ambar/40">The Seven Veils</a>.</>
            : <>Um de três movimentos: Ver, Vir, Viver. O mapa inteiro está em <a href={livroHref} className="text-ambar no-underline border-b border-ambar/40">Os Sete Véus</a>.</>}
        </p>

        <div className="veu my-14" />
        <Footer />
      </div>
    </>
  );
}
