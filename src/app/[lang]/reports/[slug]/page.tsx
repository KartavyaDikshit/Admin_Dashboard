import Link from 'next/link';
import Image from 'next/image';
import { getReport, getReportWithAllTranslations } from '@/lib/data';
import { getDictionary } from '@/i18n/dictionaries';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { formatDate, extractMarketStats, generateBreadcrumbSchema } from '@/lib/utils';
import ReportTabs from '@/components/new_ui/ReportTabs';
import ReportSidebar from '@/components/new_ui/ReportSidebar';
import { DocumentTextIcon, ClockIcon, GlobeAltIcon, UserGroupIcon, TagIcon } from '@heroicons/react/24/outline';

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

  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.thebrainyinsights.com';
  const canonicalUrl = report.canonicalUrl || `${siteUrl}/${lang}/reports/${slug}`;
  
  // Fetch all translations for hreflang
  const fullReport = await getReportWithAllTranslations(slug);
  const languages: Record<string, string> = {};
  
  if (fullReport) {
      // Add default (main slug)
      languages['en'] = `${siteUrl}/en/reports/${fullReport.slug}`;
      // Add translations
      fullReport.translations.forEach((t: any) => {
          languages[t.locale] = `${siteUrl}/${t.locale}/reports/${t.slug}`;
      });
  }

  return {
    title: report.metaTitle || report.title,
    description: report.metaDescription || report.summary || report.description,
    keywords: report.keywords || [],
    alternates: {
      canonical: canonicalUrl,
      languages: languages,
    },
    openGraph: {
      title: report.ogTitle || report.metaTitle || report.title,
      description: report.ogDescription || report.metaDescription || report.summary || report.description,
      type: 'article',
      url: canonicalUrl,
      publishedTime: report.publishedDate.toISOString(),
      images: report.ogImage ? [report.ogImage] : (report.imageUrl ? [report.imageUrl] : []),
      siteName: 'The Brainy Insights',
      locale: lang,
    },
    twitter: {
      card: 'summary_large_image',
      title: report.twitterTitle || report.ogTitle || report.metaTitle || report.title,
      description: report.twitterDescription || report.ogDescription || report.metaDescription || report.summary || report.description,
      images: report.ogImage ? [report.ogImage] : (report.imageUrl ? [report.imageUrl] : []),
    },
  };
}

const parseContent = (text: string | null, markers: string[]) => {
  if (!text) return [];
  
  const isHtml = /<[a-z][\s\S]*>/i.test(text);

  if (isHtml) {
      // HTML Parsing Strategy: Generic Header Split
      // We look for h1-h6 tags and use them as natural delimiters.
      // This is much more robust than matching specific markers, as it respects the AI's structural intent.
      
      const sections: { title: string; content: string }[] = [];
      
      // Regex to match headers: <h[1-6] ...> Title </h[1-6]>
      // Captures: 1: Heading Level (1-6), 2: Attributes (ignored), 3: Title Text
      const headerRegex = /<h([1-6])([^>]*)>(.*?)<\/h\1>/gi;
      
      let match;
      let lastIndex = 0;
      let currentTitle = 'Overview'; // Default title for pre-header content
      
      // Find all headers
      while ((match = headerRegex.exec(text)) !== null) {
          const headerFull = match[0];
          const titleText = match[3].replace(/<[^>]+>/g, '').trim(); // Strip internal tags from title if any
          const matchIndex = match.index;
          
          // Content between last match (or start) and this header
          const content = text.substring(lastIndex, matchIndex).trim();
          
          if (content) {
              sections.push({ title: currentTitle, content });
          }
          
          // Update for next iteration
          currentTitle = titleText;
          // Clean the title: remove "A. ", "1. ", "Part 1:" etc if present, for cleaner UI
          currentTitle = currentTitle.replace(/^(?:[A-Z0-9]+\.|Part\s*\d+[:.]?)\s*/i, '');
          
          lastIndex = headerRegex.lastIndex;
      }
      
      // Push remaining content after the last header
      const remainingContent = text.substring(lastIndex).trim();
      if (remainingContent) {
          sections.push({ title: currentTitle, content: remainingContent });
      }
      
      // If no headers were found but it's HTML, treat whole as one block
      if (sections.length === 0 && text.trim().length > 0) {
          return [{ title: 'Overview', content: text }];
      }
      
      return sections;

  } else {
      // Robust Plain Text Parsing Strategy using Split
      // This handles "Market Dynamics#### A. Market Drivers" and "**A. Market Drivers**"
      
      // Escape special characters properly in regex
      const escapedMarkers = markers
        .map(m => m.replace(/[.*+?^${}()|[\\]/g, '\\$&').replace(/\s+/g, '\\s+'))
        .sort((a, b) => b.length - a.length);
  
      const markerGroup = escapedMarkers.join('|');
      
      const SPLITTER = '###SECTION_SPLIT###';
      // Match: (newlines/start) + (optional #/PART prefix) + (Marker) + (optional colon) + (newline/end)
      const textRegex = new RegExp(`(?:^|[\\r\\n]+|\\s+)(?:[#*\\s]*|PART\\s*\\d+[:.]?\\s*)(${markerGroup})(?:[:]*)(?:$|[\\r\\n]+|\\s+)`, 'gi');
      
      const processedText = text.replace(textRegex, (match) => {
          let cleanTitle = match.replace(/[#*:]/g, '').trim();
          cleanTitle = cleanTitle.replace(/^PART\\s*\\d+[:.]?\\s*/i, '');
          const matchedMarker = markers.find(m => cleanTitle.toLowerCase().includes(m.toLowerCase()));
          return `${SPLITTER}${matchedMarker || cleanTitle}${SPLITTER}`;
      });

      const parts = processedText.split(SPLITTER);
      const sections: { title: string; content: string }[] = [];
      
      if (parts[0] && parts[0].trim()) {
         sections.push({ title: 'Overview', content: parts[0].trim() });
      }
      
      for (let i = 1; i < parts.length; i += 2) {
          const title = parts[i];
          const content = parts[i + 1];
          if (title && content) {
             sections.push({ title: title.trim(), content: content.trim() });
          }
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

  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.thebrainyinsights.com';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: dict.home || 'Home', item: `${siteUrl}/${lang}` },
    { name: dict.reports || 'Reports', item: `${siteUrl}/${lang}/reports` },
    { name: report.title, item: `${siteUrl}/${lang}/reports/${slug}` }
  ]);

  // Markers used for fallback text parsing
  const dynamicsMarkers = [
      'Market Dynamics', 
      'Market Drivers', 'Market Restraints', 'Market Opportunities', 
      'Market Trends', 'Conclusion',
      'Regional Insights'
  ];
  const dynamicsSections = parseContent(report.marketDynamics, dynamicsMarkers);
  
  const playersMarkers = ['Key Market Players', 'Recent Strategic Developments', 'Company Profiles', 'Key Players'];
  const playersSections = parseContent(report.keyMarketPlayers, playersMarkers);
  
  // Extract Recent Strategic Developments from parsed sections if not in DB
  const parsedRecentDev = playersSections.find(s => 
      s.title.toLowerCase().includes('strategic development') || 
      s.title.toLowerCase().includes('recent development')
  );
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
        
        <div className="mt-6 mb-3">
          <h3 className="font-bold text-xl text-gray-900 border-b-2 border-indigo-200 pb-2">Market Introduction</h3>
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
             <div className="mt-6 mb-3">
               <h3 className="font-bold text-xl text-gray-900 border-b-2 border-indigo-200 pb-2">Recent Strategic Developments</h3>
             </div>
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
                alt={report.imageAlt || report.title} 
                className="w-3/4 h-auto mx-auto block rounded-lg shadow-sm border border-gray-200"
              />
            </div>
        )}

        <div className="mt-6 mb-3">
          <h3 className="font-bold text-xl text-gray-900 border-b-2 border-indigo-200 pb-2">Market Dynamics</h3>
        </div>
        
        {/* Market Dynamics */}
        {dynamicsSections.map((section, index) => {
            // Hide if it matches the main header we just displayed or Overview if empty
            if (['Market Dynamics', 'Regional Insights'].includes(section.title)) {
                // If it's effectively empty, skip
                if (!section.content || section.content.trim().length === 0) return null;
            }
            
            return (
            <div key={index} className="mb-4">
              {/* Show title if it's not "Overview" and not redundant main headers */}
              {section.title !== 'Overview' && 
               section.title !== 'Market Dynamics' && 
               section.title !== 'Regional Segment Analysis' && 
               section.title !== 'Regional Segmentation Analysis' && (
                  <h6 className="font-semibold text-base text-gray-900 mb-2">{section.title}</h6>
              )}
              <div className={section.title === 'Overview' ? "bg-white p-0" : "bg-amber-50 p-4 rounded-lg border-l-4 border-amber-400"}>
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
              <h3 className="font-bold text-xl text-gray-900 border-b-2 border-indigo-200 pb-2">Segment Analysis</h3>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                {/<[a-z][\s\S]*>/i.test(report.regionalInsights) ? (
                   <div 
                     className="text-base text-gray-700 leading-relaxed text-justify prose max-w-none"
                     dangerouslySetInnerHTML={{ __html: report.regionalInsights }}
                   />
                ) : (
                    <div className="text-base text-gray-700 leading-relaxed text-justify">
                      {report.regionalInsights.replace(/^[#*\s]*Regional Insights.*[\r\n]*/i, '').split('\n').map((line, i) => {
                          const trimmed = line.trim();
                          if (!trimmed) return <div key={i} className="h-2"></div>;
                          // Check if it's a "By ..." header (e.g., By Technology, By End-User)
                          if (trimmed.match(/^By\s+[A-Z]/)) {
                             return <h5 key={i} className="font-bold text-gray-900 mt-4 mb-2">{trimmed}</h5>;
                          }
                          // Indent others as list items
                          return <div key={i} className="pl-4 mb-1 relative before:content-['•'] before:absolute before:left-0 before:text-gray-400">{trimmed}</div>;
                      })}
                    </div>
                )}
            </div>
          </>
        )}

        <div className="mt-6 mb-3">
          <h3 className="font-bold text-xl text-gray-900 border-b-2 border-indigo-200 pb-2">Key Market Players</h3>
        </div>
        
        {/* Key Market Players */}
        {playersSections.map((section, index) => {
             // Skip Recent Strategic Developments if it's already displayed above
             if ((section.title.toLowerCase().includes('strategic development') || section.title.toLowerCase().includes('recent development')) && recentStrategicDevelopmentsContent) return null;

             return (
             <div key={index} className="bg-slate-50 p-5 rounded-lg border border-slate-200 mb-4">
                {/* Show title if not Overview and not duplicate of main header. */}
                {section.title && section.title !== 'Overview' && section.title !== 'Key Market Players' && (
                    <h5 className="font-bold text-lg text-gray-900 mb-3">{section.title}</h5>
                )}
                
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
          <p className="text-gray-600 max-w-md mx-auto">{dict.tocFallbackDesc || "Get a detailed chapter breakdown and page-by-page content structure delivered to your inbox."}</p>
        </div>
        <Link 
          href={`/${lang}/enquiry/request-toc/${report.reportId || report.sku || report.id}`}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-md hover:shadow-lg h-12 px-8 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold"
        >
          <DocumentTextIcon className="h-5 w-5" />
          {dict.tocFallbackButton || "Request Table of Contents"}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {report.schemaMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(report.schemaMarkup) }}
        />
      )}
      {report.breadcrumbData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(report.breadcrumbData) }}
        />
      )}
      {report.faqData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(report.faqData) }}
        />
      )}
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

              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight text-left mb-0">
                {report.title}
              </h1>
              {report.titleDescription && (
                <p className="text-lg md:text-xl lg:text-2xl font-normal text-indigo-200 mt-2 leading-tight">
                  {report.titleDescription.startsWith(':') ? report.titleDescription.substring(1).trim() : report.titleDescription}
                </p>
              )}
            </div>

            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="text-card-foreground flex flex-col gap-6 rounded-xl border bg-white/95 backdrop-blur-sm shadow-xl">
                <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 [.border-b]:pb-6">
                  <h4 className="text-lg font-semibold">{dict.reportDetails || 'Report Details'}</h4>
                </div>
                <div className="px-3 [&:last-child]:pb-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center"><DocumentTextIcon className="h-4 w-4 mr-2" />{dict.pages || 'Pages'}</span>
                    <span className="font-medium text-gray-900">120+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center"><ClockIcon className="h-4 w-4 mr-2" />{dict.published || 'Published'}</span>
                    <span className="font-medium text-gray-900" suppressHydrationWarning>{new Date(report.publishedDate).toLocaleDateString(lang, { month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center"><GlobeAltIcon className="h-4 w-4 mr-2" />{dict.coverage || 'Coverage'}</span>
                    <span className="font-medium text-gray-900">{dict.global || 'Global'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center"><UserGroupIcon className="h-4 w-4 mr-2" />{dict.format || 'Format'}</span>
                    <span className="font-medium text-gray-900">{dict.pdfExcel || 'PDF, Excel'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center"><TagIcon className="h-4 w-4 mr-2" />{dict.reportId || 'ID'}</span>
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
                reportId={report.reportId || report.sku || undefined} // Use reportId (TBI-XXXX) preferred
                reportDbId={report.id}
                reportTitle={report.title}
                lang={lang}
             />
          </div>
          
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 pb-8 safe-area-pb">
             <div className="flex gap-3">
                <Link 
                  href={`/${lang}/enquiry/request-sample/${report.reportId || report.sku || report.id}`}
                  className="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 py-3 px-4 rounded-lg font-bold shadow-sm text-sm text-center flex items-center justify-center"
                >
                   Request Sample
                </Link>
                <Link 
                   href={`/${lang}/buy-now/${report.reportId || report.sku || report.id}/single`}
                   className="flex-[2] bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-bold shadow-lg text-sm text-center flex items-center justify-center"
                >
                   {dict.buyNow} - ${report.singlePrice?.toLocaleString()}
                </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}