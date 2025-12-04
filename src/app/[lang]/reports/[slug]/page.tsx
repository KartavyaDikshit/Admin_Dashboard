import Link from 'next/link';
import Image from 'next/image';
import { getReport } from '@/lib/data';
import { getDictionary } from '@/i18n/dictionaries';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { formatDate, extractMarketStats } from '@/lib/utils';
import ReportTabs from '@/components/new_ui/ReportTabs';
import ReportSidebar from '@/components/new_ui/ReportSidebar';
import { DocumentTextIcon, ClockIcon, GlobeAltIcon, UserGroupIcon } from '@heroicons/react/24/outline';

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

const parseContent = (text: string | null, markers: string[]) => {
  if (!text) return [];
  
  // Fixed: Escape special characters properly in regex
  const escapedMarkers = markers.map(m => m.replace(/[.*+?^${}()|[\\]/g, '\\$&'));
  const markerGroup = escapedMarkers.join('|');
  
  // Pattern 1: Specific markers (handling optional markdown prefix like #### or **)
  // Uses lookbehind (?<=[\r\n]) to ensure it starts on a new line (or start of string) without consuming the newline
  // Uses lookahead (?=[\r\n]|$) to ensure it ends at a newline without consuming it
  const pattern1 = `(?:^|(?<=[\\r\\n]))[\\s#*]*(${markerGroup})(?:[:\\s]*)(?=[\\r\\n]|$)`;
  
  // Pattern 2: Generic Markdown headers (#### Title)
  // Matches: (start/newline lookbehind) + (##... ) + (Title) + (newline lookahead)
  const pattern2 = `(?:^|(?<=[\\r\\n]))[\\t ]*#{2,}[\\t ]+([^\\r\\n]+?)[\\t ]*(?=[\\r\\n]|$)`;

  // Combine patterns. Specific markers take precedence if they match.
  const regex = new RegExp(`${pattern1}|${pattern2}`, 'i');
  
  const parts = text.split(regex);
  const sections: { title: string; content: string }[] = [];
  
  let currentTitle = 'Overview';
  
  // Handle the first part (before any marker)
  if (parts.length > 0 && parts[0]?.trim()) {
     sections.push({ title: currentTitle, content: parts[0].trim() });
  }
  
  // Iterate through the split parts.
  // split() with 2 capturing groups returns: 
  // [content0, match1_group1, match1_group2, content1, match2_group1, match2_group2, content2...]
  // So the stride is 3.
  for (let i = 1; i < parts.length; i += 3) {
    const markerTitle = parts[i];
    const genericTitle = parts[i + 1];
    const content = parts[i + 2];
    
    // One of the groups will be defined
    const rawTitle = markerTitle || genericTitle;
    
    if (!rawTitle) continue;
    
    // Clean up the title (remove markdown symbols if any remain)
    const cleanTitle = rawTitle.replace(/[#*]/g, '').trim();
    
    // Ensure content exists and is not just whitespace
    if (content && content.trim()) {
      sections.push({ title: cleanTitle, content: content.trim() });
    }
  }
  
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

  // Updated markers based on user feedback: "A. Market Drivers", "B. Market Restraints" etc.
  // We also include "Market Dynamics" and "Regional Insights" to ensure they are split out if present in the text, preventing duplication.
  const dynamicsMarkers = ['Market Dynamics', 'A. Market Drivers', 'B. Market Restraints', 'C. Market Opportunities', 'Regional Insights'];
  const dynamicsSections = parseContent(report.marketDynamics, dynamicsMarkers);
  
  // User mentioned: "### Key Market Players" and "### Recent Strategic Developments"
  // We include "Key Market Players" to split it out if it appears as a header in the text.
  const playersMarkers = ['Key Market Players', 'Recent Strategic Developments'];
  const playersSections = parseContent(report.keyMarketPlayers, playersMarkers);

  const stats = extractMarketStats(report.marketResearchSummary || report.summary || report.description);

  const SummaryContent = (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-bold text-2xl text-gray-900">{report.title}</h3>
          
          {(stats.cagr || stats.marketSize) && (
          <div className="grid grid-cols-2 gap-4">
            {stats.cagr && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-lg border border-green-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chart-column h-5 w-5 text-green-600" aria-hidden="true"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
                <h5 className="font-semibold text-gray-700 text-sm">CAGR</h5>
              </div>
              <p className="text-green-900 font-bold text-2xl">{stats.cagr}</p>
              <p className="text-green-700 text-xs mt-1">Compound Annual Growth Rate</p>
            </div>
            )}
            {stats.marketSize && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-lg border border-indigo-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up h-5 w-5 text-indigo-600" aria-hidden="true"><path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path></svg>
                <h5 className="font-semibold text-gray-700 text-sm">Market Size</h5>
              </div>
              <p className="text-indigo-900 font-bold text-2xl">{stats.marketSize}</p>
              <p className="text-indigo-700 text-xs mt-1">Current Market Valuation</p>
            </div>
            )}
          </div>
          )}
        </div>
        <div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-base text-gray-700 leading-relaxed text-justify whitespace-pre-line">
              {report.marketResearchSummary || report.summary || report.description}
            </p>
          </div>
        </div>
        
        {report.recentStrategicDevelopments && (
           <div>
             <h5 className="font-bold text-lg text-gray-900 mb-3">Recent Development</h5>
             <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
               <div className="space-y-3">
                 <p className="text-base text-gray-700 leading-relaxed text-justify">
                   {Array.isArray(report.recentStrategicDevelopments) 
                      ? report.recentStrategicDevelopments.map((d: any) => `${d.date}: ${d.event}`).join('\n\n')
                      : report.recentStrategicDevelopments}
                 </p>
               </div>
             </div>
           </div>
        )}

        <div className="mt-6 mb-3">
          <h3 className="font-bold text-xl text-gray-900 border-b-2 border-indigo-200 pb-2">Market Dynamics</h3>
        </div>
        
        {/* Render Market Dynamics Sections */}
        {dynamicsSections.map((section, index) => {
          // Skip rendering if the title is just "Market Dynamics" or "Regional Insights" as they are main headers
          if (['Market Dynamics', 'Regional Insights'].includes(section.title)) return null;
          
          return (
          <div key={index} className="mb-4">
            {/* We don't show "Overview" title if it's just the intro text */}
            {section.title !== 'Overview' && (
                <h6 className="font-semibold text-base text-gray-900 mb-2">{section.title.replace(/^Market\s+/, '')}</h6>
            )}
            <div className={section.title === 'Overview' ? "bg-white p-0" : "bg-amber-50 p-4 rounded-lg border-l-4 border-amber-400"}>
              <p className="text-base text-gray-700 leading-relaxed text-justify whitespace-pre-line">{section.content}</p>
            </div>
          </div>
        )})}

        {report.regionalInsights && (
          <>
            <div className="mt-6 mb-3">
              <h3 className="font-bold text-xl text-gray-900 border-b-2 border-indigo-200 pb-2">Regional Insights</h3>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-base text-gray-700 leading-relaxed text-justify whitespace-pre-line">
                  {report.regionalInsights.replace(/^[#*\s]*Regional Insights.*[\r\n]*/i, '')}
                </p>
            </div>
          </>
        )}

        <div className="mt-6 mb-3">
          <h3 className="font-bold text-xl text-gray-900 border-b-2 border-indigo-200 pb-2">Key Market Players</h3>
        </div>
        {playersSections.map((section, index) => {
           return (
           <div key={index} className="bg-slate-50 p-5 rounded-lg border border-slate-200 mb-4">
              {section.title && section.title !== 'Overview' && !section.title.toLowerCase().includes('key market players') && <h5 className="font-bold text-lg text-gray-900 mb-3">{section.title}</h5>}
              <div className="text-base text-gray-700 leading-relaxed text-justify whitespace-pre-line">{section.content}</div>
           </div>
        )})}

      </div>
    </div>
  );

  const TocContent = report.tableOfContents ? (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
       <div className="prose max-w-none text-gray-700 whitespace-pre-line text-justify leading-relaxed">
          {report.tableOfContents}
       </div>
    </div>
  ) : (
    <div id="table-of-contents-section" className="bg-gradient-to-br from-amber-50 to-orange-50 p-10 rounded-lg border-2 border-dashed border-amber-300 text-center shadow-sm">
      <div className="flex flex-col items-center space-y-6">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center shadow-inner">
          <DocumentTextIcon className="h-10 w-10 text-amber-600" />
        </div>
        <div className="space-y-2">
          <h4 className="font-bold text-xl text-gray-900">{dict.tocFallbackTitle || "Table of Contents Not Available"}</h4>
          <p className="text-gray-600 max-w-md mx-auto">Get a detailed chapter breakdown and page-by-page content structure delivered to your inbox.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-md hover:shadow-lg h-12 px-8 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold">
          <DocumentTextIcon className="h-5 w-5" />
          {dict.tocFallbackButton || "Request Table of Contents"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="hero-section">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-indigo-700/95 to-purple-800/90"></div>
          <div className="hero-overlay-pattern"></div>
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute top-32 right-20 w-32 h-32 bg-purple-300/10 rounded-lg rotate-45 blur-lg"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-indigo-300/10 rounded-full blur-lg"></div>
          <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-white/5 rounded-lg rotate-12 blur-xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
            <div className="flex-1 text-left flex flex-col justify-center min-h-[200px]">
               <nav aria-label="breadcrumb" className="mb-6">
                <ol className="flex flex-wrap items-center gap-1.5 break-words text-sm sm:gap-2.5 text-indigo-100">
                  <li className="inline-flex items-center gap-1.5"><Link className="transition-colors text-indigo-100 hover:text-white" href={`/${lang}`}>{dict.home}</Link></li>
                  <li className="text-indigo-300">/</li>
                  <li className="inline-flex items-center gap-1.5"><Link className="transition-colors text-indigo-100 hover:text-white" href={`/${lang}/reports`}>{dict.reports}</Link></li>
                  <li className="text-indigo-300">/</li>
                  <li className="inline-flex items-center gap-1.5"><span className="text-white font-medium line-clamp-1">{report.title}</span></li>
                </ol>
              </nav>

              <h1 className="hero-title text-left">
                {report.title}
                {report.titleDescription && <span className="hero-subtitle block text-left mt-4 font-normal">{report.titleDescription}</span>}
              </h1>
            </div>

            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="text-card-foreground flex flex-col gap-6 rounded-xl border bg-white/95 backdrop-blur-sm shadow-xl">
                <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 [.border-b]:pb-6">
                  <h4 className="text-lg font-semibold">Report Details</h4>
                </div>
                <div className="px-3 [&:last-child]:pb-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center"><DocumentTextIcon className="h-4 w-4 mr-2" />Pages</span>
                    <span className="font-medium text-gray-900">120+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center"><ClockIcon className="h-4 w-4 mr-2" />Published</span>
                    <span className="font-medium text-gray-900">{new Date(report.publishedDate).toLocaleDateString(lang, { month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center"><GlobeAltIcon className="h-4 w-4 mr-2" />Coverage</span>
                    <span className="font-medium text-gray-900">Global</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center"><UserGroupIcon className="h-4 w-4 mr-2" />Format</span>
                    <span className="font-medium text-gray-900">PDF, Excel</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center">ID</span>
                    <span className="font-medium text-gray-900">{report.reportId || report.sku}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <ReportTabs 
              summaryContent={SummaryContent} 
              tocContent={TocContent}
              labels={{ summary: dict.tabSummary, toc: dict.tabToc }}
            />
          </div>
          
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
             <ReportSidebar 
                prices={{
                   singleUser: report.singlePrice ? Number(report.singlePrice) : null,
                   multiUser: report.multiPrice ? Number(report.multiPrice) : null,
                   corporate: report.corporatePrice ? Number(report.corporatePrice) : null,
                   currency: report.currency || 'USD'
                }}
                labels={dict}
             />
          </div>
          
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg p-4">
             <div className="flex gap-2">
                <button className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-bold shadow-lg">
                   {dict.buyNow} - ${report.singlePrice?.toLocaleString()}
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}