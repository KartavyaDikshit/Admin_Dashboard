import Link from 'next/link';
import { getDictionary } from '@/i18n/dictionaries';
import { getPressRelease } from '@/lib/data';
import { notFound } from 'next/navigation';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ lang: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const pressRelease = await getPressRelease(slug, lang);

  if (!pressRelease) {
    return { title: 'Press Release Not Found' };
  }

  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.thebrainyinsights.com';
  const canonicalUrl = `${siteUrl}/${lang}/press-releases/${slug}`;

  return {
    title: pressRelease.title,
    description: pressRelease.description.substring(0, 160),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pressRelease.title,
      description: pressRelease.description.substring(0, 160),
      url: canonicalUrl,
      type: 'article',
      siteName: 'The Brainy Insights',
      publishedTime: pressRelease.publishedAt?.toISOString() || pressRelease.createdAt.toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: pressRelease.title,
      description: pressRelease.description.substring(0, 160),
      site: '@thebrainyinsight',
    }
  };
}

export default async function PressReleaseDetail({ params }: Props) {
  const { lang, slug } = await params;
  const dict = getDictionary(lang);
  const pressRelease = await getPressRelease(slug, lang);

  if (!pressRelease) {
    notFound();
  }

  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.thebrainyinsights.com';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: dict.home || 'Home', item: `${siteUrl}/${lang}` },
    { name: 'Press Releases', item: `${siteUrl}/${lang}/press-releases` },
    { name: pressRelease.title, item: `${siteUrl}/${lang}/press-releases/${slug}` }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <section className="hero-section py-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-indigo-700/95 to-purple-800/90"></div>
          <div className="hero-overlay-pattern"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <nav className="flex justify-center mb-8 text-sm text-indigo-200">
            <Link href={`/${lang}`} className="hover:text-white transition-colors">{dict.home}</Link>
            <span className="mx-2">/</span>
            <Link href={`/${lang}/press-releases`} className="hover:text-white transition-colors">Press Releases</Link>
            <span className="mx-2">/</span>
            <span className="text-white truncate max-w-[200px]">{pressRelease.title}</span>
          </nav>
          
          <h1 className="hero-title">
            {pressRelease.title}
          </h1>
          
          <div className="flex items-center justify-center gap-2 text-indigo-100 text-sm">
            <CalendarIcon className="h-4 w-4" />
            <time dateTime={pressRelease.publishedAt ? new Date(pressRelease.publishedAt).toISOString() : new Date(pressRelease.createdAt).toISOString()}>
              {formatDate(new Date(pressRelease.publishedAt || pressRelease.createdAt))}
            </time>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-4xl px-4">
          {/<[a-z][\s\S]*>/i.test(pressRelease.description) ? (
            <div 
              className="prose max-w-none text-gray-700 leading-relaxed text-justify text-lg"
              dangerouslySetInnerHTML={{ __html: pressRelease.description }}
            />
          ) : (
            <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line text-lg text-justify">
              {pressRelease.description}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
