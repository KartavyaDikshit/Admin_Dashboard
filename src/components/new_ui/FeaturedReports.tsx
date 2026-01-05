import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface FeaturedReportsProps {
  reports: any[]
  dict: any
  lang: string
}

export default function FeaturedReports({ reports, dict, lang }: FeaturedReportsProps) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{dict.featuredReportsTitle}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{dict.featuredReportsDesc}</p>
        </div>
        <div className="bg-indigo-600/10 backdrop-blur-sm rounded-2xl p-6 border border-indigo-200/30 shadow-lg">
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
        <div className="text-center mt-12">
          <Link href={`/${lang}/reports`} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
            {dict.browseReports}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 w-5 h-5">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}