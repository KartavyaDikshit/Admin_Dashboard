import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const url = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL

const prisma = new PrismaClient({
  datasourceUrl: url,
})

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ & /g, ' and ')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@fiormarkets.com' },
    update: {},
    create: {
      email: 'admin@fiormarkets.com',
      username: 'superadmin',
      firstName: 'Super',
      lastName: 'Admin',
      password: hashedPassword,
      role: 'SUPERADMIN',
      permissions: {
        content_management: true,
        ai_management: true,
        user_management: true,
        analytics: true,
        system_settings: true
      },
      status: 'ACTIVE'
    }
  })

  console.log('👤 Created admin user:', admin.email)

  await prisma.category.deleteMany({});
  console.log('🔥 Deleted all existing categories');

  // Create sample categories
  const newCategories = [
    {
      title_en: 'Healthcare',
      shortcode: 'HC',
      description_en: 'Comprehensive Healthcare market research reports covering key trends, market size, and growth opportunities.',
      seoKeywords: ['healthcare market research', 'healthcare industry analysis', 'medical device market', 'pharmaceutical market'],
      metaTitle: 'Healthcare Market Research Reports | Fior Markets',
      metaDescription: 'Leading Healthcare market research reports with comprehensive global market analysis.',
    },
    {
      title_en: 'Information Technology & Semiconductors',
      shortcode: 'ITS',
      description_en: 'In-depth Information Technology & Semiconductors market research reports on software, hardware, and semiconductor trends.',
      seoKeywords: ['IT market research', 'semiconductor industry analysis', 'software market', 'hardware market'],
      metaTitle: 'Information Technology & Semiconductors Market Research Reports | Fior Markets',
      metaDescription: 'Leading Information Technology & Semiconductors market research reports with comprehensive global market analysis.',
    },
    {
      title_en: 'Machinery & Equipment',
      shortcode: 'ME',
      description_en: 'Detailed Machinery & Equipment market research reports covering industrial machinery, construction equipment, and manufacturing trends.',
      seoKeywords: ['machinery market research', 'equipment industry analysis', 'industrial machinery', 'construction equipment'],
      metaTitle: 'Machinery & Equipment Market Research Reports | Fior Markets',
      metaDescription: 'Leading Machinery & Equipment market research reports with comprehensive global market analysis.',
    },
    {
      title_en: 'Aerospace & Defence',
      shortcode: 'AD',
      description_en: 'Exclusive Aerospace & Defence market research reports on aviation, space, and military technologies.',
      seoKeywords: ['aerospace market research', 'defence industry analysis', 'aviation market', 'space technology'],
      metaTitle: 'Aerospace & Defence Market Research Reports | Fior Markets',
      metaDescription: 'Leading Aerospace & Defence market research reports with comprehensive global market analysis.',
    },
    {
      title_en: 'Chemicals & Materials',
      shortcode: 'CM',
      description_en: 'Extensive Chemicals & Materials market research reports covering specialty chemicals, polymers, and advanced materials.',
      seoKeywords: ['chemicals market research', 'materials industry analysis', 'specialty chemicals', 'polymers'],
      metaTitle: 'Chemicals & Materials Market Research Reports | Fior Markets',
      metaDescription: 'Leading Chemicals & Materials market research reports with comprehensive global market analysis.',
    },
    {
      title_en: 'Food & Beverages',
      shortcode: 'FB',
      description_en: 'Thorough Food & Beverages market research reports on consumer food, alcoholic beverages, and non-alcoholic beverages.',
      seoKeywords: ['food market research', 'beverages industry analysis', 'consumer food', 'alcoholic beverages'],
      metaTitle: 'Food & Beverages Market Research Reports | Fior Markets',
      metaDescription: 'Leading Food & Beverages market research reports with comprehensive global market analysis.',
    },
    {
      title_en: 'Agriculture',
      shortcode: 'AG',
      description_en: 'Comprehensive Agriculture market research reports covering crop production, livestock, and agricultural technology.',
      seoKeywords: ['agriculture market research', 'farming industry analysis', 'crop production', 'agritech'],
      metaTitle: 'Agriculture Market Research Reports | Fior Markets',
      metaDescription: 'Leading Agriculture market research reports with comprehensive global market analysis.',
    },
    {
      title_en: 'Energy & Power',
      shortcode: 'EP',
      description_en: 'In-depth Energy & Power market research reports on renewable energy, oil & gas, and power generation.',
      seoKeywords: ['energy market research', 'power industry analysis', 'renewable energy', 'oil & gas'],
      metaTitle: 'Energy & Power Market Research Reports | Fior Markets',
      metaDescription: 'Leading Energy & Power market research reports with comprehensive global market analysis.',
    },
    {
      title_en: 'Consumer Goods',
      shortcode: 'CG',
      description_en: 'Detailed Consumer Goods market research reports covering personal care, home care, and consumer electronics.',
      seoKeywords: ['consumer goods market research', 'retail industry analysis', 'personal care', 'home care'],
      metaTitle: 'Consumer Goods Market Research Reports | Fior Markets',
      metaDescription: 'Leading Consumer Goods market research reports with comprehensive global market analysis.',
    },
    {
      title_en: 'Automotive & Transportation',
      shortcode: 'AT',
      description_en: 'Exclusive Automotive & Transportation market research reports on electric vehicles, autonomous driving, and logistics.',
      seoKeywords: ['automotive market research', 'transportation industry analysis', 'electric vehicles', 'autonomous driving'],
      metaTitle: 'Automotive & Transportation Market Research Reports | Fior Markets',
      metaDescription: 'Leading Automotive & Transportation market research reports with comprehensive global market analysis.',
    },
  ];

  const categoryUpserts = newCategories.map((categoryData, index) => {
    const slug = generateSlug(categoryData.title_en);
    return prisma.category.upsert({
      where: { shortcode: categoryData.shortcode },
      update: {
        name: categoryData.title_en,
        shortcode: categoryData.shortcode,
        description: categoryData.description_en,
        seoKeywords: categoryData.seoKeywords,
        metaTitle: categoryData.metaTitle,
        metaDescription: categoryData.metaDescription,
        slug: slug,
      },
      create: {
        name: categoryData.title_en,
        shortcode: categoryData.shortcode,
        description: categoryData.description_en,
        seoKeywords: categoryData.seoKeywords,
        metaTitle: categoryData.metaTitle,
        metaDescription: categoryData.metaDescription,
        slug: slug,
        featured: true,
        sortOrder: index + 1,
        status: 'PUBLISHED',
      },
    });
  });

  const categories = await Promise.all(categoryUpserts);

  console.log('📁 Created categories:', categories.length)

  // Create AI prompt templates
  const prompt1Content = `Generate an authoritative and insightful market research summary on the {title} with a strong focus on data-driven storytelling and strategic relevance. The content should be structured to meet the needs of C-level decision-makers, investors, and analysts, while being optimized for search engines. Make sure the word count remains under 300 words. Follow the structure below and remember to provide the content in paragraph format only, do not provide bullet point lists.

IMPORTANT: You MUST format your output entirely in HTML. Use <b>, <strong>, <h3>, <ul>, <li>, and <p> tags appropriately. DO NOT output any markdown (e.g. no **, no ##, no \`\`\`).

1.	Compelling Market Opening:
	Begin with: “The {title} was valued at USD XX Billion in {currentYear}…”
	Clearly mention the market size in {currentYear}, forecasted market size for {forecastEndYear}, and CAGR during the {forecastPeriod} period.
	Ensure all values are precise and use up-to-date calculations or estimates from reliable data sources, avoid using numbers from market research companies.
2.	Market Definition and Overview:
	Provide a concise, SEO-optimized definition of the {title}.
3.	Current Market Momentum & Relevance:
	Explain why this market is attracting attention now. 
4.	SEO and Writing Guidelines:
	Use clear, concise, and informative language tailored for a professional audience.
	Avoid filler phrases like “in conclusion,” “in summary,” or generic clichés.
	Do not cite unnamed research firms. Only use sources with public credibility or institutional authority.
	Ensure content includes primary and secondary keywords naturally to boost SEO.`;

  const prompt2Content = `now create content for this section for {title} 
Objective: Generate a compelling "Market Dynamics" section for the {title} report. The goal is to provide a balanced, data-rich analysis of the factors driving, restraining, and creating opportunities in the market. Focus on recent data (2024–2025), industry shifts, and actionable insights.

IMPORTANT: You MUST format your output entirely in HTML. Use <b>, <strong>, <h3>, <ul>, <li>, and <p> tags appropriately. DO NOT output any markdown (e.g. no **, no ##, no \`\`\`).

________________________________________
🔹 A. Market Drivers
•	List 2–4 key growth drivers that are accelerating the market’s expansion.
•	Support each driver with quantitative data, market behavior, or recent industry developments (e.g., “As per WHO, digital health tool adoption grew by 68% from 2021 to {currentYear} globally.”).
•	Focus on relevant factors like:
o	Technological innovations
o	Regulatory tailwinds
o	Rising end-user demand
o	ESG/sustainability initiatives
o	Enterprise digitization/OEM adoption
•	Emphasize why these drivers matter now and how they align with larger macroeconomic or industry-specific transformations.
________________________________________
🔹 B. Market Restraints
•	Identify 1–3 significant market restraints or barriers to growth.
•	Use specific, data-driven examples (e.g., “Limited data interoperability in AI systems has caused delays in clinical deployment in 42% of U.S. hospitals.”).
•	Focus on challenges like:
o	Regulatory uncertainties
o	High upfront costs
o	Technical or infrastructure limitations
o	Skilled labor shortages
o	Market fragmentation or compliance complexities
________________________________________
🔹 C. Market Opportunities
•	Highlight emerging opportunities that could unlock future growth.
•	Provide insights on:
o	Untapped regions or demographics
o	Evolving customer behavior
o	Adjacent industry convergence (e.g., AI + cybersecurity)
o	Public or private funding incentives
o	Innovation pipelines or new business models
•	Where possible, use forward-looking insights and cite government initiatives, venture capital trends, or innovation ecosystems.
________________________________________
SEO and Style Guidelines:
•	Maintain a professional yet accessible tone suitable for business leaders and analysts.
•	Integrate target and secondary keywords naturally within content.
•	Avoid vague language or unverified predictions.
•	Do not cite generic market research firms or use placeholder phrases like “expected to grow exponentially.”
•	Keep paragraphs concise and logically connected for enhanced readability and SEO.`;

  const prompt3Content = `now create content for this section for {title} 
Instructions: Write a detailed "Regional Insights" section for the {title} report. 

IMPORTANT: You MUST format your output entirely in HTML. Use <b>, <strong>, <h3>, <ul>, <li>, and <p> tags appropriately. DO NOT output any markdown (e.g. no **, no ##, no \`\`\`).

You must cover at least 3 major regions (e.g., North America, Europe, Asia-Pacific) and highlight the dominant region. Support each section with facts, figures, trends, and regulations. Include current and forecasted market size, CAGR, and key growth factors that are relevant to the region and {title}. The language should appeal to executives and analysts, while supporting SEO goals with keyword-rich, authoritative content.

________________________________________
📌 Prompt Structure and Instructions:
🔷 Region Name
•	Start with market sizing:
“The Region name ({title}) market was valued at USD XX Billion in {currentYear} and is forecasted to reach USD XX Billion by {forecastEndYear}, registering a CAGR of XX.X% during the forecast period.”
•	Follow with region-specific drivers such as:
o	Government regulations or funding (e.g., FDA approvals, Infrastructure Bill)
o	High technology adoption rate
o	Consumer behavior or industry maturity
o	Strong presence of leading manufacturers or startups
o	Investment in R&D or digital transformation
•	Mention one leading country from the selected region (e.g., U.S., Canada) and their roles, when relevant.
•	Include validated data points from sources like U.S. Department of Commerce, NIH, FDA, StatCan, etc.
✅ SEO and Style Guidelines:
•	Use region + {title} in headings and body copy (e.g., “North America Electric Vehicle Market”).
•	Maintain a formal, analytical tone suitable for senior decision-makers.
•	Ensure each region’s narrative is unique and avoids repetition across sections.
•	Integrate primary and secondary keywords naturally.
•	Avoid vague phrases and unverified projections; use credible data points only.
•	No citation of generic market research firms.

PART2
AI Prompt for “Market Segmentation” Section
Copy from Here:
now create content for this section for {title} 
Objective: Generate the complete segmentation structure for the {title} report, followed by detailed insights into each major segment. The output must be structured, exhaustive, and tailored to appeal to decision-makers while remaining optimized for SEO.
________________________________________
🔷 PART 1: Segmentation Structure (List Format Only)
Instructions:
Generate a clean, bullet-point list of all major segments and sub-segments relevant to {title}. Use the following structure:
•	Start each primary segment category with:
• By [Segment Category]
•	List all relevant sub-segments below as indented bullets.
•	Ensure the segmentation reflects the real structure and dynamics of the {title}, including factors like product type, application, deployment, end user, distribution channel, technology, or geography—whichever apply.
•	Do not include explanations, analysis, or market size data here.
•	Keep the list exhaustive but concise—no fluff, just structured classification.
•	Make sure segments are customized to {title}—not generic.
Example Format to Follow (for AI to replicate):
• By Product Type  
  • Sub-segment 1  
  • Sub-segment 2  
  • Sub-segment 3  
• By Application  
  • Sub-segment 1  
  • Sub-segment 2  
• By End User  
  • Sub-segment 1  
  • Sub-segment 2  
  • Sub-segment 3
PART 2: Segment-Level Analysis (With Data)
Based on the segmentation section generated, I would like you to create me the report title:
Format: {title} Market Size By Primary Category 1(sub-segment list in comma separated format), By Primary Category 1(sub-segment list in comma separated format), Regions, Global Industry Analysis, Share, Growth, Trends, and Forecast {currentYear} to {forecastEndYear}
Only generate for first 2 Primary Category skip others
Example: Quantum Encryption Market Size by Component (Quantum Key Distribution (QKD) Systems, Quantum Random Number Generators, Others), Application (Government & Defence, Banking & Financial Services, Healthcare, Others), Regions, Global Industry Analysis, Share, Growth, Trends, and Forecast {currentYear} to {forecastEndYear}

PART 3: Segment-Level Analysis (With Data)
Instructions:
For maximum of 3 and minimum of 2 primary segment category defined above (e.g., By Product Type, By Application), do not provide content on Regional section, generate a structured analysis using the format below:
1. Introduction Format (repeat for each major segment):
•	Begin with the line:
“By [Segment Category], the {title} market was segmented into…”
•	List the sub-segments in a short sentence form.
2. Highlight the Key Segments:
•	Identify:
o	The largest sub-segment (by {currentYear} market share)
•	Begin with the line:
“The [largest sub-segment], dominated the {title} market , with a market share of around xx% in {currentYear}.”
4. Explain the Growth Drivers (qualitative + data):
•	Write in paragraph format.
•	Provide key drivers that are fueling demand or adoption of the largest sub-segment.
•	Include quantitative evidence or industry validation (e.g., “Rising demand from SMEs led to a 42% increase in deployment of cloud-based solutions in {currentYear}”).
•	Focus on technology adoption, regulations, user trends, cost dynamics, performance, and ease of implementation, depending on segment type.
________________________________________
✅ SEO and Writing Guidelines:
•	Include primary and long-tail keywords naturally (e.g., “[cloud-based HR software], [industrial robotics in automotive sector], [digital payment in retail]”).
•	Maintain a professional, structured tone aimed at analysts, executives, and investors.
•	Avoid repetitive language or vague claims.
•	Do not use generic summaries or cite unnamed research firms.`;

  const prompt4Content = `now create content for this section for {title} 

IMPORTANT: You MUST format your output entirely in HTML. Use <b>, <strong>, <h3>, <ul>, <li>, and <p> tags appropriately. DO NOT output any markdown (e.g. no **, no ##, no \`\`\`).

PART 1: Some of the Key Market Players
Instructions:
•	Generate a bullet-point list of the Top 10 companies operating in the {title}.
•	Only include verified, real companies actively involved in the industry. Use company names that are:
o	Publicly traded or widely recognized in the space
o	Known for manufacturing, supplying, or innovating in this domain
o	Covered in reputable news, industry sources, or regulatory filings
•	If real companies are unavailable, omit placeholders like “Company1” or “XYZ Corp.” Do not use hypothetical names.
•	The list should be rank-neutral (i.e., not in order of market share unless verified).
Format Example:
• Siemens AG  
• General Electric Company  
• Johnson Controls International  
• Honeywell International Inc.  
• ABB Ltd.  
• Schneider Electric SE  
• 3M Company  
• Rockwell Automation, Inc.  
• Mitsubishi Electric Corporation  
• Emerson Electric Co.

PART 2: Recent Strategic Developments
Instructions:
•	Provide a bullet list of 1–2 real, recent ({currentYear} only) developments from companies listed above or other leading players in {title}.
•	Each item should follow this format:
“[Month] {currentYear}: [Company] introduced [Product/Partnership/Acquisition] to [Intent/Outcome].”
•	Ensure developments are:
o	Specific and relevant to the {title}
o	Based on real-world events: product launches, partnerships, funding rounds, M&As, tech upgrades, regulatory wins, or expansions
•	Avoid vague, unverified, or undated statements. No generic headlines like "Company expanded product portfolio."
Format Example:
• February {currentYear}: Honeywell launched its next-gen building automation system to improve energy efficiency in smart commercial spaces.  
• March {currentYear}: Schneider Electric partnered with Microsoft to enhance cloud-based sustainability monitoring in industrial operations.  
SEO and Professional Guidelines:
•	Integrate relevant {title} keywords (e.g., “Key players in the renewable energy storage market include…”).
•	Avoid filler phrases like “many companies are involved.”
•	Use a credible tone suited for executives, analysts, and institutional stakeholders.
•	Validate company names and developments against real news or press releases.
•	Never cite or fabricate market research firm names or unverifiable sources.`;

  const promptGenerateTocContent = `Generate a comprehensive and logical Table of Contents (TOC) for a full market research report on the {title}.

Include major sections and relevant sub-sections (e.g., Executive Summary, Market Dynamics, Regional Analysis, Competitive Landscape, Methodology, etc.).
Ensure the TOC is well-structured and reflects a professional report.
Do not include page numbers or placeholder text like "Chapter 1".
Format the TOC clearly, using indentation for sub-sections.`;

  const promptSummarizeContent = `Summarize the following text concisely, retaining all key information and data points. The summary should be suitable for providing context to a large language model for generating subsequent sections of a market research report.

Text to summarize:
{text_to_summarize}`;

  const promptTranslateContent = `You are an expert multilingual translator specializing in market research reports. Your task is to translate the following report, which is provided in multiple parts, into the 7 target languages listed below.

**Target Languages:**
1. Spanish
2. French
3. German
4. Italian
5. Portuguese
6. Dutch
7. Japanese

**Report to Translate:**

**Part 1: Market Research Summary**
{market_research_summary}

**Part 2: Market Dynamics**
{market_dynamics}

**Part 3: Regional Insights and Market Segmentation**
{regional_insights_and_market_segmentation}

**Part 4: Key Market Players and Strategic Developments**
{key_market_players_and_strategic_developments}

**Instructions for Translation:**

1.  **Translate Each Part:** Translate each of the four parts of the report into all 7 target languages.
2.  **Maintain Context and Tone:** Preserve the professional and analytical tone of the original report. Ensure that the translation is accurate and culturally appropriate for each target language.
3.  **Handle Placeholders:** The report may contain placeholders like "{title}". Do not translate these placeholders.
4.  **Token Optimization:** To optimize for token usage, I will provide the content for each part of the report in a single block.
5.  **JSON Output:** For each language, provide the translation in a single JSON object with the following structure:

\`\`\`json
{
  "language": "<language_name>",
  "market_research_summary": "<translated_summary>",
  "market_dynamics": "<translated_dynamics>",
  "regional_insights_and_market_segmentation": "<translated_segmentation>",
  "key_market_players_and_strategic_developments": "<translated_developments>"
}
\`\`\`

**Example for Spanish:**

\`\`\`json
{
  "language": "Spanish",
  "market_research_summary": "El resumen de la investigación de mercado...",
  "market_dynamics": "La dinámica del mercado...",
  "regional_insights_and_market_segmentation": "Las perspectivas regionales y la segmentación del mercado...",
  "key_market_players_and_strategic_developments": "Los principales actores del mercado y los desarrollos estratégicos..."
}
\`\`\``;

  await prisma.aiPromptTemplate.upsert({
    where: { name: 'prompt1' },
    update: { templateText: prompt1Content },
    create: {
      name: 'prompt1',
      promptType: 'content_generation',
      templateText: prompt1Content,
      version: 1,
      createdBy: admin.id,
    },
  });

  await prisma.aiPromptTemplate.upsert({
    where: { name: 'prompt2' },
    update: { templateText: prompt2Content },
    create: {
      name: 'prompt2',
      promptType: 'content_generation',
      templateText: prompt2Content,
      version: 1,
      createdBy: admin.id,
    },
  });

  await prisma.aiPromptTemplate.upsert({
    where: { name: 'prompt3' },
    update: { templateText: prompt3Content },
    create: {
      name: 'prompt3',
      promptType: 'content_generation',
      templateText: prompt3Content,
      version: 1,
      createdBy: admin.id,
    },
  });

  await prisma.aiPromptTemplate.upsert({
    where: { name: 'prompt4' },
    update: { templateText: prompt4Content },
    create: {
      name: 'prompt4',
      promptType: 'content_generation',
      templateText: prompt4Content,
      version: 1,
      createdBy: admin.id,
    },
  });

  await prisma.aiPromptTemplate.upsert({
    where: { name: 'prompt_generate_toc' },
    update: { templateText: promptGenerateTocContent },
    create: {
      name: 'prompt_generate_toc',
      promptType: 'content_generation',
      templateText: promptGenerateTocContent,
      version: 1,
      createdBy: admin.id,
    },
  });

  await prisma.aiPromptTemplate.upsert({
    where: { name: 'prompt_summarize' },
    update: { templateText: promptSummarizeContent },
    create: {
      name: 'prompt_summarize',
      promptType: 'summarization',
      templateText: promptSummarizeContent,
      version: 1,
      createdBy: admin.id,
    },
  });

  await prisma.aiPromptTemplate.upsert({
    where: { name: 'prompt_translate' },
    update: { templateText: promptTranslateContent },
    create: {
      name: 'prompt_translate',
      promptType: 'translation',
      templateText: promptTranslateContent,
      version: 1,
      createdBy: admin.id,
    },
  });

  console.log('🤖 Created AI templates')

  // Create API quotas
  const today = new Date().toISOString().split('T')[0]
  const month = today.substring(0, 7)

  await Promise.all([
    prisma.apiQuota.upsert({
      where: {
        quotaType_serviceType_quotaDate: {
          quotaType: 'daily',
          serviceType: 'translation',
          quotaDate: today
        }
      },
      update: {},
      create: {
        quotaType: 'daily',
        serviceType: 'translation',
        quotaDate: today,
        tokensLimit: 100000,
        requestsLimit: 1000,
        costLimit: 150.0
      }
    }),
    prisma.apiQuota.upsert({
      where: {
        quotaType_serviceType_quotaDate: {
          quotaType: 'monthly',
          serviceType: 'translation',
          quotaDate: month
        }
      },
      update: {},
      create: {
        quotaType: 'monthly',
        serviceType: 'translation',
        quotaDate: month,
        tokensLimit: 3000000,
        requestsLimit: 30000,
        costLimit: 4500.0
      }
    })
  ])

  console.log('📊 Created API quotas')
  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })