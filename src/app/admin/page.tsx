import AdminLayout from '@/components/layout/AdminLayout'

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-lg text-gray-600">Welcome to the Admin Dashboard!</p>
      {/* Add dashboard content here */}
    </AdminLayout>
  )
}
