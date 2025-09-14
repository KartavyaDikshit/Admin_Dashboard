'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  industry: z.string().min(1, 'Industry is required'),
  marketSize: z.string().optional(),
  geographicScope: z.string().min(1, 'Geographic scope is required'),
  timeframe: z.string().min(1, 'Timeframe is required'),
  reportType: z.string().min(1, 'Report type is required'),
  customRequirements: z.string().optional()
})

type FormData = z.infer<typeof formSchema>

interface GenerationWizardProps {
  onStart: (workflowId: string) => void
}

export default function GenerationWizard({ onStart }: GenerationWizardWizardProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  })

  const onSubmit = async (data: FormData) => {
    setIsGenerating(true)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        toast.success('AI content generation started!')
        onStart(result.workflowId)
        reset()
      } else {
        toast.error(result.error || 'Failed to start generation')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">AI Report Generation</h2>
        <p className="text-gray-600 mt-2">
          Generate comprehensive market research reports using our 4-phase AI system
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry / Market *
            </label>
            <input
              type="text"
              {...register('industry')}
              placeholder="e.g., Artificial Intelligence, Healthcare, Automotive"
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500',
                errors.industry && 'border-red-500'
              )}
            />
            {errors.industry && (
              <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
            )}
          </div>

          {/* Market Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Market Size (Optional)
            </label>
            <input
              type="text"
              {...register('marketSize')}
              placeholder="e.g., $50 billion, Multi-billion dollar market"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Geographic Scope */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Geographic Scope *
            </label>
            <input
              type="text"
              {...register('geographicScope')}
              placeholder="e.g., Global, North America, Asia-Pacific"
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500',
                errors.geographicScope && 'border-red-500'
              )}
            />
            {errors.geographicScope && (
              <p className="mt-1 text-sm text-red-600">{errors.geographicScope.message}</p>
            )}
          </div>

          {/* Timeframe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeframe *
            </label>
            <input
              type="text"
              {...register('timeframe')}
              placeholder="e.g., 2025-2030, Next 5 years"
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500',
                errors.timeframe && 'border-red-500'
              )}
            />
            {errors.timeframe && (
              <p className="mt-1 text-sm text-red-600">{errors.timeframe.message}</p>
            )}
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type *
            </label>
            <input
              type="text"
              {...register('reportType')}
              placeholder="e.g., Market Research Report, Industry Analysis"
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500',
                errors.reportType && 'border-red-500'
              )}
            />
            {errors.reportType && (
              <p className="mt-1 text-sm text-red-600">{errors.reportType.message}</p>
            )}
          </div>

          {/* Custom Requirements */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Requirements (Optional)
            </label>
            <textarea
              {...register('customRequirements')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Any specific details or focus areas for the AI generation..."
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isGenerating}
            className={cn(
              'inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
              isGenerating && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isGenerating ? 'Generating...' : 'Start AI Generation'}
          </button>
        </div>
      </form>
    </div>
  )
}