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
  
  const isHtml = /<[a-z][\s\S]*>/i.test(text);

  // Escape special characters properly in regex
  // Escape and sort by length desc to match longest first
  const escapedMarkers = markers
      .map(m => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'))
      .sort((a, b) => b.length - a.length);
  
  const markerGroup = escapedMarkers.join('|');
  
  if (isHtml) {
      // HTML Parsing Strategy
      
      // Regex Breakdown:
      // ((?:<[^>]+>\\s*)*)     : Group 1: Opening tags
      // (?:
      //   ([#*]+)\\s*          : Group 2: Explicit Markdown Header (e.g. "####")
      //   |
      //   (?<=^|>)\\s*([#*\\s]*) : Group 3: Contextual Header (start of block)
      // )
      // (${markerGroup})       : Group 4: The Marker Title
      // ((?:\\s*<\\/[^>]+>)*)  : Group 5: Closing tags
      // \\s*                   : Optional whitespace
      
      const htmlRegex = new RegExp(`((?:<[^>]+>\\s*)*)(?:([#*]+)\\s*|(?<=^|>)\\s*([#*\\s]*))(${markerGroup})((?:\\s*<\\/[^>]+>)*)\\s*`, 'gi');
      
      const SPLITTER = '###SECTION_SPLIT###';
      
      // Replace found headers with splitter, keeping only the title
      const processedText = text.replace(htmlRegex, (match, openTags, hardPrefix, softPrefix, title, closeTags) => {
          return `${SPLITTER}${title}${SPLITTER}`;
      });
      
      const parts = processedText.split(SPLITTER);
      const sections: { title: string; content: string }[] = [];
      
      let currentTitle = 'Overview';
      // Handle content before first marker
      if (parts[0] && parts[0].trim()) {
          sections.push({ title: currentTitle, content: parts[0].trim() });
      }
      
      // Iterate pairs: [title, content, title, content...]
      for (let i = 1; i < parts.length; i += 2) {
          const title = parts[i];
          const content = parts[i+1];
          
          if (title && content && content.trim()) {
              sections.push({ title: title.trim(), content: content.trim() });
          }
      }
      
      if (sections.length === 0 && text.trim().length > 0) {
         return [{ title: 'Overview', content: text }];
      }
      return sections;

  } else {
      // Robust Plain Text Parsing Strategy using Split
      // This handles "Market Dynamics#### A. Market Drivers" and "**A. Market Drivers**"
      
      // Regex to find Headers
      // captures: full match includes surrounding #, *, whitespace
      // We look for: [Prefix Symbols (#*)] + [Space] + [Marker] + [Space] + [Suffix Symbols (* only) + Colon]
      // Using split ensures we capture the "in-between" content reliably
      const regex = new RegExp(`([#*]*\\s*(?:${markerGroup})\\s*[*]*:?)`, 'gi');
      
      const parts = text.split(regex);
      const sections: { title: string; content: string }[] = [];
      
      // parts[0] is text before first match
      if (parts[0] && parts[0].trim()) {
         sections.push({ title: 'Overview', content: parts[0].trim() });
      }
      
      // parts array will look like: [preamble, captured_header, content, captured_header, content, ...]
      for (let i = 1; i < parts.length; i += 2) {
          const header = parts[i];
          const content = parts[i + 1];
          
          if (!header) continue;

          // Clean the title (remove #, *, :)
          const title = header.replace(/[#*:]/g, '').trim();
          
          // Verify it's a real title match (basic check)
          if (!title) continue;

          // Boundary Check logic (replicated for safety, though split handles most cases)
          // If the match was partial inside a word, split would still happen, 
          // but we might want to validate if needed. 
          // However, for split strategy, we trust the regex.
          
          // Handle content (if undef, empty string)
          const cleanContent = content ? content.trim() : '';
          
          // Logic: "Market Dynamics" might have empty content if followed immediately by "A. Market Drivers"
          sections.push({ title, content: cleanContent });
      }
      
      if (sections.length === 0 && text.trim().length > 0) {
          return [{ title: 'Overview', content: text }];
      }

      return sections;
  }
};

export default async function ReportDetailPage({ params }: Props) {
  const { lang, slug } = await params;
  const dict = getDictionary(lang);
  const report = await getReport(slug, lang);

  if (!report) {
    notFound();
  }

  // Markers for Market Dynamics
  // Expanded to include generic headers without prefixes (e.g. "Market Drivers") for reports like Laser Driver Chip Market
  const dynamicsMarkers = [
      'Market Dynamics', 
      'A. Market Drivers', 'B. Market Restraints', 'C. Market Opportunities', 
      'Market Drivers', 'Market Restraints', 'Market Opportunities',
      'Market Trends', 'Conclusion',
      'Regional Insights'
  ];
  const dynamicsSections = parseContent(report.marketDynamics, dynamicsMarkers);
  
  // Markers for Key Market Players
  const playersMarkers = ['Key Market Players', 'Recent Strategic Developments', 'Company Profiles', 'Key Players'];
  const playersSections = parseContent(report.keyMarketPlayers, playersMarkers);
  
  // Extract Recent Strategic Developments from parsed sections if not in DB
  const parsedRecentDev = playersSections.find(s => s.title === 'Recent Strategic Developments');
  const recentStrategicDevelopmentsContent = report.recentStrategicDevelopments || (parsedRecentDev ? parsedRecentDev.content : null);

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
            {report.marketResearchSummary && /<[a-z][\s\S]*>/i.test(report.marketResearchSummary) ? (
               <div 
                 className="text-base text-gray-700 leading-relaxed text-justify prose max-w-none"
                 dangerouslySetInnerHTML={{ __html: report.marketResearchSummary }}
               />
            ) : (
               <p className="text-base text-gray-700 leading-relaxed text-justify whitespace-pre-line">
                 {report.marketResearchSummary || report.summary || report.description}
               </p>
            )}
          </div>
        </div>
        
        {recentStrategicDevelopmentsContent && (
           <div>
             <h5 className="font-bold text-lg text-gray-900 mb-3">Recent Strategic Developments</h5>
             <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
               <div className="space-y-3">
                 {typeof recentStrategicDevelopmentsContent === 'string' && /<[a-z][\s\S]*>/i.test(recentStrategicDevelopmentsContent) ? (
                    <div 
                        className="text-base text-gray-700 leading-relaxed text-justify prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: recentStrategicDevelopmentsContent }}
                    />
                 ) : (
                    <p className="text-base text-gray-700 leading-relaxed text-justify whitespace-pre-line">
                    {Array.isArray(recentStrategicDevelopmentsContent) 
                        ? recentStrategicDevelopmentsContent.map((d: any) => `${d.date}: ${d.event}`).join('\n\n')
                        : typeof recentStrategicDevelopmentsContent === 'object' && recentStrategicDevelopmentsContent !== null
                            ? JSON.stringify(recentStrategicDevelopmentsContent, null, 2) 
                            : recentStrategicDevelopmentsContent as string
                    }
                    </p>
                 )}
               </div>
             </div>
           </div>
        )}

        {report.imageUrl && (
            <div className="mb-8">
              <img 
                src={report.imageUrl} 
                alt={report.title} 
                className="w-full h-auto rounded-lg shadow-sm border border-gray-200"
              />
            </div>
        )}

        <div className="mt-6 mb-3">
          <h3 className="font-bold text-xl text-gray-900 border-b-2 border-indigo-200 pb-2">Market Dynamics</h3>
        </div>
        
        {/* Market Dynamics - Always Render Sections Loop */}
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
                {/* Render content as HTML if it contains tags, otherwise text */}
                {/<[a-z][\s\S]*>/i.test(section.content) ? (
                    <div 
                        className="text-base text-gray-700 leading-relaxed text-justify prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                ) : (
                    <p className="text-base text-gray-700 leading-relaxed text-justify whitespace-pre-line">{section.content}</p>
                )}
              </div>
            </div>
          )
        })}

        {report.regionalInsights && (
          <>
            <div className="mt-6 mb-3">
              <h3 className="font-bold text-xl text-gray-900 border-b-2 border-indigo-200 pb-2">Regional Insights</h3>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                {/<[a-z][\s\S]*>/i.test(report.regionalInsights) ? (
                   <div 
                     className="text-base text-gray-700 leading-relaxed text-justify prose max-w-none"
                     dangerouslySetInnerHTML={{ __html: report.regionalInsights }}
                   />
                ) : (
                    <p className="text-base text-gray-700 leading-relaxed text-justify whitespace-pre-line">
                      {report.regionalInsights.replace(/^[#*\s]*Regional Insights.*[\r\n]*/i, '')}
                    </p>
                )}
            </div>
          </>
        )}

        <div className="mt-6 mb-3">
          <h3 className="font-bold text-xl text-gray-900 border-b-2 border-indigo-200 pb-2">Key Market Players</h3>
        </div>
        
        {/* Key Market Players - Always Render Sections Loop */}
        {playersSections.map((section, index) => {
             // Skip Recent Strategic Developments if it's already displayed above
             if (section.title === 'Recent Strategic Developments' && recentStrategicDevelopmentsContent) return null;

             return (
             <div key={index} className="bg-slate-50 p-5 rounded-lg border border-slate-200 mb-4">
                {section.title && section.title !== 'Overview' && !section.title.toLowerCase().includes('key market players') && <h5 className="font-bold text-lg text-gray-900 mb-3">{section.title}</h5>}
                {/<[a-z][\s\S]*>/i.test(section.content) ? (
                    <div 
                        className="text-base text-gray-700 leading-relaxed text-justify prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                ) : (
                    <div className="text-base text-gray-700 leading-relaxed text-justify whitespace-pre-line">{section.content}</div>
                )}
             </div>
          )
        })}

      </div>
    </div>
  );

  const TocContent = report.tableOfContents ? (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
       {/<[a-z][\s\S]*>/i.test(report.tableOfContents) ? (
           <div 
             className="prose max-w-none text-gray-700 text-justify leading-relaxed"
             dangerouslySetInnerHTML={{ __html: report.tableOfContents }}
           />
       ) : (
           <div className="prose max-w-none text-gray-700 whitespace-pre-line text-justify leading-relaxed">
              {report.tableOfContents}
           </div>
       )}
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

              <h1 className="hero-title text-left inline">
                {report.title}
                {report.titleDescription && <span className="hero-subtitle inline font-normal ml-2"> - {report.titleDescription}</span>}
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
          
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 pb-8 safe-area-pb">
             <div className="flex gap-3">
                <button className="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 py-3 px-4 rounded-lg font-bold shadow-sm text-sm">
                   Request Sample
                </button>
                <button className="flex-[2] bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-bold shadow-lg text-sm">
                   {dict.buyNow} - ${report.singlePrice?.toLocaleString()}
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
