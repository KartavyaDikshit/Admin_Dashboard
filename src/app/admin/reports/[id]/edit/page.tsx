'use client'

import React, { useEffect, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import ReportForm from '@/components/reports/ReportForm'
import { toast } from 'react-hot-toast'

export default function EditReportPage({ params }: { params: { id: string } }) {
  const { id } = React.use(params)
  const [initialData, setInitialData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [targetLocale, setTargetLocale] = useState('es') // Default to Spanish, or another common locale
  const [isTranslating, setIsTranslating] = useState(false)

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

  const handleTranslate = async () => {
    if (!targetLocale) {
      toast.error('Please select a target locale.')
      return
    }
    setIsTranslating(true)
    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType: 'REPORT',
          contentId: id,
          targetLocale,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Translation job started for ${targetLocale}. Job ID: ${data.job.id}`)
        // Optionally, you might want to refetch the report or update its state
        // to reflect the new translation status or link to the translation job.
      } else {
        toast.error(data.error || 'Failed to start translation job.')
      }
    } catch (error) {
      console.error('Error initiating translation:', error)
      toast.error('An error occurred while initiating translation.')
    } finally {
      setIsTranslating(false)
    }
  }

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
          <h2 className="text-2xl font-semibold text-black">Report Not Found</h2>
          <p className="mt-2 text-black">The report you are looking for does not exist.</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-black">Edit Report</h1>

        {/* Translation Section */}
        <div className="mb-6 p-4 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-3 text-black">Translate Report</h2>
          <div className="flex items-center space-x-3">
            <select
              value={targetLocale}
              onChange={(e) => setTargetLocale(e.target.value)}
              className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isTranslating}
            >
              <option value="">Select Locale</option>
              <option value="es">Spanish (es)</option>
              <option value="de">German (de)</option>
              <option value="fr">French (fr)</option>
              {/* Add more locales as needed */}
            </select>
            <button
              onClick={handleTranslate}
              disabled={isTranslating || !targetLocale}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTranslating ? 'Translating...' : 'Translate'}
            </button>
          </div>
          {isTranslating && <p className="mt-2 text-sm text-black">Translation in progress. This may take a moment.</p>}}
        </div>

        {initialData && (
          <ReportForm reportId={id} initialData={initialData} />
        )}
      </div>
    </AdminLayout>
  )
}