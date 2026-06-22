import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    // lib guarda classes de cor (colecoes.ts, biblioteca.ts); sem isto o JIT não as gera
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        terra: {
          DEFAULT: '#2A1C12',
          2: '#3A2818',
        },
        creme: {
          DEFAULT: '#F2E8DC',
          2: '#E5D5C3',
        },
        ocre: '#B8843D',
        ambar: '#EBAE4A',
        ouro: '#D49A3A',
        // índigo · a cor da veu.a.veu no admin (planear + criar) — decisão da Vivianne,
        // para não partilhar a família roxa da Soulab (que é lilás).
        indigo: '#818CF8',
        bordeaux: {
          DEFAULT: '#8B2235',
          // versão legível como texto sobre o castanho escuro
          claro: '#C8657A',
        },
        violeta: '#5A4A6A',
        rosa: '#E08496',
        lila: '#C9B6FA',
        salvia: '#9CAD8D',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        wrap: '760px',
        leitura: '680px',
      },
    },
  },
  plugins: [],
};

export default config;
