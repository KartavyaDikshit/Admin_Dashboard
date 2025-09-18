import { FC } from 'react';
import { formatDateTime } from '@/lib/utils';

interface JobDetails {
  id: string;
  phase: number;
  status: string;
  totalTokens: number;
  cost?: number; // Assuming it's a number after conversion
  outputText: string;
}

interface WorkflowDetails {
  id: string;
  reportTitle: string;
  language: string;
  workflowStatus: string;
  currentPhase: number;
  createdAt: string;
  totalTokensUsed: number;
  totalCost: string; // It's converted to string in the API
  jobs: JobDetails[];
}

interface WorkflowDetailsModalProps {
  workflow: WorkflowDetails;
  onClose: () => void;
  onApprove: (workflowId: string) => void;
  isApproving: boolean;
}

const WorkflowDetailsModal: FC<WorkflowDetailsModalProps> = ({ workflow, onClose, onApprove, isApproving }) => {
  if (!workflow) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Workflow Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>

        <div className="space-y-4">
          <p><strong>Workflow ID:</strong> {workflow.id}</p>
          <p><strong>Report Title:</strong> {workflow.reportTitle}</p>
          <p><strong>Language:</strong> {workflow.language.toUpperCase()}</p>
          <p><strong>Status:</strong> {workflow.workflowStatus.replace('_', ' ')}</p>
          <p><strong>Current Phase:</strong> {workflow.currentPhase} / 4</p>
          <p><strong>Created At:</strong> {formatDateTime(new Date(workflow.createdAt))}</p>
          <p><strong>Total Tokens Used:</strong> {workflow.totalTokensUsed || 0}</p>
          <p><strong>Total Cost:</strong> ${parseFloat(workflow.totalCost || '0').toFixed(4)}</p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Phases</h3>
          <div className="space-y-3">
            {workflow.jobs.map((job: JobDetails) => (
              <div key={job.id} className="border p-4 rounded-md">
                <p><strong>Phase {job.phase}:</strong> {job.status}</p>
                {job.status === 'COMPLETED' && (
                  <div className="mt-2 text-sm text-gray-700">
                    <p>Tokens Used: {job.totalTokens}</p>
                    <p>Cost: ${job.cost?.toFixed(4)}</p>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-indigo-600">View Output</summary>
                      <textarea
                        className="mt-2 p-2 bg-gray-100 rounded-md text-xs overflow-auto w-full h-48"
                        defaultValue={job.outputText}
                        readOnly
                      ></textarea>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>

          {workflow.workflowStatus === 'PENDING_REVIEW' && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => onApprove(workflow.id)}
                disabled={isApproving}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
              >
                {isApproving ? 'Approving...' : 'Approve Report'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowDetailsModal;