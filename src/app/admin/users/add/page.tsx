
import AdminLayout from '@/components/layout/AdminLayout';
import { AdminForm } from '@/components/admin/AdminForm';

export default function AddAdminPage() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Add Admin</h1>
      <AdminForm />
    </AdminLayout>
  );
}
