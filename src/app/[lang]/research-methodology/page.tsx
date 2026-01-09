import { getDictionary } from '@/i18n/dictionaries';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.thebrainyinsights.com';

  return {
    title: 'Research Methodology | The Brainy Insights',
    description: 'Learn about our scientific and systematic research methodologies, data procurement, analysis, and validation processes.',
    alternates: {
      canonical: `${siteUrl}/${lang}/research-methodology`,
    },
  };
}

export default async function ResearchMethodology({ params }: Props) {
  const { lang } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-900 py-16 text-center text-white">
        <h1 className="text-3xl md:text-4xl font-bold">Research Methodology</h1>
        <p className="mt-4 text-indigo-200 text-lg max-w-2xl mx-auto">Scientific and systematic approach to actionable market insights.</p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 prose max-w-none text-gray-700 leading-relaxed text-justify">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Research Methodology – The Brainy Insights</h2>
            <p>
                Research plays a critical role in enabling efficient and effective marketing strategies. In today’s highly competitive business environment, organizations require timely and accurate information across all industry verticals—covering customer preferences, market demand, competitive dynamics, industry trends, and distribution channels. As businesses operate in an ever-changing marketplace, this information must be continuously updated to support informed decision-making.
            </p>
            <p>
                Brainy Insights adopts scientific and systematic research methodologies to deliver actionable market insights and comprehensive industry analysis that drive business success. Our approach involves in-depth market evaluation at a granular level, supported by advanced statistical tools that ensure accuracy, reliability, and precision in data analysis.
            </p>
            <p>
                Our research reports integrate both quantitative and qualitative dimensions of market analysis. Qualitative research is fundamental to understanding customer needs, preferences, usage behavior, and consumption patterns across specific industries. It helps marketers and investors gain deeper insight into customer perceptions, evaluate product concepts and designs, assess service offerings, define marketing challenges, and identify emerging opportunities.
            </p>
            <p>
                Quantitative research focuses on structured data collection through surveys, interviews, email interactions, and pilot studies. This approach validates hypotheses developed during qualitative research, identifies empirical data patterns using statistical techniques, and supports accurate market estimation and forecasting.
            </p>
            <p>
                Brainy Insights delivers comprehensive research and analysis based on factual insights obtained through interviews with CXOs, industry experts, and global specialists, complemented by secondary data from trusted sources. Our analysts and industry specialists design analytical frameworks and statistical models that convert raw data into actionable intelligence.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Market Research Process</h3>
            
            <h4 className="font-bold text-gray-900 mt-6">Data Procurement</h4>
            <p>
                This phase involves the systematic collection of market data and related information through multiple sources and research procedures. The process includes extensive research using purchased databases, primary research initiatives, and secondary research sources.
            </p>

            <h4 className="font-bold text-gray-900 mt-6">Purchased Databases</h4>
            <p>
                Purchased databases play a critical role in estimating market size and understanding competitive landscapes. These include organizational databases such as D&B Hoovers and Bloomberg for financial and competitive analysis, industry databases such as Statista and Factiva for market insights, and data obtained from third-party vendors covering import-export statistics, business trade information, and demographic-based product usage rates.
            </p>

            <h4 className="font-bold text-gray-900 mt-6">Primary Research</h4>
            <p>
                Primary research strengthens and validates all findings presented in our reports. It includes telephonic interviews, email interactions, face-to-face discussions, and structured surveys with raw material suppliers, manufacturers, distributors, consultants, and industry experts. These engagements provide insights into market size, growth patterns, customer behavior, and competitive dynamics.
            </p>
            <p>
                Surveys are designed internally by our analyst team and conducted across relevant industry stakeholders such as doctors, pharmacists, surgeons, nurses, engineers, or technical experts depending on the domain. This enables 360-degree market analysis, identification of key target audiences, and formulation of effective market strategies.
            </p>

            <h4 className="font-bold text-gray-900 mt-6">Secondary Research</h4>
            <p>
                Secondary research involves data collection from non-profit organizations such as the World Bank and WHO, company filings, investor presentations, annual reports, government publications, blogs, articles, white papers, and statistical databases. Product mapping techniques are applied to estimate segment-wise revenues and overall market size. Supply-side and demand-side data across the value chain are also analyzed.
            </p>

            <h5 className="font-semibold text-gray-800 mt-4">Supply-Side Analysis</h5>
            <p>
                Supply-side analysis includes estimating penetration rates, evaluating pricing structures, assessing internal and external substitutes, and analyzing year-on-year sales trends through expert interviews.
            </p>

            <h5 className="font-semibold text-gray-800 mt-4">Demand-Side Analysis</h5>
            <p>
                Demand-side analysis focuses on evaluating product penetration levels, usage rates, historical growth trends, and evolving industry dynamics to assess market potential.
            </p>

            <h4 className="font-bold text-gray-900 mt-6">In-House Library</h4>
            <p>
                The Brainy Insights maintains a robust in-house repository of qualitative and quantitative data across multiple industries. This includes historical databases, internal audit reports, and archived research materials, which are updated regularly to reflect changing market conditions.
            </p>

            <h4 className="font-bold text-gray-900 mt-6">Market Estimation & Forecasting</h4>
            <p>
                In scenarios where limited or no raw data is available, our analysts apply advanced estimation techniques such as demographic and psychographic segmentation, evaluation of micro- and macro-economic indicators, and assessment of industry-specific performance metrics.
            </p>

            <h4 className="font-bold text-gray-900 mt-6">Data Synthesis</h4>
            <p>
                This stage involves consolidating and mapping data obtained from multiple sources, identifying inconsistencies, and ensuring data coherence. Scientific synthesis techniques enable contextual interpretation and strategic alignment.
            </p>

            <h4 className="font-bold text-gray-900 mt-6">Data Screening</h4>
            <p>
                Data screening involves scrutinizing primary research data to detect errors, missing values, and inconsistencies. Repeated quality checks and validation cycles ensure data accuracy and reliability before integration.
            </p>

            <h4 className="font-bold text-gray-900 mt-6">Data Integration</h4>
            <p>
                Post screening, data from multiple studies and internal databases are integrated using top-down and bottom-up approaches to develop a comprehensive market perspective.
            </p>

            <h4 className="font-bold text-gray-900 mt-6">Market Deduction & Formulation</h4>
            <p>
                At this stage, data points are allocated to appropriate market segments. Expert judgment and analytical modeling are used to finalize market sizing, supported by interpolation and extrapolation techniques for trend analysis and forecasting.
            </p>

            <h4 className="font-bold text-gray-900 mt-6">Data Validation & Market Feedback</h4>
            <p>
                Validation is a critical step involving interviews and expert panel discussions with CXOs, VPs, purchasing managers, technical experts, end-users, investment bankers, and industry consultants. Findings are revalidated across major geographic regions to ensure accuracy and global relevance.
            </p>
        </div>
      </div>
    </div>
  );
}
