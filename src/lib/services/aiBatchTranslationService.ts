import { prisma } from '@/lib/prisma'
import { aiTranslationService } from './aiTranslationService'
import { TranslationJobStatus } from '@prisma/client'

const BATCH_TARGET_LOCALES = ['de', 'fr', 'it', 'ja', 'ko', 'es'] // German, French, Italian, Japanese, Korean, Spanish

export class AIBatchTranslationService {
  async createBatchTranslation(
    contentType: 'REPORT' | 'CATEGORY',
    targetLocales: string[],
    createdBy: string | null = null
  ) {
    const name = `Batch Translate ${contentType}s to ${targetLocales.join(', ').toUpperCase()}`
    const allContentItems = contentType === 'REPORT'
      ? await prisma.report.findMany({ select: { id: true } })
      : await prisma.category.findMany({ select: { id: true } })

    const totalExpectedJobs = allContentItems.length * targetLocales.length

    const batch = await prisma.translationBatch.create({
      data: {
        name,
        contentType,
        targetLocales,
        totalJobs: totalExpectedJobs,
        status: TranslationJobStatus.PENDING,
        createdBy,
        startedAt: new Date(),
      },
    })

    // Asynchronously process all jobs
    this.processBatch(batch.id, allContentItems.map(item => item.id), targetLocales, contentType)

    return batch
  }

  private async processBatch(
    batchId: string,
    contentIds: string[],
    targetLocales: string[],
    contentType: 'REPORT' | 'CATEGORY'
  ) {
    let completedCount = 0
    let failedCount = 0

    for (const contentId of contentIds) {
      for (const locale of targetLocales) {
        try {
          // Pass batchId to individual translation jobs
          await aiTranslationService.translateContent(contentType, contentId, locale, 'en', batchId)
          completedCount++
        } catch (error) {
          console.error(`Batch translation failed for ${contentType} ${contentId} to ${locale}:`, error)
          failedCount++
        } finally {
          // Update batch progress
          const totalProcessed = completedCount + failedCount
          const progress = (totalProcessed / (contentIds.length * targetLocales.length)) * 100
          await prisma.translationBatch.update({
            where: { id: batchId },
            data: {
              completedJobs: completedCount,
              failedJobs: failedCount,
              progress: parseFloat(progress.toFixed(2)),
              status: totalProcessed === (contentIds.length * targetLocales.length)
                ? (failedCount > 0 ? TranslationJobStatus.FAILED : TranslationJobStatus.COMPLETED)
                : TranslationJobStatus.PROCESSING,
              completedAt: totalProcessed === (contentIds.length * targetLocales.length) ? new Date() : undefined,
            },
          })
        }
      }
    }
  }

  async getBatchStatus(batchId: string) {
    return prisma.translationBatch.findUnique({
      where: { id: batchId },
      include: {
        jobs: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            contentId: true,
            targetLocale: true,
            status: true,
            errorMessage: true,
            createdAt: true,
          },
        },
      },
    })
  }

  async getAllBatches() {
    return prisma.translationBatch.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }
}

export const aiBatchTranslationService = new AIBatchTranslationService()
