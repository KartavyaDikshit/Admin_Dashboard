import Link from 'next/link';
import Image from 'next/image';
import { getCategories, getReports, getFeaturedCategories, getFeaturedReports, getTestimonials } from '@/lib/data';
import { getDictionary } from '@/i18n/dictionaries';
import TrustedByStrip from '@/components/common/TrustedByStrip';
import HeroBackground from '@/components/common/HeroBackground';
import TestimonialsStrip from '@/components/common/TestimonialsStrip';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  
  // Fetch data
  const featuredCategories = await getFeaturedCategories(lang);
  const featuredReports = await getFeaturedReports(lang);
  const testimonials = await getTestimonials();
  
  // Fallback to regular fetch if no featured items found (to ensure UI isn't empty during dev)
  const displayCategories = featuredCategories.length > 0 ? featuredCategories : (await getCategories(lang)).slice(0, 8);
  const displayReports = featuredReports.length > 0 ? featuredReports : (await getReports(lang));

  return (
    <div className="flex flex-col gap-12 pb-12 bg-gray-50">
      {/* Hero Section */}
      <section className="bg-indigo-900 text-white py-20 relative overflow-hidden">
        <HeroBackground />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            {dict.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            {dict.heroSubtitle}
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto mb-10">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="w-full md:flex-1 bg-white rounded-full shadow-xl flex items-center px-6 py-4 transition-transform focus-within:scale-105">
                <svg className="w-6 h-6 text-gray-400 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder={dict.searchPlaceholder}
                  className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400 text-lg"
                />
              </div>
              <button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-full shadow-xl transition-all hover:scale-105 text-lg whitespace-nowrap">
                {dict.searchButton}
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 text-indigo-200 text-sm font-medium">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {dict.instantDownload}
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {dict.secureCheckout}
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Strip */}
      <TrustedByStrip title={dict.trustedBy} />

      {/* Featured Categories */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{dict.featuredCategoriesTitle}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {dict.featuredCategoriesDesc}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              href={`/${lang}/categories/${category.slug}`}
              className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-100 transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                 {/* Icon placeholder or check if category has icon */}
                 <svg className="w-6 h-6 text-indigo-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                 </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2">
                {category.description || "Comprehensive market insights and analysis."}
              </p>
            </Link>
          ))}
        </div>
        
        <div className="mt-10 text-center">
           <Link href={`/${lang}/categories`} className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-800">
              {dict.viewAllCategories} <span className="ml-2">→</span>
           </Link>
        </div>
      </section>

      {/* Featured Reports */}
      <section className="container mx-auto px-4 py-8 bg-white rounded-3xl shadow-sm border border-gray-100 my-8">
        <div className="text-center mb-12 pt-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{dict.featuredReportsTitle}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {dict.featuredReportsDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8">
          {displayReports.map((report) => (
            <Link
              key={report.id}
              href={`/${lang}/reports/${report.slug}`}
              className="flex flex-col group bg-gray-50 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              <div className="h-56 relative overflow-hidden">
                 {report.imageUrl ? (
                    <Image 
                      src={report.imageUrl} 
                      alt={report.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                      fill
                      unoptimized
                    />
                 ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-900 text-white p-6 text-center">
                       <span className="text-sm font-medium opacity-75">{dict.researchReport}</span>
                       <div className="mt-2 font-bold text-xl opacity-90">TBI</div>
                    </div>
                 )}
                 <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-900 uppercase tracking-wide shadow-sm">
                    {dict.reports}
                 </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4 text-xs text-gray-500 font-medium">
                   <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(report.publishedDate).toLocaleDateString(lang, { month: 'short', year: 'numeric' })}
                   </span>
                   <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                   <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      {report.pages || "100+"} {dict.pages}
                   </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                  {report.title}
                </h3>
                
                <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                  {report.summary || report.description}
                </p>
                
                <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between items-center">
                   <span className="text-lg font-bold text-gray-900">
                      {report.singlePrice ? `$${Number(report.singlePrice).toLocaleString()}` : dict.contactForPrice}
                   </span>
                   <span className="text-indigo-600 font-semibold text-sm group-hover:translate-x-1 transition-transform flex items-center">
                      {dict.readMore} <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                   </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials Strip */}
      {testimonials.length > 0 && (
        <TestimonialsStrip 
          testimonials={testimonials} 
          title="What Our Clients Say" 
          subtitle="Trusted by industry leaders worldwide for data-driven insights." 
        />
      )}
    </div>
  );
}
