'use client';

import { useState } from 'react';
import { ReportGenerator } from '@/components/ai/ReportGenerator';
import { TokenMetrics } from '@/components/ai/TokenMetrics';
import { ProgressTracker } from '@/components/ai/ProgressTracker';

export default function AdminDashboard() {
  const [reportTitle, setReportTitle] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AI Pipeline Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Token-optimized sequential report generation with GPT-4o mini
              </p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div>Next.js 15.4.6 • React 19.1.0</div>
              <div className="text-green-600 font-medium">Token Optimized</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Main Generator */}
          <div className="lg:col-span-2 space-y-6">
            <ReportGenerator
              reportTitle={reportTitle}
              onReportTitleChange={setReportTitle}
            />
          </div>

          {/* Right Column - Metrics and Progress */}
          <div className="space-y-6">
            <ProgressTracker />
            <TokenMetrics />
          </div>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500 space-y-2">
            <p>🚀 AI Pipeline with Advanced Token Optimization</p>
            <p>Cost Savings: 40-70% • GPT-4o mini ($0.15/1M input, $0.60/1M output)</p>
            <p className="text-xs">
              Features: Sequential prompts • Context compression • Real-time monitoring • Cost tracking
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}