'use client';

import { useState, useCallback } from 'react';
import PromptOutput from '@/components/ai/PromptOutput'; // Modified import path
import { PROMPT_CONFIGS, PromptResult, TokenUsage } from '@/types/ai'; // Modified import path

interface Props {
  reportTitle: string;
  onReportTitleChange: (title: string) => void;
}

export const ReportGenerator: React.FC<Props> = ({ reportTitle, onReportTitleChange }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [results, setResults] = useState<PromptResult[]>([]);
  const [totalTokenUsage, setTotalTokenUsage] = useState<TokenUsage>({
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    cost: 0
  });
  const [error, setError] = useState<string>('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null); // State to hold the session ID

  const promptIds = ['prompt1', 'prompt2', 'prompt3', 'prompt4'];

  const generateSinglePrompt = useCallback(async (promptId: string, sessionId: string) => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId,
          reportTitle,
          useOptimizations: true,
          workflowId: sessionId, // Pass the session ID as workflowId
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      const result: PromptResult = {
        promptId,
        title: PROMPT_CONFIGS[promptId].title,
        content: data.data.content,
        tokenUsage: data.data.tokenUsage,
        timestamp: new Date(),
        executionTime: data.data.executionTime
      };

      return result;
    } catch (error) {
      throw new Error(`Failed to generate ${promptId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [reportTitle]);

  const startGeneration = useCallback(async () => {
    if (!reportTitle.trim()) {
      setError('Please enter a report title');
      return;
    }

    setIsGenerating(true);
    setError('');
    setResults([]);
    setCurrentPromptIndex(0);
    setTotalTokenUsage({ inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0 });
    setCurrentSessionId(null); // Reset session ID at the start of a new generation

    try {
      let sessionId: string | null = null;
      const newResults: PromptResult[] = [];
      let cumulativeTokenUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0 };

      for (let i = 0; i < promptIds.length; i++) {
        setCurrentPromptIndex(i);

        // For the first prompt, create a new session and get its ID
        if (i === 0) {
          const initialResponse = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              promptId: promptIds[i],
              reportTitle,
              useOptimizations: true,
            }),
          });
          const initialData = await initialResponse.json();
          if (!initialData.success) {
            throw new Error(initialData.error);
          }
          sessionId = initialData.data.sessionId; // Get the new session ID
          setCurrentSessionId(sessionId);

          const result: PromptResult = {
            promptId: promptIds[i],
            title: PROMPT_CONFIGS[promptIds[i]].title,
            content: initialData.data.content,
            tokenUsage: initialData.data.tokenUsage,
            timestamp: new Date(),
            executionTime: initialData.data.executionTime
          };
          newResults.push(result);
        } else {
          // For subsequent prompts, use the existing session ID
          if (!sessionId) throw new Error('Session ID not found for subsequent prompts.');
          const result = await generateSinglePrompt(promptIds[i], sessionId);
          newResults.push(result);
        }

        setResults([...newResults]);

        // Update cumulative token usage
        cumulativeTokenUsage = {
          inputTokens: cumulativeTokenUsage.inputTokens + newResults[i].tokenUsage.inputTokens,
          outputTokens: cumulativeTokenUsage.outputTokens + newResults[i].tokenUsage.outputTokens,
          totalTokens: cumulativeTokenUsage.totalTokens + newResults[i].tokenUsage.totalTokens,
          cost: cumulativeTokenUsage.cost + newResults[i].tokenUsage.cost
        };
        setTotalTokenUsage(cumulativeTokenUsage);

        // Small delay between prompts for better UX
        if (i < promptIds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // After all prompts are generated, finalize the report
      console.log('Attempting to finalize report with sessionId:', sessionId, 'and reportTitle:', reportTitle);
      const finalizeResponse = await fetch('/api/admin-dashboard/reports/finalize-ai-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId, // Use the session ID
          reportTitle: reportTitle,
        }),
      });

      console.log('Finalize report API response status:', finalizeResponse.status);

      if (!finalizeResponse.ok) {
        const errorData = await finalizeResponse.json();
        console.error('Finalize report API error response:', errorData);
        throw new Error(errorData.error || `Failed to finalize report: ${finalizeResponse.statusText}`);
      }

      const finalizeData = await finalizeResponse.json();
      console.log('Finalize report API success data:', finalizeData);

      if (!finalizeData.success) {
        throw new Error(finalizeData.error || 'Failed to finalize report.');
      }

      toast.success('Report finalized and saved successfully!');

    } catch (error) {
      console.error('Error during report finalization:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during generation');
    } finally {
      setIsGenerating(false);
      setCurrentPromptIndex(0);
    }
  }, [reportTitle, generateSinglePrompt]);

  const regenerateReport = useCallback(async () => {
    if (!reportTitle.trim()) {
      setError('Please enter a report title');
      return;
    }

    try {
      // Optimize context for regeneration
      await fetch('/api/generate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportTitle, sessionId: currentSessionId }), // Pass currentSessionId
      });

      // Start generation process
      await startGeneration();
    } catch (error) {
      setError(`Regeneration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [reportTitle, startGeneration, currentSessionId]);

  const resetSession = useCallback(async () => {
    try {
      if (currentSessionId) {
        await fetch(`/api/generate?action=reset&sessionId=${currentSessionId}`);
      }
      setResults([]);
      setTotalTokenUsage({ inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0 });
      setCurrentPromptIndex(0);
      setError('');
      setCurrentSessionId(null); // Clear session ID on reset
    } catch (error) {
      setError(`Reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [currentSessionId]);

  const getProgressPercentage = () => {
    if (!isGenerating) return results.length > 0 ? 100 : 0;
    return ((currentPromptIndex + 1) / promptIds.length) * 100;
  };

  return (
    <div className="space-y-6">

      {/* Input Section */}
      <div className="card">
        <div className="card-body">
          <div className="space-y-4">
            <div>
              <label htmlFor="reportTitle" className="form-label">
                Report Title
              </label>
              <input
                id="reportTitle"
                type="text"
                className="form-control"
                placeholder="Enter market or topic for analysis (e.g., Genetic Disease Diagnosis)"
                value={reportTitle}
                onChange={(e) => onReportTitleChange(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={startGeneration}
                disabled={isGenerating || !reportTitle.trim()}
                className="btn btn-primary"
              >
                {isGenerating ? 'Generating...' : 'Start Generation'}
              </button>

              <button
                onClick={regenerateReport}
                disabled={isGenerating || results.length === 0}
                className="btn btn-secondary"
              >
                Regenerate Report
              </button>

              <button
                onClick={resetSession}
                disabled={isGenerating}
                className="btn btn-outline"
              >
                Reset
              </button>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      {(isGenerating || results.length > 0) && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">
              Progress: {results.length} of 4 prompts completed
            </h3>
          </div>
          <div className="card-body">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {isGenerating ? `Generating ${PROMPT_CONFIGS[promptIds[currentPromptIndex]]?.title}...` : 'Generation completed'}
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, index) => (
            <PromptOutput
              key={`${result.promptId}-${index}`}
              result={result}
              index={index + 1}
            />
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {results.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Report Summary</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {totalTokenUsage.totalTokens.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Tokens</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ${totalTokenUsage.cost.toFixed(4)}
                </div>
                <div className="text-sm text-gray-600">Total Cost</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {results.reduce((sum, r) => sum + r.executionTime, 0)}ms
                </div>
                <div className="text-sm text-gray-600">Total Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(totalTokenUsage.totalTokens / results.length)}
                </div>
                <div className="text-sm text-gray-600">Avg Tokens/Prompt</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};