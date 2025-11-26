import { getDictionary } from '@/i18n/dictionaries';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | The Brainy Insights',
  description: 'Learn more about The Brainy Insights, our mission, vision, and why you should choose us for your market research and consulting needs.',
  keywords: ['About The Brainy Insights', 'Market Research Company', 'Consulting Firm', 'Mission and Vision', 'Business Intelligence'],
};

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = getDictionary(lang);

  const whyChooseUs = [
    { title: dict.wcu1Title, desc: dict.wcu1Desc, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { title: dict.wcu2Title, desc: dict.wcu2Desc, icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { title: dict.wcu3Title, desc: dict.wcu3Desc, icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
    { title: dict.wcu4Title, desc: dict.wcu4Desc, icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
    { title: dict.wcu5Title, desc: dict.wcu5Desc, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { title: dict.wcu6Title, desc: dict.wcu6Desc, icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    { title: dict.wcu7Title, desc: dict.wcu7Desc, icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { title: dict.wcu8Title, desc: dict.wcu8Desc, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { title: dict.wcu9Title, desc: dict.wcu9Desc, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { title: dict.wcu10Title, desc: dict.wcu10Desc, icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero/Intro Section */}
      <div className="bg-gradient-to-b from-gray-900 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{dict.aboutTitle}</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed whitespace-pre-line">
            {dict.aboutText.split('\n\n')[0]}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Extended About Text */}
        <div className="max-w-4xl mx-auto mb-20 text-gray-700 space-y-6 leading-relaxed text-lg">
           {dict.aboutText.split('\n\n').slice(1).map((para, idx) => (
             <p key={idx}>{para}</p>
           ))}
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h2 className="text-3xl font-bold text-blue-900 mb-4">{dict.missionTitle}</h2>
            <p className="text-blue-800 text-lg leading-relaxed">
              {dict.missionText}
            </p>
          </div>

          <div className="bg-green-50 rounded-2xl p-8 border border-green-100 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            <h2 className="text-3xl font-bold text-green-900 mb-4">{dict.visionTitle}</h2>
            <p className="text-green-800 text-lg leading-relaxed">
              {dict.visionText}
            </p>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">{dict.whyChooseUsTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}