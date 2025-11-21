'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import CategoryForm from '@/components/categories/CategoryForm'
import { toast } from 'sonner'
import { Category, CategoryTranslation } from '@prisma/client'

type CategoryWithTranslations = Category & { translations: CategoryTranslation[] };

export default function EditCategoryPage() {
  const params = useParams()
  const id = params.id as string
  const [initialData, setInitialData] = useState<CategoryWithTranslations | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/categories/${id}`);
        if (response.ok) {
          const data = await response.json();
          setInitialData(data);
        } else {
          const data = await response.json();
          toast.error(data.error || 'Failed to fetch category');
        }
      } catch {
        toast.error('An error occurred while fetching the category.');
      } finally {
        setLoading(false);
      }
    }
    fetchCategory();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!initialData) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold">Category Not Found</h2>
          <p className="mt-2 text-gray-600">The category you are looking for does not exist.</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        {initialData && (
          <CategoryForm initialData={initialData} />
        )}
      </div>
    </AdminLayout>
  )
}