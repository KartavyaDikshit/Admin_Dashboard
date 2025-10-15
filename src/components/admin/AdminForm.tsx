'use client';

import { useState, useEffect } from 'react';
import { Admin, AdminRole } from '@prisma/client';
import { useRouter } from 'next/navigation';

interface AdminFormProps {
  adminId?: string;
}

export function AdminForm({ adminId }: AdminFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Admin>>({
    username: '',
    email: '',
    role: AdminRole.EDITOR,
  });

  useEffect(() => {
    if (adminId) {
      async function fetchAdmin() {
        try {
          const res = await fetch(`/api/admins/${adminId}`);
          const data = await res.json();
          setFormData(data);
        } catch (error) {
          console.error('Failed to fetch admin:', error);
        }
      }
      fetchAdmin();
    }
  }, [adminId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = adminId ? `/api/admins/${adminId}` : '/api/admins';
      const method = adminId ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      router.push('/admin/users');
    } catch (error) {
      console.error('Failed to save admin:', error);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg w-full max-w-2xl mx-auto shadow-lg border border-gray-200">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="form-control"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="form-control"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">Password</label>
          <input
            type="password"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="form-control"
            placeholder={adminId ? 'Leave blank to keep current password' : ''}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
            className="form-control"
          >
            {Object.values(AdminRole).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end">
          <button type="button" onClick={() => router.push('/admin/users')} className="btn btn-secondary mr-2">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
