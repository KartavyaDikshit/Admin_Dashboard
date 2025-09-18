'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { ReportGenerator } from '@/components/ai/ReportGenerator';
import { TokenMetrics } from '@/components/ai/TokenMetrics';
import { ProgressTracker } from '@/components/ai/ProgressTracker';

export default function AdminDashboardPage() {
  const [reportTitle, setReportTitle] = useState('');

  return (
    <AdminLayout>
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
    </AdminLayout>
  );
}