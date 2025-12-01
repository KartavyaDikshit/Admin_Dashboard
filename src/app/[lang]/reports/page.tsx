import Link from 'next/link';
import Image from 'next/image';
import { getPaginatedReports, getCategories } from '@/lib/data';
import { getDictionary } from '@/i18n/dictionaries';
import ReportFilter from '@/components/reports/ReportFilter';
import Pagination from '@/components/ui/Pagination';
import HeroBackground from '@/components/common/HeroBackground';

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

  // Fetch Data
  const { reports, totalPages, total } = await getPaginatedReports(lang, page, limit, search, categoryId);
  const categories = await getCategories(lang);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Hero Section */}
      <section className="bg-indigo-900 text-white py-20 relative overflow-hidden">
        <HeroBackground />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            {dict.reportsHeroTitle}
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 mb-0 max-w-2xl mx-auto">
            {dict.reportsHeroSubtitle}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 -mt-10 relative z-20">
        
        {/* Search and Filter */}
        <ReportFilter categories={categories} dict={dict} />

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {reports.map((report) => (
            <div key={report.id} className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-100 transform hover:-translate-y-1">
              {/* Image Area */}
              <div className="h-48 relative overflow-hidden bg-gray-100">
                 {report.imageUrl ? (
                    <Image 
                      src={report.imageUrl} 
                      alt={report.title} 
                      fill 
                      className="object-cover"
                      unoptimized
                    />
                 ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-50 text-indigo-300 p-6 text-center">
                       <span className="text-sm font-medium opacity-75">{dict.researchReport}</span>
                       <div className="mt-2 font-bold text-xl opacity-90">TBI</div>
                    </div>
                 )}
                 {/* Category Tag */}
                 {report.categories && report.categories.length > 0 && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-900 uppercase tracking-wide shadow-sm">
                       {report.categories[0].name}
                    </div>
                 )}
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                   <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight min-h-[3.5rem]">
                     <Link href={`/${lang}/reports/${report.slug}`} className="hover:text-indigo-600 transition-colors">
                       {report.title}
                     </Link>
                   </h3>
                   <p className="text-gray-600 text-sm line-clamp-3 mb-4 min-h-[4.5rem]">
                     {report.summary || report.description}
                   </p>
                </div>

                <div className="mt-auto space-y-4">
                   {/* Prices Grid */}
                   <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-b border-gray-100 py-3 bg-gray-50/50 rounded-lg">
                      <div className="flex flex-col p-1">
                         <span className="text-gray-400 mb-1 text-[10px] uppercase">{dict.singleUser}</span>
                         <span className="font-bold text-gray-900">{report.singlePrice ? `$${report.singlePrice.toLocaleString()}` : '-'}</span>
                      </div>
                      <div className="flex flex-col border-l border-gray-200 p-1">
                         <span className="text-gray-400 mb-1 text-[10px] uppercase">{dict.multiUser}</span>
                         <span className="font-bold text-gray-900">{report.multiPrice ? `$${report.multiPrice.toLocaleString()}` : '-'}</span>
                      </div>
                      <div className="flex flex-col border-l border-gray-200 p-1">
                         <span className="text-gray-400 mb-1 text-[10px] uppercase">{dict.corporate}</span>
                         <span className="font-bold text-gray-900">{report.corporatePrice ? `$${report.corporatePrice.toLocaleString()}` : '-'}</span>
                      </div>
                   </div>

                   <Link 
                     href={`/${lang}/reports/${report.slug}`}
                     className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center font-bold py-3 px-4 rounded-xl transition-colors shadow-md hover:shadow-lg"
                   >
                     {dict.viewReport}
                   </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {reports.length === 0 && (
           <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="text-gray-400 mb-4">
                 <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
           </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination 
            page={page} 
            totalPages={totalPages} 
            hasNextPage={page < totalPages} 
            hasPrevPage={page > 1} 
          />
        )}
      </div>
    </div>
  );
}