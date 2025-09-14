import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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

  // Create sample categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { shortcode: 'tech' },
      update: {},
      create: {
        shortcode: 'tech',
        slug: 'technology',
        title: 'Technology Market Research',
        description: 'Comprehensive technology and IT market research reports covering AI, software, hardware, and digital transformation trends.',
        icon: '💻',
        featured: true,
        sortOrder: 1,
        seoKeywords: ['technology market research', 'IT industry analysis', 'digital transformation'],
        metaTitle: 'Technology Market Research Reports | TheBrainyInsights',
        metaDescription: 'Leading technology market research reports covering AI, software, hardware with comprehensive global market analysis.',
        status: 'PUBLISHED'
      }
    }),
    prisma.category.upsert({
      where: { shortcode: 'health' },
      update: {},
      create: {
        shortcode: 'health',
        slug: 'healthcare',
        title: 'Healthcare Market Research',
        description: 'In-depth healthcare and pharmaceutical market research covering medical devices, digital health, and biotechnology.',
        icon: '🏥',
        featured: true,
        sortOrder: 2,
        seoKeywords: ['healthcare market research', 'pharmaceutical industry', 'medical devices'],
        metaTitle: 'Healthcare Market Research Reports | TheBrainyInsights',
        metaDescription: 'Comprehensive healthcare market research covering pharmaceuticals, medical devices, and biotechnology.',
        status: 'PUBLISHED'
      }
    })
  ])

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
