import { setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { TopNav } from '@/components/TopNav';
import { LangToggle } from '@/components/LangToggle';
import { Footer } from '@/components/home/Footer';
import { BotaoCompra } from '@/components/BotaoCompra';
import { GotaAssina } from '@/components/icons/GotaAssina';
import { getManual, AUTORA } from '@/lib/livros';
import { notFound } from 'next/navigation';

// Página de venda escrita para quem AINDA não acredita no Método VS. Fala
// primeiro a linguagem da pessoa (a dor nas palavras dela), diz cedo o que é e
// o que recebe, mostra o que muda na vida (concreto), e só depois entra a
// metáfora, já como reconhecimento e não como poesia.
export async function LivroVenda({ slug, locale }: { slug: string; locale: string }) {
  setRequestLocale(locale);
  const m = getManual(slug);
  if (!m) notFound();
  const isEn = locale === 'en';
  const livroHref = isEn ? '/en/os-sete-veus' : '/os-sete-veus';
  const grad = `linear-gradient(168deg, ${m.cor.topo}, ${m.cor.baixo})`;

  // A capa composta (imagem escolhida + tipografia), publicada pelo render.
  // Se ainda não existir, cai no cartão tipográfico.
  const SUPA = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
  const capaImg = `${SUPA}/storage/v1/object/public/viviannepag-assets/livro-pilar/${m.slug}/capa-composta.png`;
  let mostrarCapa = false;
  if (SUPA) {
    try { mostrarCapa = (await fetch(capaImg, { method: 'HEAD', cache: 'no-store' })).ok; } catch { /* fica o cartão */ }
  }

  const recebes = isEn
    ? ['Manual in PDF, immediate', `5-step protocol ${m.protocoloParaEn}`, 'Daily exercises', 'Guided 7-day crossing', 'Pocket summary card to keep with you']
    : ['Manual em PDF, imediato', `Protocolo de 5 passos ${m.protocoloPara}`, 'Exercícios diários', 'Travessia guiada de 7 dias', 'Cartão-resumo para levares contigo'];

  const t = {
    selo: isEn ? 'Method VS · See and Release' : 'Método VS · Ver e Soltar',
    paraTiSe: isEn ? 'This manual is for you if…' : 'Este manual é para ti se…',
    clareza: isEn
      ? 'A PDF manual with a protocol to use day to day. €9.'
      : 'Um manual em PDF, com um protocolo para usar no dia a dia. €9.',
    recebes: isEn ? 'What you get' : 'O que recebes',
    muda: isEn ? 'What changes' : 'O que muda',
    mudaSub: isEn ? 'After practising the method:' : 'Depois de praticares o método:',
    saida: isEn ? 'But there is a way out' : 'Mas há uma saída',
    porDentro: isEn ? 'The method, inside' : 'O método, por dentro',
    protocoloLock: isEn ? 'The five steps, one by one, are in the manual.' : 'Os cinco passos, um a um, estão no manual.',
    autora: isEn ? 'Who writes this' : 'Quem escreve',
    comprarTit: isEn ? 'Take the method home' : 'Leva o método contigo',
    pdf: isEn ? 'Immediate PDF, yours forever.' : 'PDF imediato, teu para sempre.',
    mapa: isEn
      ? <>One of three movements: See, Come back, Live. The whole map is in <a href={livroHref} className="text-ambar no-underline border-b border-ambar/40">The Seven Veils</a>.</>
      : <>Um de três movimentos: Ver, Vir, Viver. O mapa inteiro está em <a href={livroHref} className="text-ambar no-underline border-b border-ambar/40">Os Sete Véus</a>.</>,
  };

  return (
    <>
      <TopNav />
      <LangToggle />
      <div className="relative z-[2] max-w-wrap mx-auto px-7">

        {/* HERO — a linguagem da pessoa: a dor, o reconhecimento, o que o método faz */}
        <header className="pt-24 pb-10">
          {mostrarCapa ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${capaImg}?v=${Date.now()}`}
              alt={m.marca}
              className="w-[230px] h-auto mx-auto mb-9 rounded-[14px] block border border-ocre"
              style={{ boxShadow: '0 24px 70px -24px rgba(0,0,0,0.7)', aspectRatio: '1400 / 1873' }}
            />
          ) : (
            <div
              className="w-[200px] h-[267px] mx-auto mb-9 rounded-[14px] border border-ocre/30 flex flex-col items-center justify-center text-center px-6"
              style={{ background: grad, boxShadow: '0 24px 70px -24px rgba(0,0,0,0.7)' }}
            >
              <p className="font-sans text-[0.55rem] tracking-[0.3em] uppercase text-[#E6CE8E]/90 mb-3">{t.selo}</p>
              <p className="font-serif text-creme text-[1.7rem] leading-none">{m.marca}</p>
              <p className="font-serif italic text-creme-2/80 text-[0.8rem] mt-2">{m.movimento}</p>
            </div>
          )}
          <p className="font-sans text-[0.7rem] tracking-[0.34em] uppercase text-salvia mb-3 text-center">{t.selo}</p>
          <h1 className="font-serif font-light text-[clamp(2.1rem,6vw,3.2rem)] leading-[1.08] text-creme text-center">{isEn ? m.dorTituloEn : m.dorTitulo}</h1>

          {/* "Este manual é para ti se…" — reconhecimento imediato, em destaque */}
          <div className="max-w-[480px] mx-auto mt-9 rounded-[16px] border border-ambar/30 bg-ambar/5 p-6 text-left">
            <p className="font-sans text-[0.7rem] tracking-[0.2em] uppercase text-ambar mb-4">{t.paraTiSe}</p>
            <ul className="space-y-2.5">
              {(isEn ? m.sintomasEn : m.sintomas).map((s, i) => (
                <li key={i} className="flex gap-3 text-creme-2 text-[1.02rem] leading-[1.55]">
                  <span className="text-ambar mt-0.5">·</span><span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="max-w-[560px] mx-auto mt-8 text-center font-serif text-creme text-[1.12rem] leading-[1.7]">
            {isEn ? m.comoFuncionaEn : m.comoFunciona}
          </p>
          <p className="text-center text-creme-2/55 text-[0.9rem] mt-4">{t.clareza}</p>

          <div className="mt-8 text-center">
            <BotaoCompra slug={m.slug} locale={locale} titulo={m.marca} preco={m.preco} />
            <p className="text-creme-2/55 text-[0.82rem] mt-3">{t.pdf}</p>
          </div>
        </header>

        <div className="veu my-12" />

        {/* O QUE RECEBES — cedo, concreto */}
        <section className="max-w-[520px] mx-auto my-10">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-6 text-center">{t.recebes}</p>
          <ul className="space-y-3">
            {recebes.map((r, i) => (
              <li key={i} className="flex gap-3 items-baseline text-creme text-[1.04rem] leading-[1.55]">
                <span className="text-ambar text-[0.95rem] shrink-0">✓</span><span>{r}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="veu my-12" />

        {/* O QUE MUDA — a transformação concreta */}
        <section className="max-w-[560px] mx-auto my-10">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-2 text-center">{t.muda}</p>
          <p className="text-creme-2/70 text-[0.95rem] text-center mb-6 font-serif italic">{t.mudaSub}</p>
          <ul className="space-y-3">
            {(isEn ? m.mudancasEn : m.mudancas).map((p, i) => (
              <li key={i} className="flex gap-3 text-creme-2 text-[1.04rem] leading-[1.6]">
                <span className="text-ambar/80 mt-0.5">→</span><span>{p}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="veu my-12" />

        {/* A METÁFORA — agora, já como reconhecimento e não como abertura */}
        <section className="max-w-[620px] mx-auto my-10 text-center">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-6">{t.saida}</p>
          <div className="font-serif font-light text-creme-2 text-[1.1rem] leading-[1.9] space-y-4">
            {(isEn ? m.amostraEn : m.amostra).map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <GotaAssina className="w-[52px] h-[52px] mx-auto mt-8 opacity-95 block" />
        </section>

        <div className="veu my-12" />

        {/* O MÉTODO POR DENTRO — o protocolo (sem o entregar) */}
        <section className="max-w-[600px] mx-auto my-10">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-5 text-center">{t.porDentro}</p>
          <div className="rounded-[16px] border border-ocre/20 p-6" style={{ background: grad }}>
            <p className="font-serif text-creme text-[1.15rem]">{m.protocoloNome}</p>
            <div className="flex gap-2.5 my-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className="w-8 h-8 rounded-full border border-ambar/40 text-ambar/85 text-[0.82rem] flex items-center justify-center font-serif">{n}</span>
              ))}
            </div>
            <p className="text-creme-2/85 text-[0.98rem] leading-[1.75]">{isEn ? m.protocoloFormaEn : m.protocoloForma}</p>
            <p className="text-ambar/80 text-[0.82rem] italic font-serif mt-4">{t.protocoloLock}</p>
          </div>
        </section>

        <div className="veu my-12" />

        {/* QUEM ESCREVE */}
        <section className="max-w-[640px] mx-auto my-10 grid grid-cols-[120px_1fr] gap-7 items-center max-[520px]:grid-cols-1 max-[520px]:text-center max-[520px]:gap-5">
          <Image
            src="/vivianne-2.jpg"
            alt={AUTORA.nome}
            width={1024}
            height={1280}
            className="w-[120px] h-[156px] object-cover rounded-[12px] border border-ocre/30 max-[520px]:mx-auto"
            style={{ objectPosition: '50% 22%' }}
          />
          <div>
            <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">{t.autora}</p>
            <p className="font-serif text-creme text-[1.2rem] mb-2">{AUTORA.nome}</p>
            <p className="text-creme-2/80 text-[0.96rem] leading-[1.7]">{isEn ? AUTORA.bioEn : AUTORA.bio}</p>
          </div>
        </section>

        <div className="veu my-12" />

        {/* COMPRA */}
        <section className="max-w-[440px] mx-auto my-10 text-center">
          <h2 className="font-serif font-light text-creme text-[clamp(1.5rem,5vw,2rem)] mb-3">{t.comprarTit}</h2>
          <ul className="text-left inline-block space-y-1.5 mb-6">
            {recebes.map((r, i) => (
              <li key={i} className="flex gap-2.5 items-baseline text-creme-2/85 text-[0.92rem]"><span className="text-ambar">✓</span>{r}</li>
            ))}
          </ul>
          <p className="text-ambar/90 text-[1.4rem] font-serif mb-6">{m.preco}</p>
          <BotaoCompra slug={m.slug} locale={locale} titulo={m.marca} preco={m.preco} />
        </section>

        <p className="max-w-[600px] mx-auto pb-2 text-center text-creme-2/55 text-[0.88rem] font-serif">{t.mapa}</p>

        <div className="veu my-14" />
        <Footer />
      </div>
    </>
  );
}
