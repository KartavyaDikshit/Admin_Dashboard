import AdminLayout from '@/components/layout/AdminLayout';
import { AdminList } from '@/components/admin/AdminList';

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
      <AdminList />
    </AdminLayout>
  );
}