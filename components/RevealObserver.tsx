'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Revela os elementos .rv ao entrarem no ecra. Corre em cada navegacao
// (usePathname) — antes era um script inline que so corria no 1o load, por
// isso ao navegar client-side para a home o conteudo abaixo da hero ficava
// invisivel ate um refresh. Tem fallback que garante que nada fica escondido.
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    const observar = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>('.rv:not(.in)'));
      els.forEach((el, i) => {
        el.style.transitionDelay = `${(i % 4) * 0.08}s`;
        io.observe(el);
      });
    };

    // Observa ja e de novo no proximo frame (os nos da nova rota podem ainda
    // nao estar todos montados no tick atual).
    observar();
    const raf = requestAnimationFrame(observar);

    // Rede de seguranca: passados 2,5s, mostra tudo o que sobrou.
    const t = setTimeout(() => {
      document.querySelectorAll('.rv:not(.in)').forEach((el) => el.classList.add('in'));
    }, 2500);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [pathname]);

  return null;
}
