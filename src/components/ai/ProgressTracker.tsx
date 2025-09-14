'use client';

import { useState, useEffect } from 'react';
import { PROMPT_CONFIGS } from '@/types/ai'; // Modified import path

interface PromptStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  tokens?: number;
  executionTime?: number;
}

export const ProgressTracker: React.FC = () => {
  const [steps, setSteps] = useState<PromptStep[]>([
    { id: 'prompt1', title: 'Market Research Summary', status: 'pending' },
    { id: 'prompt2', title: 'Market Dynamics', status: 'pending' },
    { id: 'prompt3', title: 'Regional Insights & Segmentation', status: 'pending' },
    { id: 'prompt4', title: 'Key Players & Developments', status: 'pending' },
  ]);

  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Listen for updates from the generation process
    const checkProgress = async () => {
      try {
        const response = await fetch('/api/generate?action=session');
        const data = await response.json();

        if (data.success) {
          const results = data.data.results || [];

          const updatedSteps = steps.map(step => {
            const result = results.find((r: any) => r.promptId === step.id);
            if (result) {
              return {
                ...step,
                status: 'completed' as const,
                tokens: result.tokenUsage.totalTokens,
                executionTime: result.executionTime
              };
            }
            return step;
          });

          setSteps(updatedSteps);
        }
      } catch (error) {
        console.error('Failed to check progress:', error);
      }
    };

    if (isListening) {
      const interval = setInterval(checkProgress, 1000);
      return () => clearInterval(interval);
    }
  }, [isListening, steps]);

  const getStatusIcon = (status: PromptStep['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
      case 'running':
        return <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />;
      case 'completed':
        return <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>;
      case 'error':
        return <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>;
    }
  };

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium">Sequential Pipeline Progress</h3>
        <p className="text-sm text-gray-600">
          {completedSteps} of {steps.length} prompts completed
        </p>
      </div>

      <div className="card-body">
        {/* Overall Progress Bar */}
        <div className="mb-6">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-500 text-right">
            {Math.round(progressPercentage)}% complete
          </div>
        </div>

        {/* Step Details */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start space-x-3 p-3 rounded-md border ${
                step.status === 'running' ? 'status-running' :
                step.status === 'completed' ? 'status-completed' :
                step.status === 'error' ? 'status-error' :
                'status-pending'
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(step.status)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">
                    {index + 1}. {step.title}
                  </h4>
                  {step.status === 'running' && (
                    <div className="text-xs text-blue-600 animate-pulse">
                      Processing...
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-600 mt-1">
                  {PROMPT_CONFIGS[step.id]?.description}
                </p>

                {step.status === 'completed' && step.tokens && (
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>{step.tokens.toLocaleString()} tokens</span>
                    {step.executionTime && (
                      <span>{step.executionTime}ms</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Control Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => setIsListening(!isListening)}
            className={`btn ${isListening ? 'btn-secondary' : 'btn-outline'} text-xs`}
          >
            {isListening ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>
        </div>
      </div>
    </div>
  );
};