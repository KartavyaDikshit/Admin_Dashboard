import Link from 'next/link';
import { getPaginatedReports, getCategories } from '@/lib/data';
import { getDictionary } from '@/i18n/dictionaries';
import Pagination from '@/components/ui/Pagination'; // Preserving pagination logic
// We need to implement the exact filter UI from MHTML

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string; search?: string; category?: string }>;
};

export default async function ReportsPage({ params, searchParams }: Props) {
  const { lang } = await params;
  const resolvedSearchParams = await searchParams;
  const dict = getDictionary(lang);

  const page = Number(resolvedSearchParams.page) || 1;
  const search = resolvedSearchParams.search || '';
  const categoryId = resolvedSearchParams.category || '';
  const limit = 9;

  const { reports, totalPages } = await getPaginatedReports(lang, page, limit, search, categoryId);
  const categories = await getCategories(lang);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" style={{height: '323.75px'}}>
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
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">{dict.reportsHeroTitle}</h1>
            <p className="text-xl md:text-2xl text-indigo-100 max-w-2xl mx-auto leading-relaxed">{dict.reportsHeroSubtitle}</p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-indigo-600/10 backdrop-blur-sm rounded-2xl p-6 border border-indigo-200/30 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true">
                <path d="m21 21-4.34-4.34"></path>
                <circle cx="11" cy="11" r="8"></circle>
              </svg>
              <input 
                type="search" 
                className="flex w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-10 h-10 bg-white border-gray-300" 
                placeholder={dict.searchPlaceholder} 
                defaultValue={search}
              />
            </div>
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 px-4 py-2 has-[>svg]:px-3 h-10 bg-white border-gray-300 min-w-[140px]" type="button" aria-haspopup="menu" aria-expanded="false" data-state="closed">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-funnel h-4 w-4 mr-2" aria-hidden="true">
                <path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"></path>
              </svg>
              {dict.filterByCategory}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reports.map((report) => (
              <Link key={report.id} className="block h-full group" href={`/${lang}/reports/${report.slug}`}>
                <div className="text-card-foreground rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full flex flex-col sm:flex-row">
                  {/* Image Section */}
                  <div className="relative w-full sm:w-48 h-32 sm:h-auto bg-gray-100 shrink-0">
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                       <svg className="w-8 h-8" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="8" y="12" width="48" height="32" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none"></rect>
                        <rect x="12" y="16" width="40" height="24" fill="currentColor" opacity="0.1"></rect>
                        <line x1="20" y1="48" x2="44" y2="48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"></line>
                        <line x1="28" y1="44" x2="28" y2="48" stroke="currentColor" strokeWidth="2.5"></line>
                        <line x1="36" y1="44" x2="36" y2="48" stroke="currentColor" strokeWidth="2.5"></line>
                      </svg>
                    </div>
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
                            <span>{new Date(report.publishedDate).toLocaleDateString(lang, { month: 'short', year: 'numeric' })}</span>
                        </div>
                        <span>•</span>
                        <span>ID: {report.id.substring(0,8)}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-gray-50 p-2 rounded border border-gray-100 text-center">
                           <div className="text-[10px] text-gray-500 uppercase tracking-wider">{dict.singleUser}</div>
                           <div className="text-xs font-semibold text-gray-900">${report.singlePrice?.toLocaleString()}</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-100 text-center hidden sm:block">
                           <div className="text-[10px] text-gray-500 uppercase tracking-wider">{dict.multiUser}</div>
                           <div className="text-xs font-semibold text-gray-900">${report.multiPrice?.toLocaleString()}</div>
                        </div>
                         <div className="bg-gray-50 p-2 rounded border border-gray-100 text-center hidden sm:block">
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
  );
}