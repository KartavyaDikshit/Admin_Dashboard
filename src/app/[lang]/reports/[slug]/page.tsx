import Link from 'next/link';
import Image from 'next/image';
import { getReport } from '@/lib/data';
import { getDictionary } from '@/i18n/dictionaries';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ lang: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const report = await getReport(slug, lang);

  if (!report) {
    return {
      title: 'Report Not Found',
    };
  }

  return {
    title: report.title,
    description: report.summary || report.description,
    openGraph: {
      title: report.title,
      description: report.summary || report.description,
      type: 'article',
      publishedTime: report.publishedDate.toISOString(),
      images: report.imageUrl ? [report.imageUrl] : [],
    },
  };
}

export default async function ReportDetailPage({ params }: Props) {
  const { lang, slug } = await params;
  const dict = getDictionary(lang);
  const report = await getReport(slug, lang);

  if (!report) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href={`/${lang}`} className="hover:text-blue-600">{dict.home}</Link>
        <span className="mx-2">/</span>
        <Link href={`/${lang}/reports`} className="hover:text-blue-600">{dict.reports}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{report.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{report.title}</h1>
          
          {report.imageUrl && (
             <div className="mb-8 rounded-xl overflow-hidden shadow-sm relative w-full h-auto min-h-[400px]">
                <Image 
                  src={report.imageUrl} 
                  alt={report.title} 
                  className="w-full h-auto object-cover"
                  fill
                  unoptimized
                />
             </div>
          )}

          {/* Key Details */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
             <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <div>
                   <span className="font-semibold block text-gray-900">Published</span>
                   {new Date(report.publishedDate).toLocaleDateString(lang)}
                </div>
                {/* Add more meta info here like Price, Pages, etc. if available in data fetch */}
             </div>
          </div>

          <div className="prose max-w-none text-gray-800 space-y-8">
            {/* Market Research Summary */}
            {report.marketResearchSummary && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Market Research Summary</h2>
                <div className="whitespace-pre-line">{report.marketResearchSummary}</div>
              </section>
            )}

            {/* Market Dynamics */}
            {report.marketDynamics && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Market Dynamics</h2>
                <div className="whitespace-pre-line">{report.marketDynamics}</div>
              </section>
            )}

            {/* Regional Insights */}
            {report.regionalInsights && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Regional Insights</h2>
                <div className="whitespace-pre-line">{report.regionalInsights}</div>
              </section>
            )}

             {/* Key Market Players */}
             {report.keyMarketPlayers && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Market Players</h2>
                <div className="whitespace-pre-line">{report.keyMarketPlayers}</div>
              </section>
            )}

            {/* Table of Contents */}
            {report.tableOfContents && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Table of Contents</h2>
                <div className="whitespace-pre-line">{report.tableOfContents}</div>
              </section>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md sticky top-24">
             <h3 className="text-xl font-bold text-gray-900 mb-4">Purchase Options</h3>
             <p className="text-gray-500 mb-6">Select a license type to proceed.</p>
             
             <div className="space-y-4">
                <button className="w-full block bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                   Buy Now (Single User)
                </button>
                <button className="w-full block bg-white text-blue-600 border border-blue-600 text-center py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                   Request Sample
                </button>
             </div>
          </div>

           {/* Categories Tag Cloud or List */}
           {report.categories && report.categories.length > 0 && (
              <div className="mt-8">
                 <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Categories</h4>
                 <div className="flex flex-wrap gap-2">
                    {report.categories.map(cat => (
                       <Link 
                          key={cat.id} 
                          href={`/${lang}/categories/${cat.slug}`}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full transition-colors"
                       >
                          {cat.name}
                       </Link>
                    ))}
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}