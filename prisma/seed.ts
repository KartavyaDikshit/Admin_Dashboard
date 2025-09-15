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
    'Healthcare',
    'Information Technology & Semiconductors',
    'Machinery & Equipment',
    'Aerospace & Defence',
    'Chemicals & Materials',
    'Food & Beverages',
    'Agriculture',
    'Energy & Power',
    'Consumer Goods',
    'Automotive & Transportation',
  ];

  const categoryUpserts = newCategories.map((title, index) => {
    const slug = generateSlug(title);
    const shortcode = title.toLowerCase().replace(/ & /g, '-').replace(/[^a-z]/g, '').substring(0, 10);
    return prisma.category.upsert({
      where: { shortcode },
      update: { title: `${title} Market Research`, slug },
      create: {
        shortcode,
        slug,
        title: `${title} Market Research`,
        description: `Comprehensive ${title} market research reports covering key trends, market size, and growth opportunities.`,
        icon: '📁',
        featured: true,
        sortOrder: index + 1,
        seoKeywords: [`${title.toLowerCase()} market research`, `${title.toLowerCase()} industry analysis`],
        metaTitle: `${title} Market Research Reports | TheBrainyInsights`,
        metaDescription: `Leading ${title} market research reports with comprehensive global market analysis.`,
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