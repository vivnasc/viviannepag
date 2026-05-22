import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vivianne dos Santos',
    short_name: 'Vivianne',
    description:
      'Vivo entre o silêncio e o movimento. Os caminhos: Infonte, SyncHim, Escola dos Véus, Sete Véus, Sete Ecos e Loranne.',
    start_url: '/',
    display: 'standalone',
    background_color: '#2A1C12',
    theme_color: '#2A1C12',
    lang: 'pt-PT',
    icons: [
      { src: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
