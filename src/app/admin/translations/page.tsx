'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { toast } from 'react-hot-toast';
import { formatDateTime } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// Define specific types to replace 'any'
interface TranslationJob {
  id: string;
  contentType: 'REPORT' | 'CATEGORY';
  contentId: string;
  sourceLocale: string;
  targetLocale: string;
  status: string; // e.g., 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  translatedText?: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  actualCost: number;
}

interface TranslationBatch {
  id: string;
  type: 'REPORT' | 'CATEGORY';
  targetLocales: string[];
  status: string; // e.g., 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
  createdAt: string;
  updatedAt: string;
  jobs: TranslationJob[];
  createdBy: string;
}

export default function TranslationsPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<TranslationBatch[]>([]);
  const [jobs, setJobs] = useState<TranslationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [isApproving, setIsApproving] = useState(false);

  const fetchTranslations = useCallback(async () => {
    setLoading(true);
    console.log('Fetching translations...');
    try {
      const batchesResponse = await fetch('/api/translations/batches');
      const batchesData: { batches?: TranslationBatch[]; error?: string } = await batchesResponse.json();
      console.log('Batches API response:', batchesData);
      if (batchesResponse.ok && batchesData.batches) {
        setBatches(batchesData.batches);
      } else {
        setBatches([]); // Ensure batches is always an array
        toast.error(batchesData.error || 'Failed to fetch batches');
      }

      const jobsResponse = await fetch('/api/translations');
      const jobsData: { jobs?: TranslationJob[]; error?: string } = await jobsResponse.json();
      console.log('Jobs API response:', jobsData);
      if (jobsResponse.ok && jobsData.jobs) {
        setJobs(jobsData.jobs);
      } else {
        setJobs([]); // Ensure jobs is always an array
        toast.error(jobsData.error || 'Failed to fetch jobs');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Error fetching translations: ${message}`);
      console.error('Fetch translations error:', error);
    } finally {
      setLoading(false);
      console.log('Finished fetching translations. Loading set to false.');
    }
  }, []);

  useEffect(() => {
    fetchTranslations();
    const interval = setInterval(fetchTranslations, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [fetchTranslations]);

  const handleApproveAllReports = async () => {
    setIsApproving(true);
    toast.loading('Approving all pending reports...');
    try {
      const response = await fetch('/api/translations/approve-all-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data: { approvedCount?: number; error?: string } = await response.json();
      toast.dismiss();
      if (response.ok) {
        toast.success(`${data.approvedCount || 0} reports approved successfully!`);
        fetchTranslations();
      } else {
        toast.error(data.error || 'Failed to approve reports');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Error approving reports: ${message}`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleDeleteBatches = async () => {
    if (selectedBatchIds.length === 0) {
      toast.error('Please select at least one batch to delete.');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedBatchIds.length} selected batch(es) and their associated jobs? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    toast.loading('Deleting batches...');
    try {
      const response = await fetch('/api/translations/batches/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchIds: selectedBatchIds }),
      });
      const data: { deletedCount?: number; error?: string } = await response.json();
      toast.dismiss();
      if (response.ok) {
        toast.success(`${data.deletedCount || 0} batch(es) deleted successfully!`);
        setSelectedBatchIds([]);
        fetchTranslations();
      } else {
        toast.error(data.error || 'Failed to delete batches');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Error deleting batches: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJobs = async () => {
    if (selectedJobIds.length === 0) {
      toast.error('Please select at least one job to delete.');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedJobIds.length} selected job(s)? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    toast.loading('Deleting jobs...');
    try {
      const response = await fetch('/api/translations/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobIds: selectedJobIds }),
      });
      const data: { deletedCount?: number; error?: string } = await response.json();
      toast.dismiss();
      if (response.ok) {
        toast.success(`${data.deletedCount || 0} job(s) deleted successfully!`);
        setSelectedJobIds([]);
        fetchTranslations();
      } else {
        toast.error(data.error || 'Failed to delete jobs');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Error deleting jobs: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Translations Management</h1>

      <div className="mb-6 flex space-x-4">
        <button
          onClick={handleApproveAllReports}
          disabled={isApproving}
          className="btn btn-primary"
        >
          {isApproving ? 'Approving...' : 'Approve All Pending Reports'}
        </button>
        <button
          onClick={handleDeleteBatches}
          disabled={selectedBatchIds.length === 0 || loading}
          className="btn btn-secondary"
        >
          Delete Selected Batches
        </button>
        <button
          onClick={handleDeleteJobs}
          disabled={selectedJobIds.length === 0 || loading}
          className="btn btn-secondary"
        >
          Delete Selected Jobs
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading translations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Batches Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Translation Batches</h2>
            {batches.length === 0 ? (
              <p className="text-gray-600">No translation batches found.</p>
            ) : (
              <div className="space-y-4">
                {batches.map((batch: TranslationBatch) => (
                  <div key={batch.id} className="bg-white shadow-md rounded-lg p-4">
                    <div className="flex items-center mb-2">
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
                      <h3 className="text-lg font-bold text-gray-900 ml-2">Batch ID: {batch.id}</h3>
                    </div>
                    <p>Type: {batch.type}</p>
                    <p>Target Locales: {batch.targetLocales.join(', ')}</p>
                    <p>Status: {batch.status}</p>
                    <p>Created By: {batch.createdBy}</p>
                    <p>Created At: {formatDateTime(new Date(batch.createdAt))}</p>
                    
                    {batch.jobs.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-md font-semibold text-gray-700 mb-2">Jobs in this Batch</h4>
                        <div className="space-y-2">
                          {batch.jobs.map((job: TranslationJob) => (
                            <div key={job.id} className="bg-gray-50 p-3 rounded-md text-sm">
                              <p>Job ID: {job.id}</p>
                              <p>Content: {job.contentType} {job.contentId}</p>
                              <p>Locale: {job.sourceLocale} &rarr; {job.targetLocale}</p>
                              <p>Status: {job.status}</p>
                              {job.errorMessage && <p className="text-red-500">Error: {job.errorMessage}</p>}
                              <p>Cost: ${job.actualCost.toFixed(4)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Individual Jobs Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Individual Translation Jobs</h2>
            {jobs.length === 0 ? (
              <p className="text-gray-600">No individual translation jobs found.</p>
            ) : (
              <div className="space-y-4">
                {jobs.map((job: TranslationJob) => (
                  <div key={job.id} className="bg-white shadow-md rounded-lg p-4">
                    <div className="flex items-center mb-2">
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
                      <h3 className="text-lg font-bold text-gray-900 ml-2">Job ID: {job.id}</h3>
                    </div>
                    <p>Content: {job.contentType} {job.contentId}</p>
                    <p>Locale: {job.sourceLocale} &rarr; {job.targetLocale}</p>
                    <p>Status: {job.status}</p>
                    {job.errorMessage && <p className="text-red-500">Error: {job.errorMessage}</p>}
                    <p>Cost: ${job.actualCost.toFixed(4)}</p>
                    <p>Created At: {formatDateTime(new Date(job.createdAt))}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}