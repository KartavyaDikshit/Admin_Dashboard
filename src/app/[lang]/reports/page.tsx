import Link from 'next/link';
import Image from 'next/image';
import { getReports } from '@/lib/data';
import { getDictionary } from '@/i18n/dictionaries';

export default async function ReportsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const reports = await getReports(lang);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">{dict.reports}</h1>
      <div className="grid grid-cols-1 gap-8">
        {reports.map((report) => (
          <Link
            key={report.id}
            href={`/${lang}/reports/${report.slug}`}
            className="flex flex-col md:flex-row bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="md:w-1/3 h-48 md:h-auto bg-gray-200 relative">
                 {report.imageUrl ? (
                    <Image 
                      src={report.imageUrl} 
                      alt={report.title} 
                      className="w-full h-full object-cover" 
                      fill
                      unoptimized
                    />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">No Image</div>
                 )}
            </div>
            <div className="p-8 md:w-2/3 flex flex-col justify-center">
               <div className="flex items-center gap-2 mb-3">
                   <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                     Report
                   </span>
                   <span className="text-gray-400 text-sm">
                     {new Date(report.publishedDate).toLocaleDateString(lang)}
                   </span>
               </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600">
                {report.title}
              </h2>
              <p className="text-gray-600 mb-6 line-clamp-2">{report.summary || report.description}</p>
              <span className="text-blue-600 font-medium">
                {dict.readMore} &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
