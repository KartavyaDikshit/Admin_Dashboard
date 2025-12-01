import Link from 'next/link';
import Image from 'next/image';
import { getReport } from '@/lib/data';
import { getDictionary } from '@/i18n/dictionaries';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ReportTabs from '@/components/reports/ReportTabs';
import ReportSidebar from '@/components/reports/ReportSidebar';

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

// Helper to parse sections based on headers
const parseContent = (text: string | null, markers: string[]) => {
  if (!text) return [];
  
  // Escape markers for regex
  const escapedMarkers = markers.map(m => m.replace(/[.*+?^${}()|[\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedMarkers.join('|')})`, 'g');
  
  const parts = text.split(regex);
  const sections: { title: string; content: string }[] = [];
  
  let currentTitle = 'Overview'; // Default title for content before first marker
  let currentContent = '';

  // If the text doesn't start with a marker, the first part is content for "Overview" (or just skip if empty)
  if (parts.length > 0 && !markers.includes(parts[0])) {
     currentContent = parts[0].trim();
     if(currentContent) sections.push({ title: currentTitle, content: currentContent });
  }

  for (let i = 0; i < parts.length; i++) {
    if (markers.includes(parts[i])) {
      currentTitle = parts[i].replace(/\*\*/g, '').replace(/###/g, '').trim();
      // The next part is the content
      if (i + 1 < parts.length) {
        sections.push({
          title: currentTitle,
          content: parts[i + 1].trim()
        });
        i++; // Skip the content part
      }
    }
  }
  
  // Fallback: if no markers found but text exists, return as single block
  if (sections.length === 0 && text.trim().length > 0) {
     return [{ title: '', content: text }];
  }

  return sections;
};

export default async function ReportDetailPage({ params }: Props) {
  const { lang, slug } = await params;
  const dict = getDictionary(lang);
  const report = await getReport(slug, lang);

  if (!report) {
    notFound();
  }

  // Parse Market Dynamics
  const dynamicsMarkers = ['**A. Market Drivers**', '**B. Market Restraints**', '**C. Market Opportunities**'];
  const dynamicsSections = parseContent(report.marketDynamics, dynamicsMarkers);

  // Parse Key Players
  const playersMarkers = ['### Key Market Players', '### Recent Strategic Developments'];
  const playersSections = parseContent(report.keyMarketPlayers, playersMarkers);

  // Summary Content Component
  const SummaryContent = (
    <div className="space-y-10">
      {/* Market Research Summary */}
      {report.marketResearchSummary && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
            {dict.marketResearchSummary}
          </h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
            {report.marketResearchSummary}
          </div>
        </section>
      )}

      {/* Market Dynamics */}
      {dynamicsSections.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
            {dict.marketDynamics}
          </h2>
          <div className="grid gap-6">
            {dynamicsSections.map((section, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:border-indigo-200 transition-colors">
                {section.title && (
                  <h3 className="text-lg font-bold text-indigo-900 mb-3 pb-2 border-b border-gray-200">
                    {section.title}
                  </h3>
                )}
                <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Regional Insights */}
      {report.regionalInsights && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
             <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
             {dict.regionalInsights}
          </h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line bg-white p-6 border border-gray-100 rounded-xl shadow-sm">
            {report.regionalInsights}
          </div>
        </section>
      )}

      {/* Key Market Players */}
      {playersSections.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
             <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
             {dict.keyMarketPlayers}
          </h2>
          <div className="space-y-6">
            {playersSections.map((section, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                {section.title && (
                  <h3 className="text-lg font-bold text-indigo-900 mb-4">
                    {section.title}
                  </h3>
                )}
                <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Research Methodology */}
      <section className="bg-indigo-50 border border-indigo-100 rounded-xl p-8">
         <h2 className="text-2xl font-bold text-indigo-900 mb-4">{dict.researchMethodologyTitle}</h2>
         <p className="text-indigo-800 leading-relaxed">
            {dict.researchMethodologyText}
         </p>
      </section>
    </div>
  );

  // TOC Content Component
  const TocContent = (
    <div className="space-y-6">
      {report.tableOfContents ? (
         <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-loose">
            {report.tableOfContents}
         </div>
      ) : (
         <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-10 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
               {dict.tocFallbackTitle}
            </h3>
            <button className="mt-4 bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md">
               {dict.tocFallbackButton}
            </button>
         </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
       {/* Hero Section */}
      <section className="bg-indigo-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/grid-pattern.svg')]"></div>
        <div className="container mx-auto px-4 relative z-10">
           {/* Breadcrumbs */}
           <nav className="text-sm text-indigo-200 mb-6 flex flex-wrap gap-2 items-center">
            <Link href={`/${lang}`} className="hover:text-white transition-colors">{dict.home}</Link>
            <span className="opacity-50">/</span>
            <Link href={`/${lang}/reports`} className="hover:text-white transition-colors">{dict.reports}</Link>
            <span className="opacity-50">/</span>
            <span className="text-white font-medium truncate max-w-[200px] md:max-w-md">{report.title}</span>
          </nav>

          {/* Categories moved here from sidebar */}
          {report.categories && report.categories.length > 0 && (
             <div className="flex flex-wrap gap-2 mb-6">
                {report.categories.map(cat => (
                   <Link 
                      key={cat.id} 
                      href={`/${lang}/categories/${cat.slug}`}
                      className="bg-indigo-800/50 hover:bg-indigo-700 border border-indigo-700 text-indigo-100 text-xs font-medium px-3 py-1 rounded-full transition-colors"
                   >
                      {cat.name}
                   </Link>
                ))}
             </div>
          )}

          <h1 className="text-3xl md:text-5xl font-bold mb-8 leading-tight max-w-4xl">
            {report.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm md:text-base">
             <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="font-medium">{new Date(report.publishedDate).toLocaleDateString(lang, { month: 'long', year: 'numeric' })}</span>
             </div>
             <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                 <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <span className="font-medium">{report.pages || "N/A"} {dict.pages}</span>
             </div>
             {report.sku && (
               <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                  <span className="font-medium">{dict.reportId}: {report.sku}</span>
               </div>
             )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2">
             {/* Optional Report Image */}
             {report.imageUrl && (
                <div className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-lg mb-8">
                   <Image 
                     src={report.imageUrl} 
                     alt={report.title} 
                     fill 
                     className="object-cover"
                     unoptimized
                   />
                </div>
             )}

             {/* Tabs & Content */}
             <ReportTabs 
               summaryContent={SummaryContent} 
               tocContent={TocContent}
               labels={{ summary: dict.tabSummary, toc: dict.tabToc }}
             />
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1">
             <ReportSidebar 
                prices={{
                   singleUser: report.singlePrice ? Number(report.singlePrice) : null,
                   multiUser: report.multiPrice ? Number(report.multiPrice) : null,
                   corporate: report.corporatePrice ? Number(report.corporatePrice) : null,
                   currency: report.currency || 'USD'
                }}
                labels={{
                  chooseLicense: dict.chooseLicense,
                  singleUser: dict.singleUser,
                  multiUser: dict.multiUser,
                  corporate: dict.corporate,
                  mostPopular: dict.mostPopular,
                  buyNow: dict.buyNow,
                  securePayment: dict.securePayment,
                  requestSample: dict.requestSample,
                  requestCustomization: dict.requestCustomization,
                  talkToAnalyst: dict.talkToAnalyst,
                  scheduleConsultation: dict.scheduleConsultation,
                  customPricing: dict.customPricing
                }}
             />
          </div>
        </div>
      </div>
    </div>
  );
}
