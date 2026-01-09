import Link from 'next/link';
import { getDictionary } from '@/i18n/dictionaries';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.thebrainyinsights.com';

  return {
    title: 'About The Brainy Insights - Market Research & Consulting',
    description: 'The Brainy Insights is a global market research and consulting firm delivering accurate, actionable data-driven insights.',
    alternates: {
      canonical: `${siteUrl}/${lang}/about`,
    },
  };
}

export default async function About({ params }: Props) {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-indigo-900 py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 opacity-90"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500 opacity-20 blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                    Empowering <br/><span className="text-indigo-300">Strategic Decisions</span>
                </h1>
                <p className="text-xl text-indigo-100 mb-8 mx-auto">
                    We provide accurate, actionable, and data-driven insights that help organizations optimize performance and unlock sustainable growth.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href={`/${lang}/services`} className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-indigo-900 rounded-lg font-bold hover:bg-indigo-50 transition-all shadow-lg text-lg">
                    Our Services
                  </Link>
                  <Link href={`/${lang}/contact`} className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-transparent border-2 border-indigo-400 text-white rounded-lg font-bold hover:bg-indigo-800/50 transition-all text-lg">
                    Contact Us
                  </Link>
                </div>
            </div>
        </div>
      </section>

      {/* Expanded About Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
               <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">About Brainy Insights</h2>
                <div className="prose max-w-none text-gray-700 leading-relaxed text-justify space-y-4">
                    <p>
                        Brainy Insights is a global market research and consulting firm committed to delivering accurate, actionable, and data-driven insights that empower organizations to make confident strategic decisions. By integrating advanced data analytics, industry expertise, and a rigorous research framework, we help businesses enhance market intelligence, optimize performance, and unlock sustainable growth opportunities.
                    </p>
                    <p>
                        Our core strength lies in our robust forecasting, estimation, and analytical models, which are designed to deliver high-quality and reliable outputs within accelerated timelines. We focus on transforming complex datasets into clear, meaningful insights that support business planning, investment decisions, product development, and market entry strategies.
                    </p>
                    <p>
                        Brainy Insights offers a comprehensive portfolio of syndicated and customized market research reports. Our syndicated research repository spans a wide range of industries, sectors, and sub-segments, providing in-depth coverage across global, regional, and country-level markets. These reports are designed to reflect evolving market dynamics, emerging technologies, and competitive developments.
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-start">
                <div className="prose max-w-none text-gray-700 leading-relaxed text-justify">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Expertise</h3>
                    <p>
                        In addition to syndicated studies, we specialize in customized research solutions tailored to the specific needs of our clients. Whether organizations are planning geographic expansion, launching new products, assessing competitive positioning, or evaluating emerging opportunities, our bespoke research offerings are precisely aligned with client objectives and business challenges.
                    </p>
                    <p className="mt-4">
                        Our market research reports are developed through a comprehensive blend of primary and secondary research methodologies. Each report includes a detailed market overview, market sizing and forecasting, competitive landscape analysis, profiling of key players, evaluation of major trends, growth drivers, restraints, opportunities, and assessment of the current and future market scenario.
                    </p>
                    <p className="mt-4">
                        Brainy Insights is supported by a dedicated team of highly experienced analysts, domain specialists, and consultants. Our experts continuously track industry developments, regulatory changes, technological advancements, and macroeconomic indicators. By systematically analyzing and interpreting these factors, we deliver up-to-date insights and forward-looking forecasts that help clients stay competitive in dynamic global markets.
                    </p>
                </div>
                
                <div className="space-y-6">
                    <div className="bg-indigo-50 p-6 rounded-xl border-l-4 border-indigo-600">
                        <h3 className="text-xl font-bold text-indigo-900 mb-2">Our Vision</h3>
                        <p className="text-indigo-800">To be a trusted global provider of market intelligence, delivering insights that enable confident decisions and sustainable growth.</p>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-600">
                        <h3 className="text-xl font-bold text-purple-900 mb-2">Our Mission</h3>
                        <p className="text-purple-800">To deliver accurate, timely, and actionable market research through advanced analytics, domain expertise, and a client-focused approach.</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">These core values guide everything we do and shape how we serve our clients.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
                 { title: "Integrity & Transparency", desc: "We conduct research with honesty, ethical rigor, and full transparency in data sourcing and analysis.", icon: "shield" },
                 { title: "Accuracy & Quality", desc: "We prioritize precision, validation, and consistency to ensure dependable, decision-ready insights.", icon: "check" },
                 { title: "Client-Centricity", desc: "We tailor every solution to our clients’ objectives, ensuring relevance, impact, and measurable value.", icon: "users" },
                 { title: "Expertise & Knowledge", desc: "Our analysts bring deep industry understanding and continuously updated market intelligence.", icon: "brain" },
                 { title: "Innovation & Rigor", desc: "We leverage advanced tools, methodologies, and forward-thinking analytics to stay ahead of market shifts.", icon: "lightbulb" },
                 { title: "Timeliness", desc: "We respect our clients’ timelines and deliver high-quality outputs within accelerated schedules.", icon: "clock" },
                 { title: "Accountability", desc: "We take full responsibility for our work, outcomes, and long-term client relationships.", icon: "user-check" },
                 { title: "Security", desc: "We safeguard client information and proprietary data with strict security and compliance standards.", icon: "lock" },
             ].map((value, idx) => (
                 <div key={idx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                     <h3 className="font-bold text-lg text-gray-900 mb-2">{value.title}</h3>
                     <p className="text-sm text-gray-600 leading-relaxed">{value.desc}</p>
                 </div>
             ))}
          </div>
          <div className="mt-8 text-center">
             <div className="inline-block bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-md mx-auto">
                 <h3 className="font-bold text-lg text-gray-900 mb-2">Continuous Learning</h3>
                 <p className="text-sm text-gray-600 leading-relaxed">We foster a culture of learning to adapt quickly to evolving industries and technologies.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Research Methodology Snippet */}
      <section className="py-20 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Research Methodology</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  This research combines primary interviews with 500+ industry experts, secondary data analysis from 200+ sources, and proprietary market modeling to provide comprehensive insights into the market landscape.
              </p>
              <Link href={`/${lang}/research-methodology`} className="inline-flex items-center font-bold text-indigo-600 hover:text-indigo-800 transition-colors text-lg">
                  Read more <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </Link>
          </div>
      </section>

    </div>
  );
}
