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
    description: dict.homeDescription || 'The Brainy Insights provides comprehensive market research reports, industry analysis, and consulting services to help businesses grow globally.',
    alternates: {
      canonical: `${siteUrl}/${lang}`,
    },
  };
}

export default async function Home({ params }: Props) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  
  const [categories, reports, testimonials] = await Promise.all([
    getFeaturedCategories(lang),
    getFeaturedReports(lang),
    getTestimonials()
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero dict={dict} lang={lang} />
      <TrustedBy dict={dict} />
      <FeaturedCategories categories={categories} dict={dict} lang={lang} />
      <FeaturedReports reports={reports} dict={dict} lang={lang} />
      <Testimonials testimonials={testimonials} dict={dict} />
    </div>
  );
}
