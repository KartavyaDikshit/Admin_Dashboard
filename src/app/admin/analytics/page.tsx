import AdminLayout from '@/components/layout/AdminLayout'
import { ApiUsageAnalytics } from '@/components/dashboard/ApiUsageAnalytics'

export default function AdminAnalyticsPage() {
  return (
    <AdminLayout>
      <ApiUsageAnalytics />
    </AdminLayout>
  )
}
