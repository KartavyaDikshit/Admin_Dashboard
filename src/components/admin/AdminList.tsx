'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Admin } from '@prisma/client';
import { useRouter } from 'next/navigation';

export function AdminList() {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchAdmins() {
    try {
      const res = await fetch('/api/admins');
      const data = await res.json();
      setAdmins(data);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await fetch(`/api/admins/${id}`, { method: 'DELETE' });
        fetchAdmins();
      } catch (error) {
        console.error('Failed to delete admin:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => router.push('/admin/users/add')} className="btn btn-primary">
          Add Admin
        </button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell>{admin.username}</TableCell>
              <TableCell>{admin.email}</TableCell>
              <TableCell>{admin.role}</TableCell>
              <TableCell>
                <button onClick={() => router.push(`/admin/users/edit/${admin.id}`)} className="btn btn-outline mr-2">
                  Edit
                </button>
                <button onClick={() => handleDelete(admin.id)} className="btn btn-secondary">
                  Delete
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
