'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import GenerationWizard from '@/components/ai/GenerationWizard'
import { toast } from 'react-hot-toast'
import { formatDateTime } from '@/lib/utils'

export default function AiGenerationPage() {
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null)
  const [workflowStatus, setWorkflowStatus] = useState<any>(null)
  const [loadingWorkflow, setLoadingWorkflow] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (currentWorkflowId) {
      interval = setInterval(fetchWorkflowStatus, 5000) // Poll every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [currentWorkflowId])

  const fetchWorkflowStatus = async () => {
    if (!currentWorkflowId) return

    setLoadingWorkflow(true)
    try {
      const response = await fetch(`/api/ai/workflow/${currentWorkflowId}`)
      const data = await response.json()
      if (response.ok) {
        setWorkflowStatus(data.workflow)
        if (data.workflow.workflowStatus !== 'GENERATING') {
          toast.success(`Workflow ${data.workflow.workflowStatus.replace('_', ' ').toLowerCase()}!`) // PENDING_REVIEW -> pending review
          setCurrentWorkflowId(null) // Stop polling if not generating
        }
      } else {
        toast.error(data.error || 'Failed to fetch workflow status')
        setCurrentWorkflowId(null) // Stop polling on error
      }
    } catch (error) {
      toast.error('An error occurred while fetching workflow status.')
      setCurrentWorkflowId(null) // Stop polling on error
    } finally {
      setLoadingWorkflow(false)
    }
  }

  const handleStartGeneration = (workflowId: string) => {
    setCurrentWorkflowId(workflowId)
    setWorkflowStatus(null) // Clear previous status
    fetchWorkflowStatus() // Fetch status immediately
  }

  const handleRegeneratePhase = async (phase: number) => {
    if (!currentWorkflowId) return

    setLoadingWorkflow(true)
    try {
      const response = await fetch(`/api/ai/workflow/${currentWorkflowId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate', phase })
      })
      const data = await response.json()
      if (response.ok) {
        toast.success(`Phase ${phase} regeneration started!`) 
        fetchWorkflowStatus() // Refresh status
      } else {
        toast.error(data.error || 'Failed to regenerate phase')
      }
    } catch (error) {
      toast.error('An error occurred during phase regeneration.')
    } finally {
      setLoadingWorkflow(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <GenerationWizard onStart={handleStartGeneration} />

        {currentWorkflowId && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Current Generation Workflow</h3>
            {loadingWorkflow && !workflowStatus ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading workflow status...</p>
              </div>
            ) : workflowStatus ? (
              <div className="space-y-4">
                <p><strong>Workflow ID:</strong> {workflowStatus.id}</p>
                <p><strong>Status:</strong> {workflowStatus.workflowStatus.replace('_', ' ')}</p>
                <p><strong>Current Phase:</strong> {workflowStatus.currentPhase} / 4</p>
                <p><strong>Industry:</strong> {workflowStatus.industry}</p>
                <p><strong>Geographic Scope:</strong> {workflowStatus.geographicScope}</p>
                <p><strong>Timeframe:</strong> {workflowStatus.timeframe}</p>
                <p><strong>Created At:</strong> {formatDateTime(new Date(workflowStatus.createdAt))}</p>

                <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-3">Phases Progress</h4>
                <div className="space-y-3">
                  {workflowStatus.jobs.map((job: any) => (
                    <div key={job.id} className="border p-4 rounded-md">
                      <p><strong>Phase {job.phase}:</strong> {job.status}</p>
                      {job.status === 'COMPLETED' && (
                        <div className="mt-2 text-sm text-gray-700">
                          <p>Quality Score: {job.qualityScore?.toFixed(2)}</p>
                          <p>Tokens Used: {job.totalTokens}</p>
                          <p>Cost: ${job.cost?.toFixed(4)}</p>
                          <p>Processing Time: {job.processingTime}ms</p>
                          <details className="mt-2">
                            <summary className="cursor-pointer text-indigo-600">View Output</summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded-md text-xs overflow-auto max-h-48">{job.outputText}</pre>
                          </details>
                          <button
                            onClick={() => handleRegeneratePhase(job.phase)}
                            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                          >
                            Regenerate Phase {job.phase}
                          </button>
                        </div>
                      )}
                      {job.status === 'FAILED' && (
                        <div className="mt-2 text-sm text-red-600">
                          <p>Error: {job.errorMessage}</p>
                          <button
                            onClick={() => handleRegeneratePhase(job.phase)}
                            className="mt-2 px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                          >
                            Retry Phase {job.phase}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No active workflow. Start a new generation above.</p>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
