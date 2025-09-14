import AdminLayout from '@/components/layout/AdminLayout'
import ReportList from '@/components/reports/ReportList'

export default function AdminReportsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  return (
    <AdminLayout>
      <ReportList searchParams={searchParams} />
    </AdminLayout>
  )
}
