'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'

const formSchema = z.object({
  reportTitle: z.string().min(2, {
    message: 'Report title must be at least 2 characters.',
  }),
})

interface GenerationWizardProps {
  onStart: (workflowId: string, reportTitle: string) => void
}

export default function GenerationWizard({ onStart }: GenerationWizardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportTitle: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/multi-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportTitle: values.reportTitle }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('AI generation workflow started!')
        onStart(data.workflowId, values.reportTitle)
        form.reset()
        queryClient.invalidateQueries({ queryKey: ['translationBatches'] })
      } else {
        toast.error(data.error || 'Failed to start AI generation.')
      }
    } catch (error) {
      console.error('Error starting AI generation:', error)
      toast.error('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Start New AI Report Generation
      </h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="reportTitle" className="block text-sm font-medium text-gray-700">
            Report Title
          </label>
          <input
            id="reportTitle"
            type="text"
            {...form.register('reportTitle')}
            placeholder="e.g., Global AI in Healthcare Market"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {form.formState.errors.reportTitle && (
            <p className="mt-2 text-sm text-red-600">
              {form.formState.errors.reportTitle.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isLoading ? 'Generating...' : 'Start AI Generation'}
        </button>
      </form>
    </div>
  )
}