import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const revalidate = 3600; // Revalidate every hour

const locales = ['en', 'de', 'fr', 'it', 'ja', 'ko', 'es'];
const baseUrl = process.env.NEXTAUTH_URL || 'https://www.brainyinsights.com';
const ITEMS_PER_SITEMAP = 1000;

export async function generateSitemaps() {
  // Calculate total items to determine how many sitemaps we need
  const [reportCount, prCount] = await Promise.all([
    prisma.report.count({ where: { status: 'PUBLISHED' } }),
    prisma.pressRelease.count({ where: { published: true } })
  ]);

  const totalItems = (reportCount + prCount) * locales.length;
  const totalChunks = Math.ceil(totalItems / ITEMS_PER_SITEMAP);

  const sitemaps = [{ id: 'static' }];
  
  for (let i = 0; i < totalChunks; i++) {
    sitemaps.push({ id: `dynamic-${i}` });
  }

  return sitemaps;
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
      '/research-methodology', // Added new page
      '/faqs', // Added new page
    ];

    // Fetch all categories for the static sitemap
    const categories = await prisma.category.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });

    for (const locale of locales) {
      for (const route of staticRoutes) {
        sitemapEntries.push({
          url: `${baseUrl}/${locale}${route}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: route === '' ? 1 : 0.8,
        });
      }

      // Add categories to static sitemap
      for (const category of categories) {
        sitemapEntries.push({
          url: `${baseUrl}/${locale}/categories/${category.slug}`,
          lastModified: category.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    }
  } else if (sitemapId.startsWith('dynamic-')) {
    const chunkIndex = parseInt(sitemapId.split('-')[1], 10);
    const offset = chunkIndex * ITEMS_PER_SITEMAP;
    
    // We need to distribute the skip/take logic across the different entities.
    // This is a bit complex because we are flattening multiple tables * locales into one list.
    // Simplified strategy: We will fetch chunks of entities and then map them to locales.
    // Each entity produces N entries (where N = locales.length).
    // So we effectively can handle ITEMS_PER_SITEMAP / 7 entities per chunk.
    
    const entitiesPerChunk = Math.floor(ITEMS_PER_SITEMAP / locales.length);
    const entityOffset = chunkIndex * entitiesPerChunk;
    
    console.log(`Generating dynamic sitemap chunk ${chunkIndex}. Entity Offset: ${entityOffset}, Limit: ${entitiesPerChunk}`);

    try {
      // 1. Reports
      const reportCount = await prisma.report.count({ where: { status: 'PUBLISHED' } });
      
      if (entityOffset < reportCount) {
          const reports = await prisma.report.findMany({
            where: { status: 'PUBLISHED' },
            select: { slug: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
            skip: entityOffset,
            take: entitiesPerChunk,
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
      }

      // Calculate remaining slots and offset for Categories
      // If we filled the chunk with reports, we stop.
      // If we exhausted reports, we move to categories.
      
      // Effective items pushed so far = reports.length * locales.length.
      // This simple logic assumes we just paginate through types sequentially based on the global entity index.
      
      let currentEntityIndex = entityOffset;
      let itemsRemaining = entitiesPerChunk; // Target entities to fetch
      
      // Adjust based on what we fetched from reports
      if (currentEntityIndex < reportCount) {
          // We fetched some reports.
          // If we fetched the full 'take' amount, we are done for this chunk.
          // If we fetched less, it means we ran out of reports and need to fill with categories.
           const fetchedReportsCount = Math.min(itemsRemaining, Math.max(0, reportCount - currentEntityIndex));
           itemsRemaining -= fetchedReportsCount;
           currentEntityIndex += fetchedReportsCount; // Move the global index pointer
      } else {
          // We are past reports, so the "report part" of this chunk is 0
      }

      // 2. Press Releases (shifted up since Categories are gone)
      const prCount = await prisma.pressRelease.count({ where: { published: true } });
      // Offset relative to PR table: (Current Index - Reports Count)
      // If we are still processing reports (currentEntityIndex < reportCount), prOffset is negative, handled by max(0)
      const prOffset = Math.max(0, currentEntityIndex - reportCount);

      if (itemsRemaining > 0 && prOffset < prCount) {
          const pressReleases = await prisma.pressRelease.findMany({
            where: { published: true },
            select: { slug: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
            skip: prOffset,
            take: itemsRemaining,
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
      }

    } catch (error) {
      console.error('Error fetching data for sitemap:', error);
    }
  }

  console.log(`Generated ${sitemapEntries.length} entries for id: ${sitemapId}`);
  return sitemapEntries;
}