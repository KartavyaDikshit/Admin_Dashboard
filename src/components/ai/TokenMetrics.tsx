'use client';

import { useState, useEffect } from 'react';
import { TokenUsage, OPTIMIZATION_STRATEGIES, TOKEN_PRICING } from '@/types/ai'; // Modified import path

interface TokenMetricsData {
  totalTokenUsage: TokenUsage;
  contextUsagePercentage: number;
  estimatedSavings: number;
  averageTokensPerPrompt: number;
}

export const TokenMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<TokenMetricsData>({
    totalTokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0 },
    contextUsagePercentage: 0,
    estimatedSavings: 0,
    averageTokensPerPrompt: 0
  });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const updateMetrics = async () => {
      try {
        const response = await fetch('/api/generate?action=session');
        const data = await response.json();

        if (data.success) {
          const sessionData = data.data;
          const results = sessionData.results || [];

          // Calculate estimated savings from optimization
          const totalTokensUsed = sessionData.totalTokenUsage?.totalTokens || 0;
          const estimatedWithoutOptimization = totalTokensUsed * 1.4; // Assume 40% savings
          const estimatedSavings = estimatedWithoutOptimization - totalTokensUsed;

          setMetrics({
            totalTokenUsage: sessionData.totalTokenUsage || { inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0 },
            contextUsagePercentage: sessionData.contextUsagePercentage || 0,
            estimatedSavings,
            averageTokensPerPrompt: results.length > 0 ? totalTokensUsed / results.length : 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    if (isLive) {
      updateMetrics();
      const interval = setInterval(updateMetrics, 2000);
      return () => clearInterval(interval);
    } else {
      updateMetrics(); // Initial fetch
    }
  }, [isLive]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 6
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Token Metrics</h3>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`btn text-xs ${isLive ? 'btn-secondary' : 'btn-outline'}`}
          >
            {isLive ? (
              <>
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse mr-2"></span>
                Live
              </>
            ) : (
              'Start Live View'
            )}
          </button>
        </div>
      </div>

      <div className="card-body">
        <div className="space-y-4">

          {/* Token Usage Breakdown */}
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-3">Token Usage</h4>
            <div className="space-y-2">
              <div className="token-metric">
                <span className="text-sm text-gray-600">Input Tokens</span>
                <span className="font-mono text-sm">
                  {formatNumber(metrics.totalTokenUsage.inputTokens)}
                </span>
              </div>
              <div className="token-metric">
                <span className="text-sm text-gray-600">Output Tokens</span>
                <span className="font-mono text-sm">
                  {formatNumber(metrics.totalTokenUsage.outputTokens)}
                </span>
              </div>
              <div className="token-metric border-t border-gray-200 pt-2">
                <span className="text-sm font-medium text-gray-900">Total Tokens</span>
                <span className="font-mono text-sm font-bold">
                  {formatNumber(metrics.totalTokenUsage.totalTokens)}
                </span>
              </div>
            </div>
          </div>

          {/* Cost Analysis */}
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-3">Cost Analysis</h4>
            <div className="space-y-2">
              <div className="token-metric">
                <span className="text-sm text-gray-600">Current Cost</span>
                <span className="font-mono text-sm text-green-600 font-medium">
                  {formatCurrency(metrics.totalTokenUsage.cost)}
                </span>
              </div>
              <div className="token-metric">
                <span className="text-sm text-gray-600">Est. Without Optimization</span>
                <span className="font-mono text-sm text-red-500">
                  {formatCurrency(metrics.totalTokenUsage.cost + (metrics.estimatedSavings * TOKEN_PRICING.GPT_4O_MINI.outputTokens / 1_000_000))}
                </span>
              </div>
              <div className="token-metric border-t border-gray-200 pt-2">
                <span className="text-sm font-medium text-green-700">Estimated Savings</span>
                <span className="font-mono text-sm font-bold text-green-600">
                  {formatCurrency((metrics.estimatedSavings * TOKEN_PRICING.GPT_4O_MINI.outputTokens / 1_000_000))}
                </span>
              </div>
            </div>
          </div>

          {/* Context Window Usage */}
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-3">Context Window</h4>
            <div className="space-y-2">
              <div className="token-metric">
                <span className="text-sm text-gray-600">Usage</span>
                <span className="text-sm font-medium">
                  {Math.round(metrics.contextUsagePercentage)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    metrics.contextUsagePercentage > 80 ? 'bg-red-500' :
                    metrics.contextUsagePercentage > 60 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(metrics.contextUsagePercentage, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500">
                {metrics.contextUsagePercentage > 80 && "⚠️ High context usage - consider compression"}
                {metrics.contextUsagePercentage <= 80 && metrics.contextUsagePercentage > 60 && "✓ Moderate context usage"}
                {metrics.contextUsagePercentage <= 60 && "✓ Optimal context usage"}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-3">Performance</h4>
            <div className="space-y-2">
              <div className="token-metric">
                <span className="text-sm text-gray-600">Avg Tokens/Prompt</span>
                <span className="font-mono text-sm">
                  {formatNumber(metrics.averageTokensPerPrompt)}
                </span>
              </div>
              <div className="token-metric">
                <span className="text-sm text-gray-600">Cost/Prompt</span>
                <span className="font-mono text-sm">
                  {metrics.averageTokensPerPrompt > 0 ? 
                    formatCurrency(metrics.totalTokenUsage.cost / Math.max(1, Math.floor(metrics.totalTokenUsage.totalTokens / metrics.averageTokensPerPrompt))) :
                    '$0.0000'
                  }
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Optimization Strategies */}
      <div className="card-body border-t border-gray-200">
        <h4 className="font-medium text-sm text-gray-700 mb-3">Active Optimizations</h4>
        <div className="space-y-2">
          {OPTIMIZATION_STRATEGIES.filter(s => s.enabled).map((strategy, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-gray-600">
                {strategy.name} ({strategy.tokenSavingsPercentage}% savings)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};