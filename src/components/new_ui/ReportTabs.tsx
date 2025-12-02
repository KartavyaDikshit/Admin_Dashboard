'use client';

import { useState } from 'react';

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
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <div className="flex gap-2 items-center flex-wrap">
          <button
            onClick={() => setActiveTab('summary')}
            className={`font-bold text-2xl transition-all text-left px-6 py-3 rounded-t-lg relative ${
              activeTab === 'summary'
                ? "text-indigo-900 bg-indigo-50 border-b-4 border-indigo-600"
                : "text-gray-500 hover:text-indigo-700 hover:bg-gray-50"
            }`}
          >
            {labels.summary}
          </button>
          <button
            onClick={() => setActiveTab('toc')}
            className={`font-bold text-2xl transition-all text-left px-6 py-3 rounded-t-lg relative ${
              activeTab === 'toc'
                ? "text-indigo-900 bg-indigo-50 border-b-4 border-indigo-600"
                : "text-gray-500 hover:text-indigo-700 hover:bg-gray-50"
            }`}
          >
            {labels.toc}
          </button>
        </div>
      </div>
      
      <div>
        {activeTab === 'summary' ? summaryContent : tocContent}
      </div>
    </div>
  );
}
