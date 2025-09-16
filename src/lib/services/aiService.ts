import { openai, estimateTokenCount, calculateCost } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/utils'

// Helper function to convert Prisma Decimal objects to numbers
function convertDecimalsToNumbers(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertDecimalsToNumbers(item));
  }

  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      // Check if it's a Prisma Decimal object (duck typing)
      if (value && typeof value === 'object' && typeof value.toNumber === 'function') {
        newObj[key] = value.toNumber();
      } else {
        newObj[key] = convertDecimalsToNumbers(value);
      }
    }
  }
  return newObj;
}

export interface GenerationRequest {
  reportTitle: string
  createdBy: string
}

export interface PhaseConfig {
  phase: number
  promptTemplate: string
  maxTokens: number
  temperature: number
}

export const PHASE_CONFIGS: PhaseConfig[] = [
  {
    phase: 1,
    promptTemplate: `Generate an authoritative and insightful market research summary on the {title} with a strong focus on data-driven storytelling and strategic relevance. The content should be structured to meet the needs of C-level decision-makers, investors, and analysts, while being optimized for search engines. Make sure the word count remains under 300 words. Follow the structure below and remember to provide the content in paragraph format only, do not provide bullet point lists
1.	Compelling Market Opening:
	Begin with: "The ({title}) was valued at USD XX Billion in 2025…"
	Clearly mention the market size in 2025, forecasted market size for 2034, and CAGR during the 2025–2034 period.
	Ensure all values are precise and use up-to-date calculations or estimates from reliable data sources, avoid using numbers from market research companies.
2.	Market Definition and Overview:
	Provide a concise, SEO-optimized definition of the ({title}).
3.	Current Market Momentum & Relevance:
	Explain why this market is attracting attention now. 
4.	SEO and Writing Guidelines:
	Use clear, concise, and informative language tailored for a professional audience.
	Avoid filler phrases like "in conclusion," "in summary," or generic clichés.
	Do not cite unnamed research firms. Only use sources with public credibility or institutional authority.
	Ensure content includes primary and secondary keywords naturally to boost SEO.`
    },
  {
    phase: 2,
    promptTemplate: `now create content for this section for {title} 
Objective: Generate a compelling "Market Dynamics" section for the {title} report, clearly segmented into Market Drivers, Market Restraints, and Market Opportunities. The tone must be analytical, data-backed, and tailored for a strategic audience (executives, investors, policymakers), while ensuring SEO-rich content that ranks on SERPs. Follow the structure below and remember to provide the content in paragraph format only, do not provide bullet point lists

📌 Prompt Structure and Instructions:
________________________________________
🔹 A. Market Drivers
•	List 2–4 key growth drivers that are accelerating the market’s expansion.
•	Support each driver with quantitative data, market behavior, or recent industry developments (e.g., "As per WHO, digital health tool adoption grew by 68% from 2021 to 2024 globally.").
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
•	Use specific, data-driven examples (e.g., "Limited data interoperability in AI systems has caused delays in clinical deployment in 42% of U.S. hospitals.").
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
•	Do not cite generic market research firms or use placeholder phrases like "expected to grow exponentially."
•	Keep paragraphs concise and logically connected for enhanced readability and SEO.`,
    maxTokens: 4000,
    temperature: 0.3
  },
  {
    phase: 3,
    promptTemplate: `now create content for this section for {title} 
Objective: Generate an in-depth "Regional Insights" section for the {title} report, Select the one with largest market share out of these 3 regions (North America, Asia-Pacific, and Europe). The regional subsection must open with current and forecasted market size, CAGR, and key growth factors that are relevant to the region and {title}. The language should appeal to executives and analysts, while supporting SEO goals with keyword-rich, authoritative content.

________________________________________
📌 Prompt Structure and Instructions:
🔷 Region Name
•	Start with market sizing:
"The Region name ({title}) market was valued at USD XX Billion in 2024 and is forecasted to reach USD XX Billion by 2034, registering a CAGR of XX.X% during the forecast period."
•	Follow with region-specific drivers such as:
 o	Government regulations or funding (e.g., FDA approvals, Infrastructure Bill)
 o	High technology adoption rate
 o	Consumer behavior or industry maturity
 o	Strong presence of leading manufacturers or startups
 o	Investment in R&D or digital transformation
•	Mention one leading country from the selected region (e.g., U.S., Canada) and their roles, when relevant.
•	Include validated data points from sources like U.S. Department of Commerce, NIH, FDA, StatCan, etc.
✅ SEO and Style Guidelines:
•	Use region + {title} in headings and body copy (e.g., "North America Electric Vehicle Market").
•	Maintain a formal, analytical tone suitable for senior decision-makers.
•	Ensure each region’s narrative is unique and avoids repetition across sections.
•	Integrate primary and secondary keywords naturally.
•	Avoid vague phrases and unverified projections; use credible data points only.
•	No citation of generic market research firms.

PART2
AI Prompt for "Market Segmentation" Section
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
Format: {title} Market Size By Primary Category 1(sub-segment list in comma separated format), By Primary Category 1(sub-segment list in comma separated format), Regions, Global Industry Analysis, Share, Growth, Trends, and Forecast 2025 to 2034
Only generate for first 2 Primary Category skip others
Example: Quantum Encryption Market Size by Component (Quantum Key Distribution (QKD) Systems, Quantum Random Number Generators, Others), Application (Government & Defence, Banking & Financial Services, Healthcare, Others), Regions, Global Industry Analysis, Share, Growth, Trends, and Forecast 2025 to 2034

PART 3: Segment-Level Analysis (With Data)
Instructions:
For maximum of 3 and minimum of 2 primary segment category defined above (e.g., By Product Type, By Application), do not provide content on Regional section, generate a structured analysis using the format below:
1. Introduction Format (repeat for each major segment):
•	Begin with the line:
"By [Segment Category], the {title} market was segmented into…"
•	List the sub-segments in a short sentence form.
2. Highlight the Key Segments:
•	Identify:
 o	The largest sub-segment (by 2024 market share)
•	Begin with the line:
"The [largest sub-segment], dominated the {title} market , with a market share of around xx% in 2024."
4. Explain the Growth Drivers (qualitative + data):
•	Write in paragraph format.
•	Provide key drivers that are fueling demand or adoption of the largest sub-segment.
•	Include quantitative evidence or industry validation (e.g., "Rising demand from SMEs led to a 42% increase in deployment of cloud-based solutions in 2023").
•	Focus on technology adoption, regulations, user trends, cost dynamics, performance, and ease of implementation, depending on segment type.
________________________________________
✅ SEO and Writing Guidelines:
•	Include primary and long-tail keywords naturally (e.g., "[cloud-based HR software], [industrial robotics in automotive sector], [digital payment in retail]").
•	Maintain a professional, structured tone aimed at analysts, executives, and investors.
•	Avoid repetitive language or vague claims.
•	Do not use generic summaries or cite unnamed research firms.`,
    maxTokens: 4000,
    temperature: 0.3
  },
  {
    phase: 4,
    promptTemplate: `now create content for this section for {title} 
PART 1: Some of the Key Market Players
Instructions:
•	Generate a bullet-point list of the Top 10 companies operating in the {title}.
•	Only include verified, real companies actively involved in the industry. Use company names that are:
 o	Publicly traded or widely recognized in the space
 o	Known for manufacturing, supplying, or innovating in this domain
 o	Covered in reputable news, industry sources, or regulatory filings
•	If real companies are unavailable, omit placeholders like "Company1" or "XYZ Corp." Do not use hypothetical names.
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
•	Provide a bullet list of 1–2 real, recent (2024 only) developments from companies listed above or other leading players in {title}.
•	Each item should follow this format:
"[Month] 2024: [Company] introduced [Product/Partnership/Acquisition] to [Intent/Outcome]."
•	Ensure developments are:
 o	Specific and relevant to the {title}
 o	Based on real-world events: product launches, partnerships, funding rounds, M&As, tech upgrades, regulatory wins, or expansions
•	Avoid vague, unverified, or undated statements. No generic headlines like "Company expanded product portfolio."
Format Example:
• February 2024: Honeywell launched its next-gen building automation system to improve energy efficiency in smart commercial spaces.  
• March 2024: Schneider Electric partnered with Microsoft to enhance cloud-based sustainability monitoring in industrial operations.  
SEO and Professional Guidelines:
•	Integrate relevant {title} keywords (e.g., "Key players in the renewable energy storage market include…").
•	Avoid filler phrases like "many companies are involved."
•	Use a credible tone suited for executives, analysts, and institutional stakeholders.
•	Validate company names and developments against real news or press releases.
•	Never cite or fabricate market research firm names or unverifiable sources.`,
    maxTokens: 4000,
    temperature: 0.2
  }
]

export class AIContentService {
  async createWorkflow(reportTitle: string, createdBy: string) {
    const workflow = await prisma.contentGenerationWorkflow.create({
      data: {
        reportTitle,
        industry: 'N/A',
        geographicScope: 'N/A',
        timeframe: 'N/A',
        reportType: 'N/A',
        createdBy,
        workflowStatus: 'GENERATING',
        currentPhase: 1
      }
    })

    // Start phase 1 immediately
    this.processNextPhase(workflow.id)
    
    return workflow
  }

  async processNextPhase(workflowId: string) {
    console.log(`[${new Date().toISOString()}] Processing next phase for workflow ${workflowId}`);
    const workflow = await prisma.contentGenerationWorkflow.findUnique({
      where: { id: workflowId },
      include: { jobs: { orderBy: { phase: 'asc' } } }
    })

    if (!workflow) {
      console.log(`[${new Date().toISOString()}] Workflow ${workflowId} not found.`);
      return;
    }

    if (workflow.currentPhase > PHASE_CONFIGS.length) {
      console.log(`[${new Date().toISOString()}] Workflow ${workflowId} has already completed all phases.`);
      return
    }

    console.log(`[${new Date().toISOString()}] Current phase for workflow ${workflowId} is ${workflow.currentPhase}`);

    const phaseConfig = PHASE_CONFIGS[workflow.currentPhase - 1]
    const previousContent = this.buildContextFromPreviousPhases(workflow.jobs)

    // Create job for current phase
    console.log(`[${new Date().toISOString()}] Creating job for phase ${workflow.currentPhase} of workflow ${workflowId}`);
    const job = await prisma.contentGenerationJob.create({
      data: {
        workflowId: workflow.id,
        phase: workflow.currentPhase,
        promptTemplate: phaseConfig.promptTemplate,
        contextData: {
          reportTitle: workflow.reportTitle,
          previous_content: previousContent
        },
        aiModel: 'gpt-4o-mini',
        temperature: phaseConfig.temperature,
        maxTokens: phaseConfig.maxTokens,
        inputPrompt: this.buildPrompt(phaseConfig.promptTemplate, {
          title: workflow.reportTitle,
          previous_content: previousContent
        }, workflow.language),
        status: 'PROCESSING'
      }
    })
    console.log(`[${new Date().toISOString()}] Created job ${job.id} for phase ${workflow.currentPhase} of workflow ${workflowId}`);

    try {
      await this.executeJob(job.id)
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Error executing job ${job.id} for workflow ${workflowId}:`, error);
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
    console.log(`[${new Date().toISOString()}] Executing job ${jobId}`);
    const job = await prisma.contentGenerationJob.findUnique({
      where: { id: jobId }
    })

    if (!job) {
      console.log(`[${new Date().toISOString()}] Job ${jobId} not found.`);
      return;
    }

    console.log(`[${new Date().toISOString()}] Found job ${jobId} for phase ${job.phase} of workflow ${job.workflowId}`);

    const startTime = Date.now()
    let processingTime = 0;
    let inputTokens = 0;
    let outputTokens = 0;
    let totalTokens = 0;
    let cost = 0;

    try {
      console.log(`[${new Date().toISOString()}] Calling OpenAI for job ${jobId}`);
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
      console.log(`[${new Date().toISOString()}] OpenAI call completed for job ${jobId}`);

      const outputText = completion.choices[0]?.message?.content || ''

      inputTokens = completion.usage?.prompt_tokens || estimateTokenCount(job.inputPrompt);
      outputTokens = completion.usage?.completion_tokens || estimateTokenCount(outputText);
      totalTokens = completion.usage?.total_tokens || inputTokens + outputTokens;
      cost = calculateCost(inputTokens, outputTokens);
      processingTime = Date.now() - startTime;

      console.log('OpenAI Completion Usage:', completion.usage);
      console.log('Calculated Tokens:', { inputTokens, outputTokens, totalTokens, cost });

      // Update job with results
      console.log(`[${new Date().toISOString()}] Updating job ${jobId} with results`);
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
          relevanceScore: await this.assessRelevance(outputText, job.contextData),
          completenessScore: await this.assessCompleteness(outputText, job.phase)
        }
      })
      console.log(`[${new Date().toISOString()}] Updated job ${jobId} with results`);

      // Update parent workflow's total tokens and cost
      console.log(`[${new Date().toISOString()}] Updating workflow ${job.workflowId} with total tokens and cost`);
      await prisma.contentGenerationWorkflow.update({
        where: { id: job.workflowId! },
        data: {
          totalInputTokensUsed: {
            increment: inputTokens
          },
          totalOutputTokensUsed: {
            increment: outputTokens
          },
          totalTokensUsed: {
            increment: totalTokens
          },
          totalCost: {
            increment: cost
          }
        }
      })
      console.log(`[${new Date().toISOString()}] Updated workflow ${job.workflowId} with total tokens and cost`);

      const updatedWorkflow = await prisma.contentGenerationWorkflow.findUnique({
        where: { id: job.workflowId! },
        select: { totalTokensUsed: true, totalCost: true }
      });
      console.log('Updated Workflow Totals:', updatedWorkflow);

      // Log API usage
      console.log(`[${new Date().toISOString()}] Logging API usage for job ${jobId}`);
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
      console.log(`[${new Date().toISOString()}] Logged API usage for job ${jobId}`);

      // Update workflow and continue to next phase
      console.log(`[${new Date().toISOString()}] Updating workflow after job ${jobId}`);
      await this.updateWorkflowAfterJob(job.workflowId!, job.phase, outputText)
      console.log(`[${new Date().toISOString()}] Updated workflow after job ${jobId}`);

    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Error in executeJob for job ${jobId}:`, error);
      await prisma.contentGenerationJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
          errorCode: error.code || 'UNKNOWN',
          processingTime: processingTime
        }
      })
      
      // Log failed API usage
      await prisma.apiUsageLog.create({
        data: {
          serviceType: 'content_generation',
          model: job.aiModel,
          jobId: job.id,
          inputTokens: inputTokens,
          outputTokens: outputTokens,
          totalTokens: totalTokens,
          costPerToken: 0,
          totalCost: cost,
          responseTime: processingTime,
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

    // Recalculate total tokens and cost from all completed jobs for this workflow
    const workflowWithJobs = await prisma.contentGenerationWorkflow.findUnique({
      where: { id: workflowId },
      include: {
        jobs: {
          where: { status: 'COMPLETED' },
          select: {
            inputTokens: true,
            outputTokens: true,
            totalTokens: true,
            cost: true
          }
        }
      }
    });

    let recalculatedTotalTokensUsed = 0;
    let recalculatedTotalCost = 0;

    if (workflowWithJobs && workflowWithJobs.jobs) {
      workflowWithJobs.jobs.forEach(job => {
        recalculatedTotalTokensUsed += (job.totalTokens || 0);
        recalculatedTotalCost += (job.cost ? job.cost.toNumber() : 0);
      });
    }

    updateData.totalTokensUsed = recalculatedTotalTokensUsed;
    updateData.totalCost = recalculatedTotalCost;

    // Store content in appropriate field
    // The fields marketAnalysis, competitiveAnalysis, trendsAnalysis, finalSynthesis
    // are specific to the old workflow. For the new workflow, we will rely on job.outputText
    // for each phase. We can remove these fields from the workflow model if they are not used elsewhere.
    // For now, we will just update the workflow status and current phase.

    if (completedPhase < PHASE_CONFIGS.length) {
      // Continue to next phase
      updateData.currentPhase = completedPhase + 1
      
      await prisma.contentGenerationWorkflow.update({
        where: { id: workflowId },
        data: updateData
      })

      // Process next phase
      this.processNextPhase(workflowId)
    } else {
      // Workflow complete
      updateData.workflowStatus = 'PENDING_REVIEW'
      updateData.currentPhase = PHASE_CONFIGS.length

      await prisma.contentGenerationWorkflow.update({
        where: { id: workflowId },
        data: updateData
      })
    }
  }

  private buildPrompt(template: string, variables: Record<string, any>, language: string = 'en'): string {
    let prompt = template
    
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`
      prompt = prompt.replace(new RegExp(placeholder, 'g'), value || '')
    })

    if (language !== 'en') {
      const languageMap: { [key: string]: string } = {
        de: 'German',
        fr: 'French',
        it: 'Italian',
        ja: 'Japanese',
        ko: 'Korean',
        es: 'Spanish',
      };
      const fullLanguage = languageMap[language] || language;
      prompt = `Please generate the content in ${fullLanguage}. The entire response should be in ${fullLanguage}.\n\n` + prompt;
    }
    
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
    if (!/\d%/g.test(content)) score -= 0.5 // No percentages
    if (content.split(' ').length < 50) score -= 1.0 // Too short
    
    return Math.max(1.0, Math.min(10.0, score))
  }

  private async assessRelevance(content: string, contextData: any): Promise<number> {
    // Check if content mentions the reportTitle
    const reportTitle = contextData?.reportTitle?.toLowerCase() || ''
    const contentLower = content.toLowerCase()
    
    let score = 5.0
    
    if (reportTitle && contentLower.includes(reportTitle)) score += 2.0
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
    const workflow = await prisma.contentGenerationWorkflow.findUnique({
      where: { id: workflowId },
      include: {
        jobs: {
          orderBy: { phase: 'asc' },
        },
        childWorkflows: {
          include: {
            jobs: {
              orderBy: { phase: 'asc' },
            },
          },
        },
      },
    });

    if (workflow) {
      const processWorkflow = (wf: any) => {
        const jobsWithNumbers = wf.jobs.map((job: any) => ({
          ...job,
          qualityScore: job.qualityScore ? job.qualityScore.toNumber() : null,
          cost: job.cost ? job.cost.toNumber() : null,
          inputTokens: job.inputTokens || 0,
          outputTokens: job.outputTokens || 0,
          totalTokens: job.totalTokens || 0,
        }));

        const processedWorkflow = convertDecimalsToNumbers(wf);

        return {
          ...processedWorkflow,
          jobs: jobsWithNumbers,
          totalTokenUsage: {
            inputTokens: processedWorkflow.totalInputTokensUsed || 0,
            outputTokens: processedWorkflow.totalOutputTokensUsed || 0,
            totalTokens: processedWorkflow.totalTokensUsed || 0,
            cost: processedWorkflow.totalCost,
          },
        };
      };

      const processedParent = processWorkflow(workflow);
      const processedChildren = workflow.childWorkflows.map(processWorkflow);

      return {
        ...processedParent,
        childWorkflows: processedChildren,
      };
    }
    return null;
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

  async updateJobOutput(jobId: string, outputText: string) {
    return prisma.contentGenerationJob.update({
      where: { id: jobId },
      data: { outputText, status: 'COMPLETED' }
    })
  }

  async approveWorkflow(workflowId: string, userId: string, categoryIds?: string[]) {
    console.log(`Approving workflow ${workflowId} by user ${userId}`);
    const updatedWorkflow = await prisma.contentGenerationWorkflow.update({
      where: { id: workflowId },
      data: {
        workflowStatus: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: userId,
      }
    });
    console.log('Workflow status updated to APPROVED');

    const workflowWithJobs = await prisma.contentGenerationWorkflow.findUnique({
        where: { id: workflowId },
        include: { jobs: { where: { status: 'COMPLETED' }, orderBy: { phase: 'asc' } } }
    });

    if (!workflowWithJobs) {
        console.error("Could not find the approved workflow after update.");
        throw new Error("Could not find the approved workflow.");
    }
    console.log('Found workflow with jobs');

    const reportTitle = workflowWithJobs.reportTitle;
    const slug = generateSlug(reportTitle);
    const description = workflowWithJobs.jobs
        .filter(job => job.phase === 1)
        .map(job => job.outputText || '')
        .join('\n\n');
    const summary = workflowWithJobs.jobs.find(job => job.phase === 1)?.outputText || '';

    if (workflowWithJobs.parentWorkflowId) {
      // This is a child workflow, so we create a ReportTranslation
      const parentWorkflow = await prisma.contentGenerationWorkflow.findUnique({
        where: { id: workflowWithJobs.parentWorkflowId },
        include: { reports: { include: { categories: true } } }
      });

      if (!parentWorkflow || !parentWorkflow.reports.length) {
        throw new Error('Parent workflow or report not found');
      }

      const reportId = parentWorkflow.reports[0].id;

      const marketAnalysis = workflowWithJobs.jobs.find(job => job.phase === 1)?.outputText || '';
      const competitiveAnalysis = workflowWithJobs.jobs.find(job => job.phase === 2)?.outputText || '';
      const trendsAnalysis = workflowWithJobs.jobs.find(job => job.phase === 3)?.outputText || '';
      const keyPlayersContent = workflowWithJobs.jobs.find(job => job.phase === 4)?.outputText || '';
      const keyPlayers = keyPlayersContent.split('\n').filter(line => line.startsWith('•')).map(line => line.replace(/^•\s*/, ''));
      const strategicDevelopments = keyPlayersContent.split('PART 2:')[1]?.trim() || '';

      await prisma.reportTranslation.create({
        data: {
          reportId: reportId,
          locale: workflowWithJobs.language,
          title: reportTitle,
          description: description,
          summary: summary,
          slug: slug,
          metaTitle: reportTitle,
          metaDescription: description.substring(0, 300),
          aiGenerated: true,
          humanReviewed: true,
          status: 'PUBLISHED',
          marketAnalysis: marketAnalysis,
          competitiveAnalysis: competitiveAnalysis,
          trendsAnalysis: trendsAnalysis,
          keyPlayers: keyPlayers,
          strategicDevelopments: strategicDevelopments,
        }
      });

      return { updatedWorkflow };

    } else {
      // This is a parent workflow, so we create a Report
      if (!categoryIds || categoryIds.length === 0) {
        throw new Error('Category IDs are required for parent workflow approval.');
      }
      const reportData = {
          title: reportTitle,
          description: description,
          summary: summary,
          publishedDate: new Date(),
          metaTitle: reportTitle,
          metaDescription: description.substring(0, 300),
          status: 'DRAFT' as const,
          aiGenerated: true,
          humanApproved: true,
          contentGenerationWorkflowId: workflowId,
      };

      const existingReport = await prisma.report.findUnique({
          where: { slug },
      });

      let savedReport;

      if (existingReport) {
          console.log(`Updating existing report with slug: ${slug}`);
          savedReport = await prisma.report.update({
              where: { slug },
              data: {
                  ...reportData,
                  categories: {
                      set: categoryIds.map(id => ({ id }))
                  }
              },
          });
          console.log(`Report updated with id: ${savedReport.id}`);
      } else {
          console.log(`Creating new report with slug: ${slug}`);
          savedReport = await prisma.report.create({
              data: {
                  ...reportData,
                  slug: slug,
                  categories: {
                      connect: categoryIds.map(id => ({ id }))
                  }
              },
          });
          console.log(`Report created with id: ${savedReport.id}`);
      }

      // Create child workflows for other languages
      if (workflowWithJobs.language === 'en') {
          const targetLanguages = ['de', 'fr', 'it', 'ja', 'ko', 'es'];
          for (const lang of targetLanguages) {
              const childWorkflow = await prisma.contentGenerationWorkflow.create({
                  data: {
                      reportTitle: workflowWithJobs.reportTitle,
                      language: lang,
                      parentWorkflowId: workflowId,
                      createdBy: userId,
                      workflowStatus: 'GENERATING',
                      currentPhase: 1,
                      industry: workflowWithJobs.industry,
                      geographicScope: workflowWithJobs.geographicScope,
                      timeframe: workflowWithJobs.timeframe,
                      reportType: workflowWithJobs.reportType,
                  }
              });
              await new Promise(resolve => setTimeout(resolve, 5000));
              await this.processNextPhase(childWorkflow.id);
          }
      }

      return { updatedWorkflow, report: savedReport };
    }
  }
}

export const aiContentService = new AIContentService()