import Link from 'next/link';
import { getCategory, getReports } from '@/lib/data';
import { getDictionary } from '@/i18n/dictionaries';
import { notFound } from 'next/navigation';

export default async function CategoryDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const dict = getDictionary(lang);
  const category = await getCategory(slug, lang);

  if (!category) {
    notFound();
  }

  const reports = await getReports(lang, category.id);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Category Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{category.name}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">{category.description}</p>
      </div>

      {/* Reports Grid */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{dict.reports}</h2>
      {reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reports.map((report) => (
            <Link
              key={report.id}
              href={`/${lang}/reports/${report.slug}`}
              className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gray-200 relative">
                 {report.imageUrl ? (
                    <img src={report.imageUrl} alt={report.title} className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">No Image</div>
                 )}
              </div>
              <div className="p-6">
                 <div className="flex items-center gap-2 mb-3">
                   <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                     Report
                   </span>
                   <span className="text-gray-400 text-sm">
                     {new Date(report.publishedDate).toLocaleDateString(lang)}
                   </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 line-clamp-2">
                  {report.title}
                </h3>
                <p className="text-gray-600 line-clamp-3 mb-4">
                  {report.summary || report.description}
                </p>
                <span className="text-blue-600 font-medium group-hover:underline">
                  {dict.readMore}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl border border-gray-200">
          No reports found in this category.
        </div>
      )}
    </div>
  );
}