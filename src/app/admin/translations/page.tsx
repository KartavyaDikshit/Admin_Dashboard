'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { TranslationJob, TranslationBatch } from '@prisma/client' // Import TranslationBatch

const BATCH_TARGET_LOCALES = ['de', 'fr', 'it', 'ja', 'ko', 'es'] // German, French, Italian, Japanese, Korean, Spanish

export default function TranslationsPage() {
  const [translationJobs, setTranslationJobs] = useState<TranslationJob[]>([])
  const [translationBatches, setTranslationBatches] = useState<TranslationBatch[]>([]) // New state for batches
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [loadingBatches, setLoadingBatches] = useState(true)
  const [errorJobs, setErrorJobs] = useState<string | null>(null)
  const [errorBatches, setErrorBatches] = useState<string | null>(null)
  const [isTranslatingAllReports, setIsTranslatingAllReports] = useState(false)
  const [isTranslatingAllCategories, setIsTranslatingAllCategories] = useState(false)

  const fetchTranslationJobs = async () => {
    setLoadingJobs(true)
    try {
      const response = await fetch('/api/translations')
      const data = await response.json()
      if (response.ok) {
        setTranslationJobs(data.translationJobs)
      } else {
        toast.error(data.error || 'Failed to fetch translation jobs')
        setErrorJobs(data.error || 'Failed to fetch translation jobs')
      }
    } catch (err: any) {
      toast.error('An error occurred while fetching translation jobs.')
      setErrorJobs(err.message)
    } finally {
      setLoadingJobs(false)
    }
  }

  const fetchTranslationBatches = async () => {
    setLoadingBatches(true)
    try {
      const response = await fetch('/api/translations/batches')
      const data = await response.json()
      if (response.ok) {
        setTranslationBatches(data.translationBatches)
      } else {
        toast.error(data.error || 'Failed to fetch translation batches')
        setErrorBatches(data.error || 'Failed to fetch translation batches')
      }
    } catch (err: any) {
      toast.error('An error occurred while fetching translation batches.')
      setErrorBatches(err.message)
    } finally {
      setLoadingBatches(false)
    }
  }

  useEffect(() => {
    fetchTranslationJobs()
    fetchTranslationBatches()

    
  }, [])

  const handleRetryTranslation = async (jobId: string) => {
    toast(`Retrying job ${jobId} is not yet implemented.`)
  }

  const handleTranslateAll = async (contentType: 'REPORT' | 'CATEGORY') => {
    if (contentType === 'REPORT') setIsTranslatingAllReports(true)
    if (contentType === 'CATEGORY') setIsTranslatingAllCategories(true)

    try {
      const endpoint = contentType === 'REPORT'
        ? '/api/ai/translate/batch-reports'
        : '/api/ai/translate/batch-categories';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetLocales: BATCH_TARGET_LOCALES }), // Body might not be needed if locales are hardcoded in API
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Batch translation for ${contentType}s started. Batch ID: ${data.batch.id}`)
        fetchTranslationBatches() // Refresh batches list
      } else {
        toast.error(data.error || `Failed to start batch translation for ${contentType}s.`) 
      }
    } catch (error) {
      console.error(`Error initiating batch translation for ${contentType}s:`, error)
      toast.error(`An error occurred while initiating batch translation for ${contentType}s.`) 
    } finally {
      if (contentType === 'REPORT') setIsTranslatingAllReports(false)
      if (contentType === 'CATEGORY') setIsTranslatingAllCategories(false)
    }
  }

  if (loadingJobs || loadingBatches) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (errorJobs || errorBatches) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">Error loading translation data: {errorJobs || errorBatches}</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-black">Translation Management</h1>

        {/* Batch Translation Actions */}
        <div className="mb-8 p-6 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-4 text-black">Batch Translation Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleTranslateAll('REPORT')}
              disabled={isTranslatingAllReports}
              className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTranslatingAllReports ? 'Translating All Reports...' : 'Translate All Reports (7 Languages)'}
            </button>
            <button
              onClick={() => handleTranslateAll('CATEGORY')}
              disabled={isTranslatingAllCategories}
              className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTranslatingAllCategories ? 'Translating All Categories...' : 'Translate All Categories (7 Languages)'}
            </button>
          </div>
          <p className="mt-4 text-sm text-black">
            This will initiate translation for all existing {BATCH_TARGET_LOCALES.length} languages: {BATCH_TARGET_LOCALES.map(l => l.toUpperCase()).join(', ')}.
            This process runs in the background and may take a significant amount of time depending on the content volume.
          </p>
        </div>

        {/* Translation Batches List */}
        <h2 className="text-xl font-bold mb-3 text-black">Translation Batches</h2>
        <div className="overflow-x-auto bg-white shadow-sm rounded-lg mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Content Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Target Locales
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Progress
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Created At
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {translationBatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                    No translation batches found.
                  </td>
                </tr>
              ) : (
                translationBatches.map((batch) => (
                  <tr key={batch.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                      {batch.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {batch.contentType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {batch.targetLocales.map(l => l.toUpperCase()).join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${batch.progress}%` }}
                        ></div>
                      </div>
                      <span className="ml-2">{batch.progress}% ({batch.completedJobs}/{batch.totalJobs})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${batch.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : batch.status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {new Date(batch.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* Actions for batch, e.g., view details, cancel */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Individual Translation Jobs List (existing content) */}
        <h2 className="text-xl font-bold mb-3">Individual Translation Jobs</h2>
        <div className="overflow-x-auto bg-white shadow-sm rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Content Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Content ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Target Locale
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Error Message
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Created At
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {translationJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                    No individual translation jobs found.
                  </td>
                </tr>
              ) : (
                translationJobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                      {job.contentType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      <Link href={`/admin/${job.contentType.toLowerCase()}s/${job.contentId}/edit`} className="text-indigo-600 hover:text-indigo-900">
                        {job.contentId.substring(0, 8)}...
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {job.targetLocale}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : job.status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-red-500">
                      {job.errorMessage || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {new Date(job.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {job.status === 'FAILED' && (
                        <button
                          onClick={() => handleRetryTranslation(job.id)}
                          className="text-indigo-600 hover:text-indigo-900 ml-4"
                        >
                          Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}