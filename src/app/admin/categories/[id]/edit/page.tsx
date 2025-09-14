'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import CategoryForm from '@/components/categories/CategoryForm'
import { toast } from 'react-hot-toast'

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [initialData, setInitialData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/categories/${id}`)
        const data = await response.json()
        if (response.ok) {
          setInitialData(data.category)
        } else {
          toast.error(data.error || 'Failed to fetch category')
        }
      } catch (error) {
        toast.error('An error occurred while fetching category.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCategory()
    }
  }, [id])

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
          <h2 className="text-2xl font-semibold text-gray-900">Category Not Found</h2>
          <p className="mt-2 text-gray-600">The category you are looking for does not exist.</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <CategoryForm categoryId={id} initialData={initialData} />
    </AdminLayout>
  )
}
