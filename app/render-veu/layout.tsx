import type { Metadata } from 'next';
import '../[locale]/globals.css';

export const metadata: Metadata = {
  title: 'render-veu',
  robots: { index: false, follow: false },
};

export default function RenderVeuLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body style={{ margin: 0, padding: 0, background: '#000', overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}
