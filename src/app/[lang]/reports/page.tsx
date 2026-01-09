import Link from 'next/link';
import { getPaginatedReports, getCategories } from '@/lib/data';
import { getDictionary } from '@/i18n/dictionaries';
import Pagination from '@/components/ui/Pagination';
import ReportFilter from '@/components/reports/ReportFilter';
import { Metadata } from 'next';
import { generateBreadcrumbSchema } from '@/lib/utils';

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string; search?: string; category?: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.thebrainyinsights.com';
  const locales = ['en', 'de', 'fr', 'it', 'ja', 'ko', 'es'];

  const languages: Record<string, string> = {};
  locales.forEach(l => {
    languages[l] = `${siteUrl}/${l}/reports`;
  });

  return {
    title: dict.reports || 'Market Research Reports | The Brainy Insights',
    description: dict.reportsHeroSubtitle || 'Browse our extensive collection of market research reports across various industries.',
    keywords: ['market research reports', 'industry analysis', 'market trends', 'strategic insights'],
    alternates: {
      canonical: `${siteUrl}/${lang}/reports`,
      languages: languages,
    },
    openGraph: {
      title: dict.reports || 'Market Research Reports | The Brainy Insights',
      description: dict.reportsHeroSubtitle || 'Browse our extensive collection of market research reports across various industries.',
      url: `${siteUrl}/${lang}/reports`,
      siteName: 'The Brainy Insights',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.reports || 'Market Research Reports | The Brainy Insights',
      description: dict.reportsHeroSubtitle || 'Browse our extensive collection of market research reports.',
      site: '@thebrainyinsight',
    }
  };
}

export default async function ReportsPage({ params, searchParams }: Props) {
  const { lang } = await params;
  const resolvedSearchParams = await searchParams;
  const dict = getDictionary(lang);

  const page = Number(resolvedSearchParams.page) || 1;
  const search = resolvedSearchParams.search || '';
  const categoryId = resolvedSearchParams.category || '';
  const limit = 10;

  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.thebrainyinsights.com';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: dict.home || 'Home', item: `${siteUrl}/${lang}` },
    { name: dict.reports || 'Reports', item: `${siteUrl}/${lang}/reports` }
  ]);

  const { reports, totalPages } = await getPaginatedReports(lang, page, limit, search, categoryId);
  const categories = await getCategories(lang);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="min-h-screen bg-gray-50">
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
            <div className="text-center">
              <h1 className="hero-title">{dict.reportsHeroTitle}</h1>
              <p className="hero-subtitle">{dict.reportsHeroSubtitle}</p>
            </div>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ReportFilter categories={categories} dict={dict} />

          <div className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reports.map((report) => (
                <Link key={report.id} className="block h-full group" href={`/${lang}/reports/${report.slug}`}>
                  <div className="text-card-foreground rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full flex flex-col sm:flex-row">
                    {/* Image Section */}
                    <div className="relative w-full sm:w-48 h-32 sm:h-auto bg-gray-100 shrink-0">
                      {report.categories?.[0]?.icon ? (
                        <img 
                          src={report.categories[0].icon} 
                          alt={report.categories[0].name}
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
                           {report.categories?.[0]?.name || 'Report'}
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
                             <div className="text-[10px] text-gray-500 uppercase tracking-wider">{dict.singleUser}</div>
                             <div className="text-xs font-semibold text-gray-900">${report.singlePrice?.toLocaleString()}</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded border border-gray-100 text-center">
                             <div className="text-[10px] text-gray-500 uppercase tracking-wider">{dict.multiUser}</div>
                             <div className="text-xs font-semibold text-gray-900">${report.multiPrice?.toLocaleString()}</div>
                          </div>
                           <div className="bg-gray-50 p-2 rounded border border-gray-100 text-center">
                             <div className="text-[10px] text-gray-500 uppercase tracking-wider">{dict.corporate}</div>
                             <div className="text-xs font-semibold text-gray-900">${report.corporatePrice?.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                      
                      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:shadow-md">
                         {dict.viewReport}
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 transition-transform group-hover:translate-x-0.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-12">
            {/* Use existing pagination component but style might need check if it matches MHTML */}
            <Pagination 
              page={page} 
              totalPages={totalPages} 
              hasNextPage={page < totalPages} 
              hasPrevPage={page > 1} 
            />
          </div>
        </main>
      </div>
    </>
  );
}
