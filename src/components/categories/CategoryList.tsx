'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { formatDateTime, cn } from '@/lib/utils'

interface Category {
  id: string
  shortcode: string
  slug: string
  title: string
  description: string | null
  icon: string | null
  featured: boolean
  sortOrder: number
  status: string
  _count: { reports: number }
  createdAt: string
}

interface CategoryListProps {
  searchParams: {
    page?: string
    limit?: string
    search?: string
    status?: string
    featured?: string
  }
}

export default function CategoryList({ searchParams }: CategoryListProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 0 })
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  useEffect(() => {
    fetchCategories()
  }, [searchParams])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const validStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'ACTIVE']
      const filteredSearchParams = new URLSearchParams()

      for (const [key, value] of Object.entries(searchParams)) {
        if (key === 'status' && typeof value === 'string' && !validStatuses.includes(value)) {
          // Skip invalid status
          continue
        }
        if (value !== undefined && value !== null) {
          filteredSearchParams.append(key, String(value))
        }
      }

      const response = await fetch(`/api/categories?${filteredSearchParams.toString()}`)
      const data = await response.json()
      
      if (response.ok) {
        setCategories(data.categories)
        setPagination(data.pagination)
      } else {
        toast.error(data.error || 'Failed to load categories')
      }
    } catch (error) {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const selectAllCategories = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([])
    } else {
      setSelectedCategories(categories.map(c => c.id))
    }
  }

  const bulkUpdateStatus = async (status: string) => {
    try {
      await Promise.all(
        selectedCategories.map(id =>
          fetch(`/api/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          })
        )
      )
      toast.success(`Updated ${selectedCategories.length} categories`)
      setSelectedCategories([])
      fetchCategories()
    } catch (error) {
      toast.error('Failed to update categories')
    }
  }

  const bulkToggleFeatured = async (featured: boolean) => {
    try {
      await Promise.all(
        selectedCategories.map(id =>
          fetch(`/api/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ featured })
          })
        )
      )
      toast.success(`Updated ${selectedCategories.length} categories`)
      setSelectedCategories([])
      fetchCategories()
    } catch (error) {
      toast.error('Failed to update categories')
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also affect associated reports.')) return

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Category deleted')
        fetchCategories()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete category')
      }
    } catch (error) {
      toast.error('Failed to delete category')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage market research categories ({pagination.total} total)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/categories/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create Category
          </Link>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCategories.length > 0 && (
        <div className="bg-indigo-50 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="text-sm font-medium text-indigo-900">
            {selectedCategories.length} categor{selectedCategories.length !== 1 ? 'ies' : 'y'} selected
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => bulkUpdateStatus('ACTIVE')}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Mark Active
            </button>
            <button
              onClick={() => bulkUpdateStatus('ARCHIVED')}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Archive
            </button>
            <button
              onClick={() => bulkToggleFeatured(true)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Feature
            </button>
            <button
              onClick={() => bulkToggleFeatured(false)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Unfeature
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-3 border-b border-gray-200">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={selectedCategories.length === categories.length && categories.length > 0}
              onChange={selectAllCategories}
              className="form-checkbox h-4 w-4 text-indigo-600"
            />
            <span className="ml-2 text-sm text-gray-600">Select all</span>
          </label>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories found</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li key={category.id} className="px-4 py-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => toggleCategorySelection(category.id)}
                    className="form-checkbox h-4 w-4 text-indigo-600"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                          className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                        >
                          {category.title}
                        </Link>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                          <span>Shortcode: {category.shortcode}</span>
                          <span>Reports: {category._count.reports}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          category.status === 'ACTIVE' && 'bg-green-100 text-green-800',
                          category.status === 'PUBLISHED' && 'bg-green-100 text-green-800',
                          category.status === 'DRAFT' && 'bg-yellow-100 text-yellow-800',
                          category.status === 'ARCHIVED' && 'bg-gray-100 text-gray-800'
                        )}>
                          {category.status}
                        </span>
                        
                        {category.featured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                          className="text-xs text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="text-xs text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Created {formatDateTime(new Date(category.createdAt))}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                disabled={pagination.page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {/* Pagination controls */}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
