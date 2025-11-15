'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Category } from '@prisma/client';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable().optional(), // Allow null for description
  shortcode: z.string().min(2, 'Shortcode must be at least 2 characters').max(20, 'Shortcode cannot exceed 20 characters'),
  icon: z.string().nullable().optional(), // Allow null for icon
  featured: z.boolean(),
  sortOrder: z.number().int(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'ACTIVE']),
});

type FormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData?: Category;
  categoryId?: string;
}

export default function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const defaultFormValues: FormData = {
    name: initialData?.name ?? '',
    description: initialData?.description ?? null,
    shortcode: initialData?.shortcode ?? '',
    icon: initialData?.icon ?? null,
    featured: initialData?.featured ?? false,
    sortOrder: initialData?.sortOrder ?? 0,
    status: initialData?.status ?? 'PUBLISHED',
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description,
        shortcode: initialData.shortcode,
        icon: initialData.icon,
        featured: initialData.featured,
        sortOrder: initialData.sortOrder,
        status: initialData.status,
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data: FormData) => {
    const toastId = toast.loading(initialData ? 'Updating category...' : 'Creating category...');
    
    try {
      const url = initialData ? `/api/categories/${initialData.id}` : '/api/categories';
      const method = initialData ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      toast.dismiss(toastId);

      if (response.ok) {
        toast.success(`Category ${initialData ? 'updated' : 'created'} successfully!`);
        router.push('/admin/categories');
        router.refresh(); // Refreshes the server components on the target route
      } else {
        toast.error(result.error || 'An error occurred.');
      }
    } catch {
      toast.dismiss(toastId);
      toast.error('An unexpected error occurred.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-8 space-y-8">
        <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900">
                {initialData ? 'Edit Category' : 'Create New Category'}
            </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              id="name"
              {...register('name')}
              className={cn('mt-1 block w-full rounded-md border-gray-300 shadow-sm', errors.name && 'border-red-500')}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="shortcode" className="block text-sm font-medium text-gray-700">Shortcode *</label>
            <input
              id="shortcode"
              {...register('shortcode')}
              className={cn('mt-1 block w-full rounded-md border-gray-300 shadow-sm', errors.shortcode && 'border-red-500')}
            />
            {errors.shortcode && <p className="mt-1 text-sm text-red-600">{errors.shortcode.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            {...register('description')}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="icon" className="block text-sm font-medium text-gray-700">Icon URL</label>
                <input id="icon" {...register('icon')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
                <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">Sort Order</label>
                <input id="sortOrder" type="number" {...register('sortOrder')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select id="status" {...register('status')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                </select>
            </div>
            <div className="flex items-center pt-6">
                <input id="featured" type="checkbox" {...register('featured')} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">Featured Category</label>
            </div>
        </div>

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
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : (initialData ? 'Update Category' : 'Create Category')}
          </button>
        </div>
      </form>
    </div>
  );
}