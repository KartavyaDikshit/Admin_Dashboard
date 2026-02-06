import Link from 'next/link';
import { getCategory, getReports } from '@/lib/data';
import { getDictionary } from '@/i18n/dictionaries';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { generateBreadcrumbSchema } from '@/lib/utils';

type Props = {
  params: Promise<{ lang: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const category = await getCategory(slug, lang);

  if (!category) {
    return { title: 'Category Not Found' };
  }

  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.brainyinsights.com';
  const canonicalUrl = category.canonicalUrl || `${siteUrl}/${lang}/categories/${slug}`;
  const locales = ['en', 'de', 'fr', 'it', 'ja', 'ko', 'es'];

  const languages: Record<string, string> = {};
  locales.forEach(l => {
    languages[l] = `${siteUrl}/${l}/categories/${slug}`;
  });
  languages['x-default'] = `${siteUrl}/en/categories/${slug}`;

  return {
    title: category.metaTitle || category.name,
    description: (category.metaDescription || category.description) ?? undefined,
    keywords: category.seoKeywords || [],
    alternates: {
      canonical: canonicalUrl,
      languages: languages,
    },
    openGraph: {
      title: category.ogTitle || category.metaTitle || category.name,
      description: (category.ogDescription || category.metaDescription || category.description) ?? undefined,
      type: 'website',
      url: canonicalUrl,
      images: category.icon ? [{ url: `${siteUrl}/upload/${category.slug}.png` }] : [],
      siteName: 'The Brainy Insights',
      locale: lang,
    },
    twitter: {
      card: 'summary_large_image',
      title: category.ogTitle || category.metaTitle || category.name,
      description: (category.ogDescription || category.metaDescription || category.description) ?? undefined,
      images: category.icon ? [`${siteUrl}/upload/${category.slug}.png`] : [],
      site: '@thebrainyinsight',
    },
    other: {
      'category-slug': slug,
    }
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { lang, slug } = await params;
  const dict = getDictionary(lang);
  const category = await getCategory(slug, lang);

  if (!category) {
    notFound();
  }

  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.brainyinsights.com';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: dict.home || 'Home', item: `${siteUrl}/${lang}` },
    { name: dict.categoriesLabel || 'Categories', item: `${siteUrl}/${lang}/categories` },
    { name: category.name, item: `${siteUrl}/${lang}/categories/${slug}` }
  ]);

  const reports = await getReports(lang, category.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 h-[323.75px]">
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
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col">
          <nav aria-label="breadcrumb" className="pt-4 mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 break-words text-sm sm:gap-2.5 text-indigo-100">
              <li className="inline-flex items-center gap-1.5"><Link className="transition-colors text-indigo-100 hover:text-white" href={`/${lang}`}>{dict.home}</Link></li>
              <li className="text-indigo-300">/</li>
              <li className="inline-flex items-center gap-1.5"><Link className="transition-colors text-indigo-100 hover:text-white" href={`/${lang}/categories`}>{dict.categoriesLabel}</Link></li>
              <li className="text-indigo-300">/</li>
              <li className="inline-flex items-center gap-1.5"><span className="text-white font-medium">{category.name}</span></li>
            </ol>
          </nav>
          <div className="flex items-start space-x-6 flex-1 pb-6">
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
                {category.icon ? (
                  <img src={`/upload/${category.slug}.png`} alt={category.name} className="w-16 h-16 object-contain" />
                ) : (
                  <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="2.5" fill="none"></circle>
                    <rect x="28" y="18" width="8" height="28" rx="1" fill="currentColor"></rect>
                    <rect x="18" y="28" width="28" height="8" rx="1" fill="currentColor"></rect>
                  </svg>
                )}
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-5xl font-bold mb-4 text-white">{category.name}</h1>
              <p className="text-xl text-indigo-100 leading-relaxed mb-4">{category.description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4">
          <div>
            <div className="bg-indigo-600/10 backdrop-blur-sm rounded-2xl p-6 border border-indigo-200/30 shadow-lg mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative flex-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true">
                    <path d="m21 21-4.34-4.34"></path>
                    <circle cx="11" cy="11" r="8"></circle>
                  </svg>
                  <input className="flex w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-10 h-10 bg-white border-gray-300" placeholder="Search reports..." type="search" />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {reports.map((report) => (
                  <Link key={report.id} className="block h-full group" href={`/${lang}/reports/${report.slug}`}>
                    <div className="text-card-foreground rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full flex flex-col sm:flex-row">
                      {/* Image Section */}
                      <div className="relative w-full sm:w-48 h-32 sm:h-auto bg-gray-100 shrink-0">
                        {category.icon ? (
                          <img 
                            src={`/upload/${category.slug}.png`} 
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                             <svg className="w-8 h-8" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="8" y="12" width="48" height="32" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none"></rect>
                              <rect x="12" y="16" width="40" height="24" fill="currentColor" opacity="0.1"></rect>
                              <line x1="20" y1="48" x2="44" y2="48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"></line>
                              <line x1="28" y1="44" x2="28" y2="48" stroke="currentColor" strokeWidth="2.5"></line>
                              <line x1="36" y1="44" x2="36" y2="48" stroke="currentColor" strokeWidth="2.5"></line>
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                           <span className="inline-flex items-center rounded-md bg-white/90 backdrop-blur-sm px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                             {category.name}
                           </span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex flex-1 flex-col p-4 sm:p-5">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {report.title}
                          </h3>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                                <span>{new Date(report.publishedDate).toLocaleDateString(lang || 'en-US', { month: 'short', year: 'numeric' })}</span>
                            </div>
                            <span>•</span>
                            <span>ID: {report.reportId || report.sku}</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="bg-gray-50 p-2 rounded border border-gray-100 text-center">
                               <div className="text-[10px] text-gray-500 uppercase tracking-wider">{dict.singleUser || 'Single'}</div>
                               <div className="text-xs font-semibold text-gray-900">${report.singlePrice?.toLocaleString()}</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded border border-gray-100 text-center">
                               <div className="text-[10px] text-gray-500 uppercase tracking-wider">{dict.multiUser || 'Multi'}</div>
                               <div className="text-xs font-semibold text-gray-900">${report.multiPrice?.toLocaleString()}</div>
                            </div>
                             <div className="bg-gray-50 p-2 rounded border border-gray-100 text-center">
                               <div className="text-[10px] text-gray-500 uppercase tracking-wider">{dict.corporate || 'Corp'}</div>
                               <div className="text-xs font-semibold text-gray-900">${report.corporatePrice?.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                        
                        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:shadow-md">
                           {dict.viewReport || 'View Report'}
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 transition-transform group-hover:translate-x-0.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
