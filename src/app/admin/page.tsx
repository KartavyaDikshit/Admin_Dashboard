'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { AnalyticsOverview } from '@/components/dashboard/AnalyticsOverview';

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <AnalyticsOverview />
    </AdminLayout>
  );
}