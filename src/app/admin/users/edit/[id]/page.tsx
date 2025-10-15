
'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { AdminForm } from '@/components/admin/AdminForm';
import { useParams } from 'next/navigation';

export default function EditAdminPage() {
  const params = useParams();
  const { id } = params;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Edit Admin</h1>
      <AdminForm adminId={id as string} />
    </AdminLayout>
  );
}
