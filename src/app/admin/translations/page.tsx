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
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([])
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [isApprovingAllReports, setIsApprovingAllReports] = useState(false)
  const [isApprovingAllWorkflows, setIsApprovingAllWorkflows] = useState(false)

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

  const handleDeleteSelectedBatches = async () => {
    if (selectedBatchIds.length === 0) {
      toast.error('Please select at least one batch to delete.');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedBatchIds.length} selected batch(es)? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    toast.loading('Deleting batches...');

    try {
      const response = await fetch('/api/translations/batches/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchIds: selectedBatchIds }),
      });

      const data = await response.json();
      toast.dismiss();

      if (response.ok) {
        toast.success(`${data.deletedCount} batch(es) deleted successfully!`);
        setSelectedBatchIds([]);
        fetchTranslationBatches();
      } else {
        toast.error(data.error || 'Failed to delete batches.');
      }
    } catch (error) {
      toast.error('An error occurred while deleting batches.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAllBatches = async () => {
    if (translationBatches.length === 0) {
      toast.error('No batches to delete.');
      return;
    }

    if (!confirm(`Are you sure you want to delete ALL batches? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    toast.loading('Deleting all batches...');

    try {
      const allBatchIds = translationBatches.map(batch => batch.id);
      const response = await fetch('/api/translations/batches/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchIds: allBatchIds }),
      });

      const data = await response.json();
      toast.dismiss();

      if (response.ok) {
        toast.success(`${data.deletedCount} batch(es) deleted successfully!`);
        setSelectedBatchIds([]);
        fetchTranslationBatches();
      } else {
        toast.error(data.error || 'Failed to delete all batches.');
      }
    } catch (error) {
      toast.error('An error occurred while deleting all batches.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSelectedJobs = async () => {
    if (selectedJobIds.length === 0) {
      toast.error('Please select at least one job to delete.');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedJobIds.length} selected job(s)? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    toast.loading('Deleting jobs...');

    try {
      const response = await fetch('/api/translations/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobIds: selectedJobIds }),
      });

      const data = await response.json();
      toast.dismiss();

      if (response.ok) {
        toast.success(`${data.deletedCount} job(s) deleted successfully!`);
        setSelectedJobIds([]);
        fetchTranslationJobs();
      } else {
        toast.error(data.error || 'Failed to delete jobs.');
      }
    } catch (error) {
      toast.error('An error occurred while deleting jobs.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAllJobs = async () => {
    if (translationJobs.length === 0) {
      toast.error('No jobs to delete.');
      return;
    }

    if (!confirm(`Are you sure you want to delete ALL jobs? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    toast.loading('Deleting all jobs...');

    try {
      const allJobIds = translationJobs.map(job => job.id);
      const response = await fetch('/api/translations/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobIds: allJobIds }),
      });

      const data = await response.json();
      toast.dismiss();

      if (response.ok) {
        toast.success(`${data.deletedCount} job(s) deleted successfully!`);
        setSelectedJobIds([]);
        fetchTranslationJobs();
      } else {
        toast.error(data.error || 'Failed to delete all jobs.');
      }
    } catch (error) {
      toast.error('An error occurred while deleting all jobs.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApproveAllReports = async () => {
    if (!confirm(`Are you sure you want to approve all pending reports? This action cannot be undone.`)) {
      return;
    }

    setIsApprovingAllReports(true);
    toast.loading('Approving all reports...');

    try {
      const response = await fetch('/api/translations/approve-all-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      toast.dismiss();

      if (response.ok) {
        toast.success(`${data.approvedCount} reports approved successfully!`);
        fetchTranslationJobs();
        fetchTranslationBatches();
      } else {
        toast.error(data.error || 'Failed to approve all reports.');
      }
    } catch (error) {
      toast.error('An error occurred while approving all reports.');
    } finally {
      setIsApprovingAllReports(false);
    }
  };

  const handleApproveAllWorkflows = async () => {
    if (!confirm(`Are you sure you want to approve all pending language workflows? This action cannot be undone.`)) {
      return;
    }

    setIsApprovingAllWorkflows(true);
    toast.loading('Approving all language workflows...');

    try {
      const response = await fetch('/api/ai/workflow/approve-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      toast.dismiss();

      if (response.ok) {
        toast.success(`${data.approvedCount} language workflows approved successfully!`);
        fetchTranslationJobs();
        fetchTranslationBatches();
      } else {
        toast.error(data.error || 'Failed to approve all language workflows.');
      }
    } catch (error) {
      toast.error('An error occurred while approving all language workflows.');
    } finally {
      setIsApprovingAllWorkflows(false);
    }
  };

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
        {translationBatches.length > 0 && (
          <div className="mb-4 flex space-x-4">
            <button
              onClick={handleDeleteSelectedBatches}
              disabled={selectedBatchIds.length === 0 || isDeleting}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
            >
              Delete Selected Batches
            </button>
            <button
              onClick={handleDeleteAllBatches}
              disabled={translationBatches.length === 0 || isDeleting}
              className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 disabled:bg-gray-400"
            >
              Delete All Batches
            </button>
            <button
              onClick={handleApproveAllReports}
              disabled={isApprovingAllReports}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {isApprovingAllReports ? 'Approving...' : 'Approve All Reports'}
            </button>
            <button
              onClick={handleApproveAllWorkflows}
              disabled={isApprovingAllWorkflows}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isApprovingAllWorkflows ? 'Approving...' : 'Approve All Language Workflows'}
            </button>
          </div>
        )}
        <div className="overflow-x-auto bg-white shadow-sm rounded-lg mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="relative px-6 py-3">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBatchIds(translationBatches.map(batch => batch.id));
                      } else {
                        setSelectedBatchIds([]);
                      }
                    }}
                    checked={selectedBatchIds.length === translationBatches.length && translationBatches.length > 0}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </th>
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
                      <input
                        type="checkbox"
                        checked={selectedBatchIds.includes(batch.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBatchIds(prev => [...prev, batch.id]);
                          } else {
                            setSelectedBatchIds(prev => prev.filter(id => id !== batch.id));
                          }
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </td>
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
                      {/* Actions for batch, e.e., view details, cancel */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Individual Translation Jobs List (existing content) */}
        <h2 className="text-xl font-bold mb-3">Individual Translation Jobs</h2>
        {translationJobs.length > 0 && (
          <div className="mb-4 flex space-x-4">
            <button
              onClick={handleDeleteSelectedJobs}
              disabled={selectedJobIds.length === 0 || isDeleting}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
            >
              Delete Selected Jobs
            </button>
            <button
              onClick={handleDeleteAllJobs}
              disabled={translationJobs.length === 0 || isDeleting}
              className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 disabled:bg-gray-400"
            >
              Delete All Jobs
            </button>
          </div>
        )}
        <div className="overflow-x-auto bg-white shadow-sm rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="relative px-6 py-3">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedJobIds(translationJobs.map(job => job.id));
                      } else {
                        setSelectedJobIds([]);
                      }
                    }}
                    checked={selectedJobIds.length === translationJobs.length && translationJobs.length > 0}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Content Type
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
                      <input
                        type="checkbox"
                        checked={selectedJobIds.includes(job.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedJobIds(prev => [...prev, job.id]);
                          } else {
                            setSelectedJobIds(prev => prev.filter(id => id !== job.id));
                          }
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </td>
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