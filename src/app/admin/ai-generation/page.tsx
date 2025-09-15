'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import GenerationWizard from '@/components/ai/GenerationWizard'
import { toast } from 'react-hot-toast'
import { formatDateTime } from '@/lib/utils'

export default function AiGenerationPage() {
  const [workflows, setWorkflows] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategories, setSelectedCategories] = useState<Record<string, string[]>>({})
  const [loadingWorkflows, setLoadingWorkflows] = useState(true)
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null)

  useEffect(() => {
    const fetchAllWorkflows = async () => {
      setLoadingWorkflows(true)
      try {
        const response = await fetch('/api/ai/workflow/all')
        const data = await response.json()
        if (response.ok) {
          setWorkflows(data.workflows)
        } else {
          toast.error(data.error || 'Failed to fetch workflows')
        }
      } catch (error) {
        toast.error('An error occurred while fetching workflows.')
      } finally {
        setLoadingWorkflows(false)
      }
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (response.ok) {
          setCategories(data.categories);
        } else {
          toast.error(data.error || 'Failed to fetch categories');
        }
      } catch (error) {
        toast.error('An error occurred while fetching categories.');
      }
    };

    fetchAllWorkflows()
    fetchCategories()

    let interval: NodeJS.Timeout | null = null
    if (activeWorkflowId) {
      interval = setInterval(() => fetchWorkflowStatus(activeWorkflowId), 5000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeWorkflowId])

  const fetchWorkflowStatus = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/ai/workflow/${workflowId}`)
      const data = await response.json()
      if (response.ok) {
        setWorkflows(prevWorkflows => {
          const updatedWorkflows = prevWorkflows.map(wf => {
            if (wf.id === workflowId) {
              return { ...wf, ...data.workflow };
            }
            return wf;
          });
          return updatedWorkflows;
        });
        if (data.workflow.workflowStatus !== 'GENERATING') {
          toast.success(`Workflow ${data.workflow.workflowStatus.replace('_', ' ').toLowerCase()}!`)
          setActiveWorkflowId(null)
        }
      } else {
        toast.error(data.error || 'Failed to fetch workflow status')
        setActiveWorkflowId(null)
      }
    } catch (error) {
      toast.error('An error occurred while fetching workflow status.')
      setActiveWorkflowId(null)
    }
  }

  const handleStartGeneration = (workflowId: string, reportTitle: string) => {
    setActiveWorkflowId(workflowId)
    setWorkflows(prevWorkflows => [
      ...prevWorkflows,
      { id: workflowId, reportTitle, workflowStatus: 'GENERATING', currentPhase: 0, createdAt: new Date().toISOString(), jobs: [] }
    ])
    fetchWorkflowStatus(workflowId)
  }

  const handleRegeneratePhase = async (workflowId: string, phase: number) => {
    setLoadingWorkflows(true)
    try {
      const response = await fetch(`/api/ai/workflow/${workflowId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate', phase })
      })
      const data = await response.json()
      if (response.ok) {
        toast.success(`Phase ${phase} regeneration started!`)
        fetchWorkflowStatus(workflowId)
      } else {
        toast.error(data.error || 'Failed to regenerate phase')
      }
    } catch (error) {
      toast.error('An error occurred during phase regeneration.')
    } finally {
      setLoadingWorkflows(false)
    }
  }

  const handleSavePhaseOutput = async (workflowId: string, jobId: string, newOutput: string, imageFile?: File) => {
    setLoadingWorkflows(true)
    let imageUrl: string | undefined;

    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      try {
        const uploadResponse = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        if (uploadResponse.ok) {
          imageUrl = uploadData.imageUrl;
          toast.success('Image uploaded successfully!');
        } else {
          toast.error(uploadData.error || 'Failed to upload image.');
          setLoadingWorkflows(false);
          return;
        }
      } catch (uploadError) {
        toast.error('An error occurred during image upload.');
        setLoadingWorkflows(false);
        return;
      }
    }

    try {
      const response = await fetch(`/api/ai/workflow/${workflowId}/job/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outputText: newOutput, imageUrl })
      })
      const data = await response.json()
      if (response.ok) {
        toast.success(`Phase output saved successfully!`)
        fetchWorkflowStatus(workflowId)
      } else {
        toast.error(data.error || 'Failed to save phase output')
      }
    } catch (error) {
      toast.error('An error occurred during saving phase output.')
    } finally {
      setLoadingWorkflows(false)
    }
  }

  const handleImageChange = (jobId: string, file: File | null) => {
    // This function is now handled within handleSavePhaseOutput
  };

  const handleApproveReport = async (workflowId: string) => {
    const categoryIds = selectedCategories[workflowId] || [];
    if (categoryIds.length === 0) {
      toast.error('Please select at least one category.');
      return;
    }

    try {
      const response = await fetch(`/api/ai/workflow/${workflowId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', categoryIds }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Report approved successfully!');
        setWorkflows(prevWorkflows =>
          prevWorkflows.map(wf =>
            wf.id === workflowId ? { ...wf, workflowStatus: 'COMPLETED' } : wf
          )
        );
      } else {
        toast.error(data.error || 'Failed to approve report.');
      }
    } catch (error) {
      toast.error('An error occurred while approving the report.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <GenerationWizard onStart={handleStartGeneration} />

        {loadingWorkflows ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading workflows...</p>
          </div>
        ) : workflows.length === 0 ? (
          <p className="text-gray-600">No workflows found. Start a new generation above.</p>
        ) : (
          <div className="space-y-6">
            {workflows.map((workflow: any) => (
              <div key={workflow.id} className="bg-white shadow-lg rounded-lg p-6 text-black">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Workflow: {workflow.reportTitle}</h3>
                <div className="space-y-4">
                  <p><strong>Workflow ID:</strong> {workflow.id}</p>
                  <p><strong>Status:</strong> {workflow.workflowStatus.replace('_', ' ')}</p>
                  <p><strong>Current Phase:</strong> {workflow.currentPhase} / 4</p>
                  <p><strong>Created At:</strong> {formatDateTime(new Date(workflow.createdAt))}</p>
                  <p><strong>Total Tokens Used:</strong> {workflow.totalTokensUsed || 0}</p>
                  <p><strong>Total Cost:</strong> ${parseFloat(workflow.totalCost || '0').toFixed(4)}</p>

                  <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-3">Phases Progress</h4>
                  <div className="space-y-3">
                    {workflow.jobs.map((job: any) => (
                      <div key={job.id} className="border p-4 rounded-md">
                        <p><strong>Phase {job.phase}:</strong> {job.status}</p>
                        {job.status === 'COMPLETED' && (
                          <div className="mt-2 text-sm text-gray-700">
                            <p>Tokens Used: {job.totalTokens}</p>
                            <p>Cost: ${job.cost?.toFixed(4)}</p>
                            <details className="mt-2">
                              <summary className="cursor-pointer text-indigo-600">View/Edit Output</summary>
                              <textarea
                                className="mt-2 p-2 bg-gray-100 rounded-md text-xs overflow-auto w-full h-48"
                                defaultValue={job.outputText}
                                onBlur={(e) => handleSavePhaseOutput(workflow.id, job.id, e.target.value, null)}
                              ></textarea>
                              <div className="mt-2">
                                <label htmlFor={`image-upload-${job.id}`} className="block text-sm font-medium text-gray-700">Upload Image (Optional)</label>
                                <input
                                  type="file"
                                  id={`image-upload-${job.id}`}
                                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                  onChange={(e) => handleSavePhaseOutput(workflow.id, job.id, job.outputText, e.target.files?.[0])}
                                />
                                {job.imageUrl && (
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-500">Current Image:</p>
                                    <img src={job.imageUrl} alt="Uploaded" className="mt-1 max-w-full h-auto rounded-md" />
                                  </div>
                                )}
                              </div>
                            </details>
                            <div className="flex space-x-2 mt-2">
                              <button
                                onClick={() => handleRegeneratePhase(workflow.id, job.phase)}
                                className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                              >
                                Regenerate Phase {job.phase}
                              </button>
                            </div>
                          </div>
                        )}
                        {job.status === 'FAILED' && (
                          <div className="mt-2 text-sm text-red-600">
                            <p>Error: {job.errorMessage}</p>
                            <button
                              onClick={() => handleRegeneratePhase(workflow.id, job.phase)}
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

                {workflow.workflowStatus === 'PENDING_REVIEW' && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Assign Categories</h4>
                    <div className="flex flex-wrap gap-4">
                      {categories.map(category => (
                        <label key={category.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedCategories[workflow.id]?.includes(category.id) || false}
                            onChange={(e) => {
                              const { checked } = e.target;
                              setSelectedCategories(prev => {
                                const currentSelection = prev[workflow.id] || [];
                                if (checked) {
                                  return { ...prev, [workflow.id]: [...currentSelection, category.id] };
                                } else {
                                  return { ...prev, [workflow.id]: currentSelection.filter(id => id !== category.id) };
                                }
                              });
                            }}
                          />
                          <span>{category.title}</span>
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={() => handleApproveReport(workflow.id)}
                      className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Approve Report
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
