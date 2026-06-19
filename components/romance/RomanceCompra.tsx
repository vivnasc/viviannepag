// CTA do fim das landings dos romances. Enquanto o livro não estiver à venda
// (PDF renderizado → produto publicado), mostra "chega em breve" + a oferta do
// Amparo. Quando ficar pronto, mostra o botão que leva à loja, onde a compra e
// a entrega na hora correm pelo mesmo fluxo de toda a loja. Nada se vende antes
// de poder ser entregue, e acende-se livro a livro sem novo deploy.
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getRomance } from '@/lib/romances';
import { PRECO_ROMANCE } from '@/lib/romance-produto';

async function aVenda(slug: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('produtos')
      .select('publicado')
      .eq('slug', slug)
      .maybeSingle();
    return !!(data as { publicado?: boolean } | null)?.publicado;
  } catch {
    return false;
  }
}

export async function RomanceCompra({ slug, locale }: { slug: string; locale: string }) {
  const isEn = locale === 'en';
  const prefix = isEn ? '/en' : '';
  const r = getRomance(slug);
  const titulo = (isEn ? r?.tituloEn : r?.titulo) ?? '';
  const pronto = await aVenda(slug);

  const ctaBtn =
    'inline-block no-underline bg-ambar text-[#2A1F17] font-medium text-[0.95rem] tracking-wide rounded-full px-8 py-3 hover:opacity-90 transition-opacity';
  const bibliotecaLink = (
    <p className="mt-6">
      <Link href={`${prefix}/biblioteca`} className="text-creme-2/50 text-[0.85rem] no-underline hover:text-creme-2/80">
        {isEn ? '← the whole library' : '← a biblioteca inteira'}
      </Link>
    </p>
  );

  if (pronto) {
    return (
      <section className="max-w-[680px] mx-auto px-6 pb-20">
        <div className="border border-ambar/25 rounded-[14px] px-7 py-10 text-center">
          <p className="text-[0.7rem] tracking-[0.3em] uppercase text-ambar/90 mb-4">
            {isEn ? 'the whole book' : 'o livro inteiro'}
          </p>
          <p className="font-serif italic text-creme-2/85 text-lg leading-relaxed mb-2">
            {isEn
              ? `Twelve chapters, the whole crossing. ${titulo} is in the shop.`
              : `Doze capítulos, a travessia inteira. ${titulo} está na loja.`}
          </p>
          <p className="text-creme-2/60 text-[0.9rem] mb-7">
            {isEn
              ? 'Immediate PDF after payment, yours forever, with a 7-day guarantee.'
              : 'PDF imediato após o pagamento, teu para sempre, com garantia de 7 dias.'}
          </p>
          <Link href={`${prefix}/loja/${slug}`} className={ctaBtn}>
            {isEn ? `Read the whole book · ${PRECO_ROMANCE}` : `Ler o livro inteiro · ${PRECO_ROMANCE}`}
          </Link>
          {bibliotecaLink}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[680px] mx-auto px-6 pb-20">
      <div className="border border-ambar/25 rounded-[14px] px-7 py-10 text-center">
        <p className="text-[0.7rem] tracking-[0.3em] uppercase text-ambar/90 mb-4">
          {isEn ? 'the rest of the book' : 'o resto do livro'}
        </p>
        <p className="font-serif italic text-creme-2/85 text-lg leading-relaxed mb-6">
          {isEn
            ? 'The novel is finished: twelve chapters, the whole crossing. It is coming to the shop very soon.'
            : 'O romance está terminado: doze capítulos, a travessia inteira. Chega à loja muito em breve.'}
        </p>
        <p className="text-creme-2/60 text-[0.9rem] mb-8">
          {isEn ? (
            <>Meanwhile, the first novel of the library, <em>Amparo&rsquo;s Hands</em>, is a gift: the whole book, freely.</>
          ) : (
            <>Entretanto, o primeiro romance da biblioteca, <em>As Mãos de Amparo</em>, é oferta: o livro inteiro, sem pedir nada.</>
          )}
        </p>
        <Link href={`${prefix}/amparo`} className={ctaBtn}>
          {isEn ? "Read Amparo's Hands free" : 'Ler As Mãos de Amparo grátis'}
        </Link>
        {bibliotecaLink}
      </div>
    </section>
  );
}
