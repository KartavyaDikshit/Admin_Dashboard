import { getReport } from '@/lib/data';
import { getDictionary } from '@/i18n/dictionaries';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ReportView from '@/components/ReportView';
import { generateBreadcrumbSchema } from '@/lib/utils';

type Props = {
  params: Promise<{ lang: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const report = await getReport(slug, lang);

  if (!report) {
    return {
      title: 'Report Not Found',
    };
  }

  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.brainyinsights.com';
  // Always use dynamic canonical URL to ensure correct locale is used
  // This overrides potentially incorrect hardcoded URLs in the database
  const canonicalUrl = `${siteUrl}/${lang}/reports/${slug}`;

  // Construct hreflang alternates
  const localesList = ['en', 'de', 'fr', 'it', 'ja', 'ko', 'es'];
  const languageAlternates: Record<string, string> = {};
  localesList.forEach(locale => {
    languageAlternates[locale] = `${siteUrl}/${locale}/reports/${slug}`;
  });
  languageAlternates['x-default'] = `${siteUrl}/en/reports/${slug}`;

  // Combine all keywords for better SEO
  const allKeywords = [
    ...(report.keywords || []),
    ...(report.semanticKeywords || []),
    ...(report.competitorKeywords || []),
    ...(report.trendingKeywords || []),
    ...(report.longTailKeywords || []),
    ...(report.industryTags || [])
  ].filter((v, i, a) => a.indexOf(v) === i);

  return {
    title: report.metaTitle || report.title,
    description: report.metaDescription || report.summary || report.description?.substring(0, 160) || '',
    keywords: report.keywords || [],
    authors: [{ name: 'The Brainy Insights' }],
    publisher: 'The Brainy Insights',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
    },
    openGraph: {
      title: report.ogTitle || report.metaTitle || report.title,
      description: report.ogDescription || report.metaDescription || report.summary || report.description,
      type: 'article',
      url: canonicalUrl,
      publishedTime: report.publishedDate.toISOString(),
      modifiedTime: report.updatedAt.toISOString(),
      images: [
        {
          url: report.ogImage || report.imageUrl || '/logo.png',
          width: 1200,
          height: 630,
          alt: report.title,
        }
      ],
      siteName: 'The Brainy Insights',
      locale: lang,
    },
    twitter: {
      card: 'summary_large_image',
      title: report.twitterTitle || report.ogTitle || report.metaTitle || report.title,
      description: report.twitterDescription || report.ogDescription || report.metaDescription || report.summary || report.description,
      images: [report.ogImage || report.imageUrl || '/logo.png'],
      site: '@thebrainyinsight',
      creator: '@thebrainyinsight',
    },
    other: {
      'article:publisher': 'https://www.facebook.com/thebrainyinsights',
      'article:section': report.industryTags?.[0] || 'Market Research',
      'report-id': report.reportId || report.sku || '',
    }
  };
}

export default async function ReportDetailPage({ params }: Props) {
  const { lang, slug } = await params;
  const dict = getDictionary(lang);
  const report = await getReport(slug, lang);

  if (!report) {
    notFound();
  }

  // Helper to serialize data for Client Component (handling BigInt and Date)
  const safeSerialize = (obj: any) => {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value
    ));
  };

  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.brainyinsights.com';
  
  // Patch schemaMarkup and other fields to include correct locale and streamlined image URLs
  const localizedReportUrl = `${siteUrl}/${lang}/reports/${report.slug}`;
  const streamlinedImageUrl = `${siteUrl}/upload/${report.slug}.jpg`;

  const patchSchema = (schema: any) => {
    if (!schema || typeof schema !== 'object') return schema;
    
    if (Array.isArray(schema)) {
      return schema.map(item => patchSchema(item));
    }

    const patched = { ...schema };
    
    // Patch any URL property that looks like a report URL or is the main url property
    if (patched.url && typeof patched.url === 'string') {
      patched.url = localizedReportUrl;
    }
    if (patched['@id'] && typeof patched['@id'] === 'string' && patched['@id'].includes(report.slug)) {
      patched['@id'] = localizedReportUrl;
    }
    if (patched.image && typeof patched.image === 'string' && (patched.image.includes('/upload/') || patched.image.includes('vercel-storage'))) {
      patched.image = streamlinedImageUrl;
    }
    
    if (patched.mainEntityOfPage && typeof patched.mainEntityOfPage === 'object') {
       patched.mainEntityOfPage = { ...patched.mainEntityOfPage };
       patched.mainEntityOfPage['@id'] = localizedReportUrl;
       if (patched.mainEntityOfPage.url) {
         patched.mainEntityOfPage.url = localizedReportUrl;
       }
    }
    
    // Recursively patch other objects
    for (const key in patched) {
      if (typeof patched[key] === 'object' && key !== 'mainEntityOfPage') {
        patched[key] = patchSchema(patched[key]);
      }
    }
    
    return patched;
  };

  if (report.schemaMarkup) {
    report.schemaMarkup = patchSchema(report.schemaMarkup);
  }

  if (report.faqData) {
    report.faqData = patchSchema(report.faqData);
  }
  
  // Also ensure report top-level fields are streamlined
  report.ogImage = streamlinedImageUrl;
  report.twitterImage = streamlinedImageUrl;

  const serializedReport = safeSerialize(report);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: dict.home || 'Home', item: `${siteUrl}/${lang}` },
    { name: dict.reports || 'Reports', item: `${siteUrl}/${lang}/reports` },
    { name: report.title, item: `${siteUrl}/${lang}/reports/${report.slug}` }
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {report.schemaMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(report.schemaMarkup) }}
        />
      )}
      {report.faqData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(report.faqData) }}
        />
      )}
      <ReportView report={serializedReport} lang={lang} dict={dict} />
    </>
  );
}
