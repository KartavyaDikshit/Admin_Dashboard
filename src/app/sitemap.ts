import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const locales = ['en', 'de', 'fr', 'it', 'ja', 'ko', 'es'];
const baseUrl = process.env.NEXTAUTH_URL || 'https://thebrainyinsights.com';

export async function generateSitemaps() {
  return [{ id: 'static' }, { id: 'dynamic' }];
}

export default async function sitemap({ id }: { id: string | Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const sitemapId = await id;
  console.log(`Generating sitemap for id: ${sitemapId}`);
  const sitemapEntries: MetadataRoute.Sitemap = [];

  if (sitemapId === 'static') {
    console.log('Generating static sitemap entries...');
    const staticRoutes = [
      '',
      '/about',
      '/contact',
      '/services',
      '/reports',
      '/categories',
      '/press-releases',
      '/privacy-policy',
      '/terms-conditions',
    ];

    for (const locale of locales) {
      for (const route of staticRoutes) {
        sitemapEntries.push({
          url: `${baseUrl}/${locale}${route}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: route === '' ? 1 : 0.8,
        });
      }
    }
  } else if (sitemapId === 'dynamic') {
    console.log('Generating dynamic sitemap entries...');
    // Calculate limit per entity type to stay under ~1000 links total
    // We have 7 locales. Max 1000 links / 7 ~= 142 items total.
    // Let's allocate: 100 Reports, 20 Categories, 20 PRs.
    
    try {
      const reports = await prisma.report.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 100,
      });
      console.log(`Found ${reports.length} reports`);

      for (const locale of locales) {
        for (const report of reports) {
          sitemapEntries.push({
            url: `${baseUrl}/${locale}/reports/${report.slug}`,
            lastModified: report.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching reports for sitemap:', error);
    }

    try {
      const categories = await prisma.category.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      });
      console.log(`Found ${categories.length} categories`);

      for (const locale of locales) {
        for (const category of categories) {
          sitemapEntries.push({
            url: `${baseUrl}/${locale}/categories/${category.slug}`,
            lastModified: category.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.6,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching categories for sitemap:', error);
    }

    try {
      const pressReleases = await prisma.pressRelease.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      });
      console.log(`Found ${pressReleases.length} press releases`);

      for (const locale of locales) {
        for (const pr of pressReleases) {
          sitemapEntries.push({
            url: `${baseUrl}/${locale}/press-releases/${pr.slug}`,
            lastModified: pr.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.5,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching press releases for sitemap:', error);
    }
  }

  console.log(`Generated ${sitemapEntries.length} entries for id: ${sitemapId}`);
  return sitemapEntries;
}