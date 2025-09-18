'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

const categorySchema = z.object({
  shortcode: z.string().min(2, 'Shortcode must be at least 2 characters').max(20, 'Shortcode cannot exceed 20 characters'),
  title_en: z.string().min(1, 'Title is required'),
  description_en: z.string().optional(),
  title_de: z.string().optional(),
  description_de: z.string().optional(),
  title_fr: z.string().optional(),
  description_fr: z.string().optional(),
  title_it: z.string().optional(),
  description_it: z.string().optional(),
  title_ja: z.string().optional(),
  description_ja: z.string().optional(),
  title_ko: z.string().optional(),
  description_ko: z.string().optional(),
  title_es: z.string().optional(),
  description_es: z.string().optional(),
  icon: z.string().optional(),
  featured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  seoKeywords: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'ACTIVE']).default('PUBLISHED')
})

type FormData = z.infer<typeof categorySchema>

interface CategoryFormProps {
  categoryId?: string
  initialData?: FormData & { translations?: CategoryTranslation[] }
}

interface CategoryTranslation {
  id: string;
  categoryId: string;
  locale: string;
  title: string | null;
  description: string | null;
  seoKeywords: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  status: string;
}

export default function CategoryForm({ categoryId, initialData }: CategoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<FormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      featured: false,
      sortOrder: 0,
      status: 'PUBLISHED',
      title_en: '',
      description_en: '',
      ...initialData
    }
  })

  useEffect(() => {
    if (initialData) {
      const translatedData: Record<string, any> = {};
      initialData.translations?.forEach(t => {
        if (t.title) translatedData[`title_${t.locale}`] = t.title;
        if (t.description) translatedData[`description_${t.locale}`] = t.description;
      });

      reset({
        ...initialData,
        ...translatedData,
        seoKeywords: initialData.seoKeywords ? initialData.seoKeywords.join(', ') : '',
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    try {
      const baseCategoryData = {
        shortcode: data.shortcode,
        title_en: data.title_en,
        description_en: data.description_en,
        icon: data.icon,
        featured: data.featured,
        sortOrder: data.sortOrder,
        seoKeywords: data.seoKeywords,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        status: data.status,
      };

      const translationData: Record<string, any> = {};
      const languages = ['de', 'fr', 'it', 'ja', 'ko', 'es'];

      languages.forEach(lang => {
        const titleKey = `title_${lang}` as keyof FormData;
        const descriptionKey = `description_${lang}` as keyof FormData;

        if (data[titleKey] || data[descriptionKey]) {
          translationData[lang] = {
            title: data[titleKey],
            description: data[descriptionKey],
          };
        }
      });

      const url = categoryId ? `/api/categories/${categoryId}` : '/api/categories'
      const method = categoryId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(baseCategoryData)
      })

      const result = await response.json()

      if (response.ok) {
        const createdOrUpdatedCategoryId = result.category.id;

        // Handle translations
        for (const lang of languages) {
          if (translationData[lang]) {
            const translationUrl = `/api/category-translations`;
            const translationMethod = 'POST'; // Always POST for upserting translations

            await fetch(translationUrl, {
              method: translationMethod,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                categoryId: createdOrUpdatedCategoryId,
                locale: lang,
                ...translationData[lang],
              }),
            });
          }
        }

        toast.success(`Category ${categoryId ? 'updated' : 'created'} successfully`)
        router.push('/admin/categories')
      } else {
        toast.error(result.error || `Failed to ${categoryId ? 'update' : 'create'} category`)
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const watchedTitle = watch('title_en')

  // Auto-generate meta title when title changes (if not already set)
  useEffect(() => {
    if (watchedTitle && !initialData?.metaTitle) {
      // Simple auto-generation, can be more sophisticated
      // For now, just use the title as meta title
      setValue('metaTitle', `${watchedTitle} | Categories | TheBrainyInsights`)
    }
  }, [watchedTitle, initialData, setValue])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-black">
            {categoryId ? 'Edit Category' : 'Create New Category'}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 text-black">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Title *
              </label>
              <input
                type="text"
                {...register('title_en')}
                className={cn(
                  'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-black',
                  errors.title_en && 'border-red-500'
                )}
                placeholder="e.g., Artificial Intelligence Market Research"
              />
              {errors.title_en && (
                <p className="mt-1 text-sm text-red-600">{errors.title_en.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Shortcode *
              </label>
              <input
                type="text"
                {...register('shortcode')}
                className={cn(
                  'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-black',
                  errors.shortcode && 'border-red-500'
                )}
                placeholder="e.g., AI, HEALTH"
              />
              {errors.shortcode && (
                <p className="mt-1 text-sm text-red-600">{errors.shortcode.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Description
            </label>
            <textarea
              {...register('description_en')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-black"
              placeholder="A brief description of the category..."
            />
          </div>

          {/* Icon & Sort Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Icon (e.g., Emoji or URL)
              </label>
              <input
                type="text"
                {...register('icon')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-black"
                placeholder="💻 or https://example.com/icon.png"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Sort Order
              </label>
              <input
                type="number"
                {...register('sortOrder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-black"
                placeholder="0"
              />
            </div>
          </div>

          {/* SEO Keywords */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              SEO Keywords (comma-separated)
            </label>
            <input
              type="text"
              {...register('seoKeywords')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-black"
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>

          {/* Meta Title & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Meta Title
              </label>
              <input
                type="text"
                {...register('metaTitle')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-black"
                placeholder="SEO-optimized meta title..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Meta Description
              </label>
              <textarea
                {...register('metaDescription')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-black"
                placeholder="SEO-optimized meta description..."
              />
            </div>
          </div>

          {/* Status & Featured */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                {...register('featured')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-black">
                Featured Category
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50"
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
              {loading ? 'Saving...' : categoryId ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
