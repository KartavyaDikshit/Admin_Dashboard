import { Metadata } from 'next';
import PublicHeader from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  
  return {
    title: {
      template: '%s | The Brainy Insights',
      default: 'Global Market Research Reports & Consulting | The Brainy Insights',
    },
    description: 'The Brainy Insights offers top-notch market research reports and consulting services. Gain actionable insights and competitive analysis for your business.',
    openGraph: {
      type: 'website',
      locale: lang,
      siteName: 'The Brainy Insights',
      images: [
        {
            url: '/og-image.jpg', // Assuming you'd have a default OG image
            width: 1200,
            height: 630,
            alt: 'The Brainy Insights',
        }
      ]
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
  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900">
      <PublicHeader lang={lang} />
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
      <Footer lang={lang} />
    </div>
  );
}
