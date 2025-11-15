'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { AnalyticsOverview } from '@/components/dashboard/AnalyticsOverview';
import { TokenUsageDashboard } from '@/components/dashboard/TokenUsageDashboard'; // Import the new component

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6"> {/* Add a div to space out the components */}
        <AnalyticsOverview />
        <TokenUsageDashboard /> {/* Render the new token usage dashboard */}
      </div>
    </AdminLayout>
  );
}