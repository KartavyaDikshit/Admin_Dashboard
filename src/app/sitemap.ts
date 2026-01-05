import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const locales = ['en', 'de', 'fr', 'it', 'ja', 'ko', 'es'];
const baseUrl = process.env.NEXTAUTH_URL || 'https://thebrainyinsights.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
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

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Add static routes for each locale
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

  // Add dynamic reports
  try {
    const reports = await prisma.report.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });

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

  // Add dynamic categories
  try {
    const categories = await prisma.category.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });

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

  // Add dynamic press releases
  try {
    const pressReleases = await prisma.pressRelease.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });

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

  return sitemapEntries;
}
