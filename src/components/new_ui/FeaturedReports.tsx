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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <Link 
                key={report.id} 
                href={`/${lang}/reports/${report.slug}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {report.categories && report.categories.length > 0 ? report.categories[0].name : 'Report'}
                  </span>
                </div>
                <h3 className="text-base font-semibold mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug min-h-[2.5rem]">
                  {report.title}
                </h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed min-h-[2rem]">
                  {report.summary || report.description}
                </p>
                <div className="flex items-center pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                      <line x1="16" x2="16" y1="2" y2="6"></line>
                      <line x1="8" x2="8" y1="2" y2="6"></line>
                      <line x1="3" x2="21" y1="10" y2="10"></line>
                    </svg>
                    <span>{new Date(report.publishedDate).toLocaleDateString(lang, { month: 'short', year: 'numeric' })}</span>
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