import Link from 'next/link';
import { getDictionary } from '@/i18n/dictionaries';

export default async function About({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="hero-section py-24 lg:py-32">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="hero-container">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="hero-title">{dict.aboutTitle || 'About The Brainy Insights'}</h1>
            <p className="hero-subtitle mb-8">{dict.heroSubtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/${lang}/services`} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all h-11 rounded-md px-8 bg-white text-indigo-600 hover:bg-gray-100 shadow-md hover:shadow-lg">
                {dict.services} <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right ml-2 h-5 w-5" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </Link>
              <Link href={`/${lang}/contact`} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all h-11 rounded-md px-8 bg-indigo-600 text-white hover:bg-indigo-700 border border-transparent shadow-md hover:shadow-lg">
                {dict.contactUs}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{dict.whyChooseUsTitle || 'Our Values'}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{dict.aboutValuesIntro || 'These core values guide everything we do and shape how we serve our clients.'}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-card-foreground flex flex-col gap-6 rounded-xl border bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
              <div className="p-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-indigo-600/10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield h-12 w-12 text-indigo-600" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{dict.wcu8Title || 'Integrity & Reliability'}</h3>
                <p className="text-gray-600 leading-relaxed">{dict.wcu8Desc}</p>
              </div>
            </div>
            <div className="text-card-foreground flex flex-col gap-6 rounded-xl border bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
              <div className="p-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-indigo-600/10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart h-12 w-12 text-indigo-600" aria-hidden="true"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{dict.wcu10Title || 'Client-Centric Approach'}</h3>
                <p className="text-gray-600 leading-relaxed">{dict.wcu10Desc}</p>
              </div>
            </div>
            <div className="text-card-foreground flex flex-col gap-6 rounded-xl border bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
              <div className="p-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-indigo-600/10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe h-12 w-12 text-indigo-600" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{dict.wcu6Title || 'Expertise & Excellence'}</h3>
                <p className="text-gray-600 leading-relaxed">{dict.wcu6Desc}</p>
              </div>
            </div>
            <div className="text-card-foreground flex flex-col gap-6 rounded-xl border bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
              <div className="p-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-indigo-600/10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lightbulb h-12 w-12 text-indigo-600" aria-hidden="true"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{dict.wcuInnovationTitle || 'Innovation & Agility'}</h3>
                <p className="text-gray-600 leading-relaxed">{dict.wcuInnovationDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{dict.researchMethodologyTitle}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{dict.researchMethodologyText}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-card-foreground flex flex-col gap-6 rounded-xl border bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="p-8">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-indigo-600/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search h-12 w-12 text-indigo-600" aria-hidden="true"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{dict.methodologyItem1Title || 'Comprehensive Data Procurement'}</h3>
                    <p className="text-gray-600 leading-relaxed">{dict.methodologyItem1Desc}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-card-foreground flex flex-col gap-6 rounded-xl border bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="p-8">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-indigo-600/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-database h-12 w-12 text-indigo-600" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{dict.methodologyItem2Title || 'Robust Data Analysis & Synthesis'}</h3>
                    <p className="text-gray-600 leading-relaxed">{dict.methodologyItem2Desc}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-card-foreground flex flex-col gap-6 rounded-xl border bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="p-8">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-indigo-600/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain h-12 w-12 text-indigo-600" aria-hidden="true"><path d="M12 18V5"></path><path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4"></path><path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5"></path><path d="M17.997 5.125a4 4 0 0 1 2.526 5.77"></path><path d="M18 18a4 4 0 0 0 2-7.464"></path><path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517"></path><path d="M6 18a4 4 0 0 1-2-7.464"></path><path d="M6.003 5.125a4 4 0 0 0-2.526 5.77"></path></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{dict.methodologyItem3Title || 'Balanced Qualitative & Quantitative Insights'}</h3>
                    <p className="text-gray-600 leading-relaxed">{dict.methodologyItem3Desc}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-card-foreground flex flex-col gap-6 rounded-xl border bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="p-8">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-indigo-600/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chart-pie h-12 w-12 text-indigo-600" aria-hidden="true"><path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"></path><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{dict.methodologyItem4Title || 'Expert Validation & Forecasting'}</h3>
                    <p className="text-gray-600 leading-relaxed">{dict.methodologyItem4Desc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2 tracking-tight">{dict.aboutTitle}</h2>
            <div className="prose max-w-none text-gray-700 leading-relaxed text-justify whitespace-pre-line">
              {dict.aboutText}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}