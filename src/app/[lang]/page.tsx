import { getDictionary } from '@/i18n/dictionaries';
import { getFeaturedCategories, getFeaturedReports, getTestimonials } from '@/lib/data';
import Hero from '@/components/new_ui/Hero';
import TrustedBy from '@/components/new_ui/TrustedBy';
import FeaturedCategories from '@/components/new_ui/FeaturedCategories';
import FeaturedReports from '@/components/new_ui/FeaturedReports';
import Testimonials from '@/components/new_ui/Testimonials';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang) as any;
  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.thebrainyinsights.com';

  return {
    title: dict.homeTitle || 'Global Market Research Reports & Consulting',
    description: dict.homeDesc || 'The Brainy Insights provides comprehensive market research reports, industry analysis, and consulting services to help businesses grow globally.',
    keywords: ['market research', 'consulting services', 'global market reports', 'industry analysis', 'business intelligence'],
    alternates: {
      canonical: `${siteUrl}/${lang}`,
    },
    openGraph: {
      title: dict.homeTitle || 'Global Market Research Reports & Consulting',
      description: dict.homeDescription || 'The Brainy Insights provides comprehensive market research reports, industry analysis, and consulting services.',
      url: `${siteUrl}/${lang}`,
      siteName: 'The Brainy Insights',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'The Brainy Insights',
        }
      ],
      locale: lang,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.homeTitle || 'Global Market Research Reports & Consulting',
      description: dict.homeDescription || 'The Brainy Insights provides comprehensive market research reports.',
      images: ['/og-image.jpg'],
      site: '@thebrainyinsight',
    },
  };
}

export default async function Home({ params }: Props) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.thebrainyinsights.com';
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "The Brainy Insights",
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "sameAs": [
      "https://www.linkedin.com/company/thebrainyinsights",
      "https://www.facebook.com/thebrainyinsights",
      "https://twitter.com/thebrainyinsight"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-315-215-1633",
      "contactType": "sales",
      "email": "sales@thebrainyinsights.com"
    }
  };

  const [categories, reports, testimonials] = await Promise.all([
    getFeaturedCategories(lang),
    getFeaturedReports(lang),
    getTestimonials()
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Hero dict={dict} lang={lang} />
      <TrustedBy dict={dict} />
      <FeaturedCategories categories={categories} dict={dict} lang={lang} />
      <FeaturedReports reports={reports} dict={dict} lang={lang} />
      <Testimonials testimonials={testimonials} dict={dict} />
    </div>
  );
}
