'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ReportTranslation {
  id: string
  locale: string
  title: string
  description: string
  slug: string
  status: string
}

interface Report {
  id: string
  sku: string | null
  slug: string
  title: string
  description: string
  status: string
  featured: boolean
  aiGenerated: boolean
  singlePrice: number | null
  categories: { id: string; title: string; shortcode: string; translations: any[] }[]
  _count: { reviews: number; orderItems: number }
  createdAt: string
  translations: ReportTranslation[]
}

interface ReportListProps {
  searchParams: {
    page?: string
    limit?: string
    search?: string
    categoryId?: string
    status?: string
    featured?: string
    aiGenerated?: string
  }
}

export default function ReportList({ searchParams }: ReportListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 0 })
  const [selectedReports, setSelectedReports] = useState<string[]>([])

  const currentLocale = pathname ? pathname.split('/')[1] || 'en' : 'en'

  useEffect(() => {
    fetchReports()
  }, [searchParams, currentLocale])

  const fetchReports = async () => {
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
      filteredSearchParams.append('locale', currentLocale)

      const response = await fetch(`/api/reports?${filteredSearchParams.toString()}`)
      const data = await response.json()
      
      if (response.ok) {
        setReports(data.reports)
        setPagination(data.pagination)
      } else {
        toast.error(data.error || 'Failed to load reports')
      }
    } catch (error) {
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const toggleReportSelection = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    )
  }

  const selectAllReports = () => {
    if (selectedReports.length === reports.length) {
      setSelectedReports([])
    } else {
      setSelectedReports(reports.map(r => r.id))
    }
  }

  const bulkUpdateStatus = async (status: string) => {
    try {
      await Promise.all(
        selectedReports.map(id =>
          fetch(`/api/reports/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          })
        )
      )
      toast.success(`Updated ${selectedReports.length} reports`)
      setSelectedReports([])
      fetchReports()
    } catch (error) {
      toast.error('Failed to update reports')
    }
  }

  const bulkToggleFeatured = async (featured: boolean) => {
    try {
      await Promise.all(
        selectedReports.map(id =>
          fetch(`/api/reports/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ featured })
          })
        )
      )
      toast.success(`Updated ${selectedReports.length} reports`)
      setSelectedReports([])
      fetchReports()
    } catch (error) {
      toast.error('Failed to update reports')
    }
  }

  const deleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Report deleted')
        fetchReports()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete report')
      }
    } catch (error) {
      toast.error('Failed to delete report')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage market research reports ({pagination.total} total)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/reports/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create Report
          </Link>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedReports.length > 0 && (
        <div className="bg-indigo-50 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="text-sm font-medium text-indigo-900">
            {selectedReports.length} report{selectedReports.length !== 1 ? 's' : ''} selected
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
              checked={selectedReports.length === reports.length && reports.length > 0}
              onChange={selectAllReports}
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
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No reports found</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {reports.map((report) => (
              <li key={report.id} className="px-4 py-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedReports.includes(report.id)}
                    onChange={() => toggleReportSelection(report.id)}
                    className="form-checkbox h-4 w-4 text-indigo-600"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/admin/reports/${report.id}/edit`}
                          className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                        >
                          {report.title}
                        </Link>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                          <span>SKU: {report.sku}</span>
                          <span>Categories: {report.categories.map(cat => cat.title).join(', ') || 'None'}</span>
                          <span>{report._count.orderItems} orders</span>
                          <span>{report._count.reviews} reviews</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          report.status === 'ACTIVE' && 'bg-green-100 text-green-800',
                          report.status === 'DRAFT' && 'bg-yellow-100 text-yellow-800',
                          report.status === 'ARCHIVED' && 'bg-gray-100 text-gray-800'
                        )}>
                          {report.status}
                        </span>
                        
                        {report.featured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Featured
                          </span>
                        )}
                        
                        {report.aiGenerated && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            AI Generated
                          </span>
                        )}
                        
                        {report.singlePrice && (
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(report.singlePrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Link
                          href={`/admin/reports/${report.id}/edit`}
                          className="text-xs text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/admin/reports/${report.id}/translate`}
                          className="text-xs text-green-600 hover:text-green-900 font-medium"
                        >
                          Translate ({report.translations.length})
                        </Link>
                        <button
                          onClick={() => deleteReport(report.id)}
                          className="text-xs text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Created {report.createdAt ? formatDateTime(new Date(report.createdAt)) : 'N/A'}
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
