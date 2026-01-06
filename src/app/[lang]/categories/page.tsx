import Link from 'next/link';
import { getCategories } from '@/lib/data';
import { getDictionary } from '@/i18n/dictionaries';
import { Metadata } from 'next';
import { generateBreadcrumbSchema } from '@/lib/utils';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.thebrainyinsights.com';
  const locales = ['en', 'de', 'fr', 'it', 'ja', 'ko', 'es'];

  const languages: Record<string, string> = {};
  locales.forEach(l => {
    languages[l] = `${siteUrl}/${l}/categories`;
  });

  return {
    title: dict.categories || 'Market Research Categories',
    description: dict.featuredCategoriesDesc || 'Explore market research reports by industry category.',
    alternates: {
      canonical: `${siteUrl}/${lang}/categories`,
      languages: languages,
    },
  };
}

export default async function CategoriesPage({ params }: Props) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const categories = await getCategories(lang);

  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.thebrainyinsights.com';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: dict.home || 'Home', item: `${siteUrl}/${lang}` },
    { name: dict.categories || 'Categories', item: `${siteUrl}/${lang}/categories` }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 py-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-indigo-700/95 to-purple-800/90"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
          </div>
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute top-32 right-20 w-32 h-32 bg-purple-300/10 rounded-lg rotate-45 blur-lg"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-indigo-300/10 rounded-full blur-lg"></div>
          <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-white/5 rounded-lg rotate-12 blur-xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 via-transparent to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">{dict.categories}</h1>
            <p className="text-xl md:text-2xl text-indigo-100 max-w-4xl mx-auto leading-relaxed">{dict.featuredCategoriesDesc}</p>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-indigo-300 mx-auto rounded-full"></div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{dict.browseCategories || 'Browse Categories'}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{dict.featuredCategoriesDesc}</p>
          </div>
          <div className="bg-indigo-600/10 backdrop-blur-sm rounded-2xl p-6 border border-indigo-200/30 shadow-lg mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link 
                  key={category.id} 
                  href={`/${lang}/categories/${category.slug}`}
                  className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group flex flex-col"
                >
                  <div className="relative h-40 w-full overflow-hidden rounded-t-xl bg-indigo-50 flex items-center justify-center">
                    {category.icon && (category.icon.startsWith('http') || category.icon.startsWith('/')) ? (
                      <img src={category.icon} alt={category.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <svg className="w-16 h-16 text-indigo-400" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="2.5" fill="none"></circle>
                        <rect x="28" y="18" width="8" height="28" rx="1" fill="currentColor"></rect>
                        <rect x="18" y="28" width="28" height="8" rx="1" fill="currentColor"></rect>
                      </svg>
                    )}
                  </div>
                  <div className="p-6 text-center flex-1 flex flex-col items-center">
                      <h3 className="font-semibold mb-2 group-hover:text-indigo-600 transition-colors text-lg">{category.name}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{category.description || 'Market insights.'}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">{dict.needCustomReportTitle || 'Need a Custom Report?'}</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">{dict.needCustomReportDesc || "Can't find what you're looking for? Request a customized market research report tailored to your specific needs."}</p>
              <Link href={`/${lang}/contact`} className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold transition-all h-12 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg shadow-md hover:shadow-lg">
                {dict.requestCustomization}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}