'use client'

import React, { useEffect, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import ReportForm from '@/components/reports/ReportForm'
import { toast } from 'react-hot-toast'

export default function EditReportPage({ params }: { params: { id: string } }) {
  const { id } = React.use(params)
  const [initialData, setInitialData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/reports/${id}`)
        const data = await response.json()
        if (response.ok) {
          setInitialData(data.report)
        } else {
          toast.error(data.error || 'Failed to fetch report')
        }
      } catch (error) {
        toast.error('An error occurred while fetching report.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchReport()
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
          <h2 className="text-2xl font-semibold text-gray-900">Report Not Found</h2>
          <p className="mt-2 text-gray-600">The report you are looking for does not exist.</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <ReportForm reportId={id} initialData={initialData} />
    </AdminLayout>
  )
}
