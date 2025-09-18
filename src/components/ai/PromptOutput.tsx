'use client';

import { useState } from 'react';

// Helper functions can be defined outside the component
// if they don't rely on props or state.
const formatTimestamp = (date: string | number) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date(date));
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 6
  }).format(amount);
};

const getWordCount = (text: string) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
};

const getReadingTime = (text: string) => {
  if (!text) return 0;
  const wordsPerMinute = 200;
  const words = getWordCount(text);
  return Math.ceil(words / wordsPerMinute);
};

// Define the props type for the component
interface PromptOutputProps {
  index: number;
  result: {
    title: string;
    timestamp: string | number;
    tokenUsage: {
      totalTokens: number;
      inputTokens: number;
      outputTokens: number;
      cost: number;
    };
    executionTime: number;
    content: string;
    promptId: string;
  };
}

export default function PromptOutput({ index, result }: PromptOutputProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMetrics, setShowMetrics] = useState(true);

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                {index}
              </div>
              <div>
                <h3 className="text-lg font-medium">{result.title}</h3>
                <p className="text-sm text-gray-500">
                  Generated at {formatTimestamp(result.timestamp)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              className="btn btn-outline text-xs"
            >
              {showMetrics ? 'Hide' : 'Show'} Metrics
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="btn btn-outline text-xs"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Panel */}
      {showMetrics && (
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {result.tokenUsage.totalTokens.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Total Tokens</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(result.tokenUsage.cost)}
                </div>
                <div className="text-xs text-gray-600">Cost</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">
                  {result.executionTime}ms
                </div>
                <div className="text-xs text-gray-600">Exec Time</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">
                  {getWordCount(result.content)}
                </div>
                <div className="text-xs text-gray-600">Words</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">
                  {getReadingTime(result.content)} min
                </div>
                <div className="text-xs text-gray-600">Read Time</div>
              </div>
            </div>
            
            {/* Token Breakdown */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-center space-x-6 text-sm">
                <span className="text-gray-600">
                  Input: <span className="font-mono">{result.tokenUsage.inputTokens.toLocaleString()}</span> tokens
                </span>
                <span className="text-gray-600">
                  Output: <span className="font-mono">{result.tokenUsage.outputTokens.toLocaleString()}</span> tokens
                </span>
                <span className="text-gray-600">
                  Ratio: <span className="font-mono">{(result.tokenUsage.outputTokens / result.tokenUsage.inputTokens).toFixed(2)}</span>:1
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {isExpanded && (
        <div className="card-body">
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {result.content}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Prompt ID: {result.promptId}</span>
                <span>•</span>
                <span>{getWordCount(result.content)} words</span>
                <span>•</span>
                <span>{result.tokenUsage.totalTokens.toLocaleString()} tokens</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigator.clipboard.writeText(result.content)}
                  className="btn btn-outline text-xs"
                >
                  Copy Content
                </button>
                <button
                  onClick={() => {
                    const data = JSON.stringify(result, null, 2);
                    navigator.clipboard.writeText(data);
                  }}
                  className="btn btn-outline text-xs"
                >
                  Copy JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
