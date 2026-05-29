import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'render-slide',
  robots: { index: false, follow: false },
};

export default function RenderSlideLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body style={{ margin: 0, padding: 0, background: '#111', overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}
