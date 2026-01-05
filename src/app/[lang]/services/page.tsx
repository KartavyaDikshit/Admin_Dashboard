import Link from 'next/link';
import { getDictionary } from '@/i18n/dictionaries';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.thebrainyinsights.com';

  return {
    title: dict.services || 'Market Research Services',
    description: dict.servicesIntroDesc || 'Explore our comprehensive market research solutions, including strategic consulting and detailed market intelligence.',
    alternates: {
      canonical: `${siteUrl}/${lang}/services`,
    },
  };
}

export default async function Services({ params }: Props) {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return (
    <div className="min-h-screen">
      <section className="hero-section" style={{height: '323.75px'}}>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-indigo-700/95 to-purple-800/90"></div>
          <div className="hero-overlay-pattern"></div>
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute top-32 right-20 w-32 h-32 bg-purple-300/10 rounded-lg rotate-45 blur-lg"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-indigo-300/10 rounded-full blur-lg"></div>
          <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-white/5 rounded-lg rotate-12 blur-xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 via-transparent to-transparent"></div>
        </div>
        <div className="hero-container">
          <div className="text-center w-full">
            <h1 className="hero-title">
              <span className="block bg-gradient-to-r from-purple-300 to-indigo-200 bg-clip-text text-transparent">{dict.services}</span>
            </h1>
            <p className="hero-subtitle">{dict.servicesIntroDesc}</p>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-indigo-300 mx-auto rounded-full mt-6"></div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{dict.comprehensiveSolutionsTitle || 'Comprehensive Market Research Solutions'}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{dict.comprehensiveSolutionsDesc || 'From strategic consulting to detailed market intelligence, we provide the insights you need to make informed business decisions.'}</p>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{dict.service1Title}</h3>
              <p className="text-gray-600 leading-relaxed">{dict.service1Desc}</p>
            </div>
            <div className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{dict.service2Title}</h3>
              <p className="text-gray-600 leading-relaxed">{dict.service2Desc}</p>
            </div>
            <div className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{dict.service3Title}</h3>
              <p className="text-gray-600 leading-relaxed">{dict.service3Desc}</p>
            </div>
            <div className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{dict.service4Title}</h3>
              <p className="text-gray-600 leading-relaxed">{dict.service4Desc}</p>
            </div>
            <div className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{dict.service5Title}</h3>
              <p className="text-gray-600 leading-relaxed">{dict.service5Desc}</p>
            </div>
            <div className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{dict.service6Title}</h3>
              <p className="text-gray-600 leading-relaxed">{dict.service6Desc}</p>
            </div>
            <div className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{dict.service7Title}</h3>
              <p className="text-gray-600 leading-relaxed">{dict.service7Desc}</p>
            </div>
            <div className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{dict.service8Title}</h3>
              <p className="text-gray-600 leading-relaxed">{dict.service8Desc}</p>
            </div>
          </div>
          <div className="mt-16 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 border">
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">{dict.getExpertGuidanceTitle || 'Get Expert Guidance'}</h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">{dict.getExpertGuidanceDesc || 'Ready to leverage our expertise? Our specialists are here to help you with customized research solutions tailored to your needs.'}</p>
              <div className="flex justify-center">
                <Link href={`/${lang}/contact`} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-bold transition-all h-11 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg">
                  {dict.requestCallback || 'Request Callback'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}