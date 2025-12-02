import Link from 'next/link';
import { getDictionary } from '@/i18n/dictionaries';
import { getPressReleases } from '@/lib/data';
import { ArrowRightIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';

export default async function PressReleases({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const pressReleases = await getPressReleases(lang);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 py-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-indigo-700/95 to-purple-800/90"></div>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">Press Releases</h1>
            <p className="text-xl md:text-2xl text-indigo-100 max-w-4xl mx-auto leading-relaxed">Latest news and updates from The Brainy Insights.</p>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-indigo-300 mx-auto rounded-full"></div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid gap-8">
            {pressReleases.map((pr: any) => (
              <Link 
                key={pr.id} 
                href={`/${lang}/press-releases/${pr.slug}`}
                className="block bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-indigo-100 group"
              >
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4" />
                      <time dateTime={pr.publishedAt ? new Date(pr.publishedAt).toISOString() : new Date(pr.createdAt).toISOString()}>
                        {formatDate(new Date(pr.publishedAt || pr.createdAt))}
                      </time>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors leading-tight">
                      {pr.title}
                    </h2>
                    <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                      {pr.description}
                    </p>
                    <span className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                      Read Full Release <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {pressReleases.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-lg">No press releases found.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
