'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

const reportSchema = z.object({
  categoryId: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  summary: z.string().optional(),
  pages: z.coerce.number().int().positive().optional(),
  publishedDate: z.string(),
  baseYear: z.coerce.number().int().optional(),
  forecastPeriod: z.string().optional(),
  tableOfContents: z.string().optional(),
  methodology: z.string().optional(),
  executiveSummary: z.string().optional(),
  reportType: z.string().optional(),
  researchMethod: z.string().optional(),
  metaTitle: z.string().min(5, 'Meta title must be at least 5 characters'),
  metaDescription: z.string().min(10, 'Meta description must be at least 10 characters'),
  singlePrice: z.coerce.number().positive().optional(),
  multiPrice: z.coerce.number().positive().optional(),
  corporatePrice: z.coerce.number().positive().optional(),
  enterprisePrice: z.coerce.number().positive().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'ACTIVE']),
  featured: z.boolean(),
  priority: z.coerce.number().int().optional()
})

type FormData = z.infer<typeof reportSchema>

interface ReportFormProps {
  reportId?: string
  initialData?: any
}

export default function ReportForm({ reportId, initialData }: ReportFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      status: 'DRAFT',
      featured: false,
      priority: 0,
      publishedDate: new Date().toISOString().split('T')[0],
      ...initialData
    }
  })

  useEffect(() => {
    fetchCategories()
    if (initialData) {
      Object.keys(initialData).forEach(key => {
        setValue(key as keyof FormData, initialData[key])
      })
    }
  }, [initialData, setValue])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?limit=100')
      const data = await response.json()
      if (response.ok) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    try {
      const url = reportId ? `/api/reports/${reportId}` : '/api/reports'
      const method = reportId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`Report ${reportId ? 'updated' : 'created'} successfully`)
        router.push('/admin/reports')
      } else {
        toast.error(result.error || `Failed to ${reportId ? 'update' : 'create'} report`)
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const watchedTitle = watch('title')

  // Auto-generate meta title when title changes
  useEffect(() => {
    if (watchedTitle && !initialData?.metaTitle) {
      setValue('metaTitle', `${watchedTitle} | Market Research Report | TheBrainyInsights`)
    }
  }, [watchedTitle, setValue, initialData])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {reportId ? 'Edit Report' : 'Create New Report'}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                {...register('title')}
                className={cn(
                  'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500',
                  errors.title && 'border-red-500'
                )}
                placeholder="Global Market Research Report Title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                {...register('categoryId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Published Date *
              </label>
              <input
                type="date"
                {...register('publishedDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              {...register('description')}
              rows={6}
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500',
                errors.description && 'border-red-500'
              )}
              placeholder="Comprehensive description of the market research report..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Executive Summary
            </label>
            <textarea
              {...register('summary')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Executive summary of key findings..."
            />
          </div>

          {/* Report Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pages
              </label>
              <input
                type="number"
                {...register('pages')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="285"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Year
              </label>
              <input
                type="number"
                {...register('baseYear')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Forecast Period
              </label>
              <input
                type="text"
                {...register('forecastPeriod')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="2025-2030"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Single User Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('singlePrice')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="4500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Multi User Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('multiPrice')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="6750"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Corporate Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('corporatePrice')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="9000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enterprise Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('enterprisePrice')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="12000"
              />
            </div>
          </div>

          {/* SEO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title *
              </label>
              <input
                type="text"
                {...register('metaTitle')}
                className={cn(
                  'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500',
                  errors.metaTitle && 'border-red-500'
                )}
                placeholder="SEO-optimized meta title..."
              />
              {errors.metaTitle && (
                <p className="mt-1 text-sm text-red-600">{errors.metaTitle.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description *
              </label>
              <textarea
                {...register('metaDescription')}
                rows={3}
                className={cn(
                  'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500',
                  errors.metaDescription && 'border-red-500'
                )}
                placeholder="SEO-optimized meta description..."
              />
              {errors.metaDescription && (
                <p className="mt-1 text-sm text-red-600">{errors.metaDescription.message}</p>
              )}
            </div>
          </div>

          {/* Status and Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <input
                type="number"
                {...register('priority')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0"
              />
            </div>

            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                {...register('featured')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Featured Report
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700',
                loading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {loading ? 'Saving...' : reportId ? 'Update Report' : 'Create Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
