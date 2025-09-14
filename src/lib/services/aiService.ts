import { openai, estimateTokenCount, calculateCost } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

export interface GenerationRequest {
  industry: string
  marketSize?: string
  geographicScope: string
  timeframe: string
  reportType: string
  customRequirements?: string
  createdBy: string
}

export interface PhaseConfig {
  phase: number
  title: string
  promptTemplate: string
  maxTokens: number
  temperature: number
}

export const PHASE_CONFIGS: PhaseConfig[] = [
  {
    phase: 1,
    title: 'Market Research Summary',
    promptTemplate: `Generate authoritative market research summary on {industry} market in {geographic_scope}. Focus on data-driven storytelling for C-level decision-makers. Under 300 words, paragraph format only. Structure: 1) Market opening with USD size 2025, forecasted {timeframe}, CAGR 2) Market definition 3) Current momentum. Use clear, SEO-optimized language. Avoid filler phrases.`,
    maxTokens: 400,
    temperature: 0.2
  },
  {
    phase: 2,
    title: 'Market Dynamics',
    promptTemplate: `Create Market Dynamics section for {industry} market in {geographic_scope}. Context: {previous_content}. Structure: A) Market Drivers (2-4 key growth drivers with quantitative data) B) Market Restraints (1-3 barriers with examples) C) Market Opportunities (emerging growth areas). Analytical tone for executives. Paragraph format only, no bullet lists.`,
    maxTokens: 500,
    temperature: 0.3
  },
  {
    phase: 3,
    title: 'Regional Insights & Market Segmentation',
    promptTemplate: `Create Regional Insights and Market Segmentation for {industry} market. Context: {previous_content}. Part 1: Select largest market share region (North America/Asia-Pacific/Europe) with USD size, CAGR, key drivers. Part 2: Generate segmentation structure as bullet list. Part 3: Analyze top 2 primary segments with market share data and growth drivers.`,
    maxTokens: 650,
    temperature: 0.3
  },
  {
    phase: 4,
    title: 'Key Market Players & Strategic Developments',
    promptTemplate: `Create Key Players section for {industry} market. Context: {previous_content}. Part 1: List top 10 verified companies (publicly traded/recognized). Part 2: Provide 1-2 real 2024-2025 developments with format "[Month] 2025: [Company] [action] to [outcome]". Use credible company names only, no placeholders.`,
    maxTokens: 450,
    temperature: 0.2
  }
]

export class AIContentService {
  async createWorkflow(request: GenerationRequest) {
    const workflow = await prisma.contentGenerationWorkflow.create({
      data: {
        industry: request.industry,
        marketSize: request.marketSize,
        geographicScope: request.geographicScope,
        timeframe: request.timeframe,
        reportType: request.reportType,
        customRequirements: request.customRequirements,
        createdBy: request.createdBy,
        workflowStatus: 'GENERATING',
        currentPhase: 1
      }
    })

    // Start phase 1 immediately
    this.processNextPhase(workflow.id)
    
    return workflow
  }

  async processNextPhase(workflowId: string) {
    const workflow = await prisma.contentGenerationWorkflow.findUnique({
      where: { id: workflowId },
      include: { jobs: { orderBy: { phase: 'asc' } } }
    })

    if (!workflow || workflow.currentPhase > 4) {
      return
    }

    const phaseConfig = PHASE_CONFIGS[workflow.currentPhase - 1]
    const previousContent = this.buildContextFromPreviousPhases(workflow.jobs)

    // Create job for current phase
    const job = await prisma.contentGenerationJob.create({
      data: {
        workflowId: workflow.id,
        phase: workflow.currentPhase,
        promptTemplate: phaseConfig.promptTemplate,
        contextData: {
          industry: workflow.industry,
          geographic_scope: workflow.geographicScope,
          timeframe: workflow.timeframe,
          previous_content: previousContent
        },
        aiModel: 'gpt-4-turbo-preview',
        temperature: phaseConfig.temperature,
        maxTokens: phaseConfig.maxTokens,
        inputPrompt: this.buildPrompt(phaseConfig.promptTemplate, {
          industry: workflow.industry,
          geographic_scope: workflow.geographicScope,
          timeframe: workflow.timeframe,
          previous_content: previousContent
        }),
        status: 'PROCESSING'
      }
    })

    try {
      await this.executeJob(job.id)
    } catch (error) {
      await prisma.contentGenerationJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message
        }
      })
    }
  }

  private async executeJob(jobId: string) {
    const job = await prisma.contentGenerationJob.findUnique({
      where: { id: jobId }
    })

    if (!job) return

    const startTime = Date.now()
    const inputTokens = estimateTokenCount(job.inputPrompt)

    try {
      const completion = await openai.chat.completions.create({
        model: job.aiModel,
        messages: [
          {
            role: 'system',
            content: 'You are an expert market research analyst. Provide accurate, data-driven insights with specific numbers and credible sources.'
          },
          {
            role: 'user',
            content: job.inputPrompt
          }
        ],
        max_tokens: job.maxTokens,
        temperature: job.temperature.toNumber()
      })

      const outputText = completion.choices[0]?.message?.content || ''
      const outputTokens = completion.usage?.completion_tokens || estimateTokenCount(outputText)
      const totalTokens = completion.usage?.total_tokens || inputTokens + outputTokens
      const cost = calculateCost(inputTokens, outputTokens)
      const processingTime = Date.now() - startTime

      // Update job with results
      await prisma.contentGenerationJob.update({
        where: { id: jobId },
        data: {
          outputText,
          inputTokens,
          outputTokens,
          totalTokens,
          cost,
          processingTime,
          status: 'COMPLETED',
          qualityScore: await this.assessQuality(outputText),
          relevanceScore: await this.assessRelevance(outputText, job.contextData),
          completenessScore: await this.assessCompleteness(outputText, job.phase)
        }
      })

      // Log API usage
      await prisma.apiUsageLog.create({
        data: {
          serviceType: 'content_generation',
          model: job.aiModel,
          jobId: job.id,
          inputTokens,
          outputTokens,
          totalTokens,
          costPerToken: cost / totalTokens,
          totalCost: cost,
          responseTime: processingTime,
          success: true,
          requestData: { prompt: job.inputPrompt },
          responseData: { content: outputText }
        }
      })

      // Update workflow and continue to next phase
      await this.updateWorkflowAfterJob(job.workflowId!, job.phase, outputText)

    } catch (error) {
      await prisma.contentGenerationJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
          errorCode: error.code || 'UNKNOWN',
          processingTime: Date.now() - startTime
        }
      })
      
      // Log failed API usage
      await prisma.apiUsageLog.create({
        data: {
          serviceType: 'content_generation',
          model: job.aiModel,
          jobId: job.id,
          inputTokens,
          outputTokens: 0,
          totalTokens: inputTokens,
          costPerToken: 0,
          totalCost: 0,
          responseTime: Date.now() - startTime,
          success: false,
          errorMessage: error.message,
          requestData: { prompt: job.inputPrompt }
        }
      })

      throw error
    }
  }

  private async updateWorkflowAfterJob(workflowId: string, completedPhase: number, content: string) {
    const updateData: any = {
      updatedAt: new Date()
    }

    // Store content in appropriate field
    switch (completedPhase) {
      case 1:
        updateData.marketAnalysis = content
        break
      case 2:
        updateData.competitiveAnalysis = content
        break
      case 3:
        updateData.trendsAnalysis = content
        break
      case 4:
        updateData.finalSynthesis = content
        break
    }

    if (completedPhase < 4) {
      // Continue to next phase
      updateData.currentPhase = completedPhase + 1
      
      await prisma.contentGenerationWorkflow.update({
        where: { id: workflowId },
        data: updateData
      })

      // Process next phase
      setTimeout(() => this.processNextPhase(workflowId), 1000)
    } else {
      // Workflow complete
      updateData.workflowStatus = 'PENDING_REVIEW'
      updateData.currentPhase = 4

      await prisma.contentGenerationWorkflow.update({
        where: { id: workflowId },
        data: updateData
      })
    }
  }

  private buildPrompt(template: string, variables: Record<string, any>): string {
    let prompt = template
    
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`
      prompt = prompt.replace(new RegExp(placeholder, 'g'), value || '')
    })
    
    return prompt
  }

  private buildContextFromPreviousPhases(jobs: any[]): string {
    const completedJobs = jobs
      .filter(job => job.status === 'COMPLETED' && job.outputText)
      .sort((a, b) => a.phase - b.phase)
    
    return completedJobs
      .map(job => `Phase ${job.phase}: ${job.outputText}`)
      .join('\n\n')
  }

  private async assessQuality(content: string): Promise<number> {
    // Simple quality assessment based on content characteristics
    let score = 5.0
    
    if (content.length < 100) score -= 2.0
    if (!/\$[\\d,]+/g.test(content)) score -= 0.5 // No currency values
    if (!/\d%/.test(content)) score -= 0.5 // No percentages
    if (content.split(' ').length < 50) score -= 1.0 // Too short
    
    return Math.max(1.0, Math.min(10.0, score))
  }

  private async assessRelevance(content: string, contextData: any): Promise<number> {
    // Check if content mentions the industry
    const industry = contextData?.industry?.toLowerCase() || ''
    const contentLower = content.toLowerCase()
    
    let score = 5.0
    
    if (industry && contentLower.includes(industry)) score += 2.0
    if (contentLower.includes('market')) score += 1.0
    if (contentLower.includes('growth')) score += 0.5
    
    return Math.max(1.0, Math.min(10.0, score))
  }

  private async assessCompleteness(content: string, phase: number): Promise<number> {
    // Phase-specific completeness checks
    let score = 5.0
    
    switch (phase) {
      case 1:
        if (content.includes('CAGR')) score += 1.0
        if (/\d{4}/.test(content)) score += 1.0 // Year mentioned
        break
      case 2:
        if (content.includes('driver')) score += 1.0
        if (content.includes('restraint') || content.includes('challenge')) score += 1.0
        if (content.includes('opportunit')) score += 1.0
        break
      case 3:
        if (content.includes('region')) score += 1.0
        if (content.includes('segment')) score += 1.0
        break
      case 4:
        if (content.includes('compan')) score += 1.0
        if (/2024|2025/.test(content)) score += 1.0
        break
    }
    
    return Math.max(1.0, Math.min(10.0, score))
  }

  async getWorkflowStatus(workflowId: string) {
    return prisma.contentGenerationWorkflow.findUnique({
      where: { id: workflowId },
      include: {
        jobs: {
          orderBy: { phase: 'asc' },
          select: {
            id: true,
            phase: true,
            status: true,
            outputText: true,
            qualityScore: true,
            inputTokens: true,
            outputTokens: true,
            cost: true,
            processingTime: true,
            errorMessage: true
          }
        }
      }
    })
  }

  async regeneratePhase(workflowId: string, phase: number) {
    // Mark existing job as cancelled and create new one
    await prisma.contentGenerationJob.updateMany({
      where: {
        workflowId,
        phase
      },
      data: {
        status: 'CANCELLED'
      }
    })

    // Reset workflow to this phase
    await prisma.contentGenerationWorkflow.update({
      where: { id: workflowId },
      data: {
        currentPhase: phase,
        workflowStatus: 'GENERATING'
      }
    })

    // Process the phase again
    await this.processNextPhase(workflowId)
  }
}

export const aiContentService = new AIContentService()
