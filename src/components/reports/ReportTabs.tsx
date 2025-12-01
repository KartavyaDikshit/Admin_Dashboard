'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ReportTabsProps {
  summaryContent: React.ReactNode;
  tocContent: React.ReactNode;
  labels: {
    summary: string;
    toc: string;
  };
}

export default function ReportTabs({ summaryContent, tocContent, labels }: ReportTabsProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'toc'>('summary');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('summary')}
          className={cn(
            "flex-1 py-4 px-6 text-center font-bold text-sm md:text-base transition-colors uppercase tracking-wide",
            activeTab === 'summary'
              ? "bg-white text-indigo-600 border-b-2 border-indigo-600"
              : "bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          )}
        >
          {labels.summary}
        </button>
        <button
          onClick={() => setActiveTab('toc')}
          className={cn(
            "flex-1 py-4 px-6 text-center font-bold text-sm md:text-base transition-colors uppercase tracking-wide",
            activeTab === 'toc'
              ? "bg-white text-indigo-600 border-b-2 border-indigo-600"
              : "bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          )}
        >
          {labels.toc}
        </button>
      </div>
      
      <div className="p-6 md:p-8">
        {activeTab === 'summary' ? summaryContent : tocContent}
      </div>
    </div>
  );
}
