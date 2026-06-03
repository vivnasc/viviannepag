import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
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
        bordeaux: '#8B2235',
        violeta: '#5A4A6A',
        rosa: '#E08496',
        lila: '#C9B6FA',
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
