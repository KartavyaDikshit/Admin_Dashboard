import Link from 'next/link';
import { getCategories, getReports } from '@/lib/data';
import { getDictionary } from '@/i18n/dictionaries';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const categories = await getCategories(lang);
  const reports = await getReports(lang);

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="bg-blue-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {dict.latestInsights}
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Discover market intelligence that drives decision making.
          </p>
          <div className="max-w-xl mx-auto">
            <input
              type="text"
              placeholder={dict.searchPlaceholder}
              className="w-full px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{dict.categories}</h2>
          <Link href={`/${lang}/categories`} className="text-blue-600 hover:underline font-medium">
            {dict.readMore} &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.slice(0, 4).map((category) => (
            <Link
              key={category.id}
              href={`/${lang}/categories/${category.slug}`}
              className="group block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
                {category.name}
              </h3>
              <p className="text-gray-500 line-clamp-2">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Reports */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{dict.featuredReports}</h2>
          <Link href={`/${lang}/reports`} className="text-blue-600 hover:underline font-medium">
            {dict.readMore} &rarr;
          </Link>
        </div>
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
      </section>
    </div>
  );
}
