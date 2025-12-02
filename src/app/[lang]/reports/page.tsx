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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {reports.map((report) => (
              <Link key={report.id} className="block h-full" href={`/${lang}/reports/${report.slug}`}>
                <div className="text-card-foreground gap-6 rounded-xl group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-200 bg-white cursor-pointer h-full flex flex-col">
                  <div className="relative w-[90%] mx-auto mt-2 rounded-md overflow-hidden" style={{aspectRatio: '4/1.2'}}>
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-105">
                      <svg className="w-10 h-10" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="8" y="12" width="48" height="32" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none"></rect>
                        <rect x="12" y="16" width="40" height="24" fill="currentColor" opacity="0.1"></rect>
                        <line x1="20" y1="48" x2="44" y2="48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"></line>
                        <line x1="28" y1="44" x2="28" y2="48" stroke="currentColor" strokeWidth="2.5"></line>
                        <line x1="36" y1="44" x2="36" y2="48" stroke="currentColor" strokeWidth="2.5"></line>
                      </svg>
                    </div>
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      <span className="inline-flex items-center justify-center rounded-md w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden [a&]:hover:bg-primary/90 bg-white/90 backdrop-blur-sm text-indigo-600 text-[9px] font-medium px-2 py-0.5 border border-indigo-100">
                        {report.categories?.[0]?.name || 'Report'}
                      </span>
                    </div>
                  </div>
                  <div className="[&_:last-child]:pb-6 p-4 flex-1 flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-indigo-600 transition-colors min-h-[2.5rem]">
                      {report.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2 min-h-[2rem]">
                      {report.summary || report.description}
                    </p>
                    <div className="flex items-center mb-3 text-[10px] text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar h-2.5 w-2.5" aria-hidden="true">
                          <path d="M8 2v4"></path>
                          <path d="M16 2v4"></path>
                          <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                          <path d="M3 10h18"></path>
                        </svg>
                        <span>{new Date(report.publishedDate).toLocaleDateString(lang, { month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="mb-3 p-2 bg-gray-50 rounded-md">
                      <div className="text-[10px] text-gray-500 mb-1">Pricing Options:</div>
                      <div className="space-y-0.5 text-[10px]">
                        <div className="flex justify-between"><span>{dict.singleUser}:</span><span className="font-medium text-gray-900">${report.singlePrice?.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>{dict.multiUser}:</span><span className="font-medium text-gray-900">${report.multiPrice?.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>{dict.corporate}:</span><span className="font-medium text-gray-900">${report.corporatePrice?.toLocaleString()}</span></div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 w-full bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye h-3 w-3 mr-1.5" aria-hidden="true">
                          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        {dict.viewReport}
                      </button>
                    </div>
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