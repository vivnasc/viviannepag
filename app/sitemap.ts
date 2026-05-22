import type { MetadataRoute } from 'next';
import { listAllSlugs } from '@/lib/escritos';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://viviannedossantos.com';
  const now = new Date();

  const root = ['/', '/en', '/escritos', '/en/escritos'].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: path === '/' ? 1 : 0.7,
  }));

  const slugs = await listAllSlugs();
  const escritos = slugs.flatMap((slug) => [
    {
      url: `${base}/escritos/${slug}`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    },
    {
      url: `${base}/en/escritos/${slug}`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    },
  ]);

  return [...root, ...escritos];
}
