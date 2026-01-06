import { Metadata } from 'next';
import Header from '@/components/new_ui/Header';
import Footer from '@/components/new_ui/Footer';
import { getDictionary } from '@/i18n/dictionaries';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const baseUrl = process.env.NEXTAUTH_URL || 'https://www.thebrainyinsights.com';
  const locales = ['en', 'de', 'fr', 'it', 'ja', 'ko', 'es'];

  // Construct hreflang alternates
  const languageAlternates: Record<string, string> = {};
  locales.forEach(locale => {
    languageAlternates[locale] = `${baseUrl}/${locale}`;
  });
  
  return {
    title: {
      default: 'Global Market Research Reports & Consulting | The Brainy Insights',
    },
    description: 'The Brainy Insights offers top-notch market research reports and consulting services. Gain actionable insights and competitive analysis for your business.',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${lang}`,
      languages: languageAlternates,
    },
    openGraph: {
      type: 'website',
      locale: lang,
      siteName: 'The Brainy Insights',
      url: `${baseUrl}/${lang}`,
      images: [
        {
            url: '/og-image.jpg', // Assuming you'd have a default OG image
            width: 1200,
            height: 630,
            alt: 'The Brainy Insights',
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      site: '@thebrainyinsight',
      creator: '@thebrainyinsight',
    },
    keywords: ['market research', 'consulting services', 'global market reports', 'industry analysis', 'business intelligence'],
  };
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50">
      <Header dict={dict} lang={lang} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer dict={dict} lang={lang} />
    </div>
  );
}
