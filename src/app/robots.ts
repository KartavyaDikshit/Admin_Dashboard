import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXTAUTH_URL || 'https://www.fiormarkets.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: [`${baseUrl}/sitemap/static.xml`, `${baseUrl}/sitemap/dynamic-0.xml`],
  };
}