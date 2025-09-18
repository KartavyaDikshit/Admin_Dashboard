import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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
    where: { email: 'admin@thebrainyinsights.com' },
    update: {},
    create: {
      email: 'admin@thebrainyinsights.com',
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
      metaTitle: 'Healthcare Market Research Reports | TheBrainyInsights',
      metaDescription: 'Leading Healthcare market research reports with comprehensive global market analysis.',
    },
    {
      title_en: 'Information Technology & Semiconductors',
      shortcode: 'ITS',
      description_en: 'In-depth Information Technology & Semiconductors market research reports on software, hardware, and semiconductor trends.',
      seoKeywords: ['IT market research', 'semiconductor industry analysis', 'software market', 'hardware market'],
      metaTitle: 'Information Technology & Semiconductors Market Research Reports | TheBrainyInsights',
      metaDescription: 'Leading Information Technology & Semiconductors market research reports with comprehensive global market analysis.',
    },
    {
      title_en: 'Machinery & Equipment',
      shortcode: 'ME',
      description_en: 'Detailed Machinery & Equipment market research reports covering industrial machinery, construction equipment, and manufacturing trends.',
      seoKeywords: ['machinery market research', 'equipment industry analysis', 'industrial machinery', 'construction equipment'],
      metaTitle: 'Machinery & Equipment Market Research Reports | TheBrainyInsights',
      metaDescription: 'Leading Machinery & Equipment market research reports with comprehensive global market analysis.',
    },
    {
      title_en: 'Aerospace & Defence',
      shortcode: 'AD',
      description_en: 'Exclusive Aerospace & Defence market research reports on aviation, space, and military technologies.',
      seoKeywords: ['aerospace market research', 'defence industry analysis', 'aviation market', 'space technology'],
      metaTitle: 'Aerospace & Defence Market Research Reports | TheBrainyInsights',
      metaDescription: 'Leading Aerospace & Defence market research reports with comprehensive global market analysis.',
    },
    {
      title_en: 'Chemicals & Materials',
      shortcode: 'CM',
      description_en: 'Extensive Chemicals & Materials market research reports covering specialty chemicals, polymers, and advanced materials.',
      seoKeywords: ['chemicals market research', 'materials industry analysis', 'specialty chemicals', 'polymers'],
      metaTitle: 'Chemicals & Materials Market Research Reports | TheBrainyInsights',
      metaDescription: 'Leading Chemicals & Materials market research reports with comprehensive global market analysis.',
    },
    {
      title_en: 'Food & Beverages',
      shortcode: 'FB',
      description_en: 'Thorough Food & Beverages market research reports on consumer food, alcoholic beverages, and non-alcoholic beverages.',
      seoKeywords: ['food market research', 'beverages industry analysis', 'consumer food', 'alcoholic beverages'],
      metaTitle: 'Food & Beverages Market Research Reports | TheBrainyInsights',
      metaDescription: 'Leading Food & Beverages market research reports with comprehensive global market analysis.',
    },
    {
      title_en: 'Agriculture',
      shortcode: 'AG',
      description_en: 'Comprehensive Agriculture market research reports covering crop production, livestock, and agricultural technology.',
      seoKeywords: ['agriculture market research', 'farming industry analysis', 'crop production', 'agritech'],
      metaTitle: 'Agriculture Market Research Reports | TheBrainyInsights',
      metaDescription: 'Leading Agriculture market research reports with comprehensive global market analysis.',
    },
    {
      title_en: 'Energy & Power',
      shortcode: 'EP',
      description_en: 'In-depth Energy & Power market research reports on renewable energy, oil & gas, and power generation.',
      seoKeywords: ['energy market research', 'power industry analysis', 'renewable energy', 'oil & gas'],
      metaTitle: 'Energy & Power Market Research Reports | TheBrainyInsights',
      metaDescription: 'Leading Energy & Power market research reports with comprehensive global market analysis.',
    },
    {
      title_en: 'Consumer Goods',
      shortcode: 'CG',
      description_en: 'Detailed Consumer Goods market research reports covering personal care, home care, and consumer electronics.',
      seoKeywords: ['consumer goods market research', 'retail industry analysis', 'personal care', 'home care'],
      metaTitle: 'Consumer Goods Market Research Reports | TheBrainyInsights',
      metaDescription: 'Leading Consumer Goods market research reports with comprehensive global market analysis.',
    },
    {
      title_en: 'Automotive & Transportation',
      shortcode: 'AT',
      description_en: 'Exclusive Automotive & Transportation market research reports on electric vehicles, autonomous driving, and logistics.',
      seoKeywords: ['automotive market research', 'transportation industry analysis', 'electric vehicles', 'autonomous driving'],
      metaTitle: 'Automotive & Transportation Market Research Reports | TheBrainyInsights',
      metaDescription: 'Leading Automotive & Transportation market research reports with comprehensive global market analysis.',
    },
  ];

  const categoryUpserts = newCategories.map((categoryData, index) => {
    const slug = generateSlug(categoryData.title_en);
    return prisma.category.upsert({
      where: { shortcode: categoryData.shortcode },
      update: {
        ...categoryData,
        slug,
      },
      create: {
        ...categoryData,
        slug,
        featured: true,
        sortOrder: index + 1,
        status: 'PUBLISHED',
      },
    });
  });

  const categories = await Promise.all(categoryUpserts);

  console.log('📁 Created categories:', categories.length)

  // Create AI prompt templates
  const templates = await Promise.all([
    prisma.aiPromptTemplate.upsert({
      where: { name: 'Market Analysis Template v1' },
      update: {},
      create: {
        name: 'Market Analysis Template v1',
        promptType: 'content_generation',
        phase: 1,
        templateText: 'You are a senior market research analyst specializing in {industry} industry analysis. Generate a comprehensive market analysis for the {industry} market covering {geographic_scope} with a focus on {timeframe}.',
        variables: {
          industry: 'Industry name',
          geographic_scope: 'Geographic coverage',
          timeframe: 'Analysis timeframe'
        },
        version: 1,
        isActive: true,
        defaultModel: 'gpt-4-turbo-preview',
        defaultTemperature: 0.4,
        defaultMaxTokens: 4000,
        createdBy: admin.id
      }
    }),
    prisma.aiPromptTemplate.upsert({
      where: { name: 'Translation Template v1' },
      update: {},
      create: {
        name: 'Translation Template v1',
        promptType: 'translation',
        templateText: 'You are a professional translator specializing in market research content. Translate from {source_language} to {target_language}.',
        variables: {
          source_language: 'Source language',
          target_language: 'Target language'
        },
        version: 1,
        isActive: true,
        defaultModel: 'gpt-4',
        defaultTemperature: 0.3,
        defaultMaxTokens: 2000,
        createdBy: admin.id
      }
    })
  ])

  console.log('🤖 Created AI templates:', templates.length)

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