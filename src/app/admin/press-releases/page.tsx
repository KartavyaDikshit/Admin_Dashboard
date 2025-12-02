'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';

interface PressRelease {
  id: string;
  title: string;
  publishedAt: string | null;
  published: boolean;
  categories: { name: string }[];
}

export default function PressReleaseList() {
  const [items, setItems] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/press-releases');
      const data = await res.json();
      if (res.ok) setItems(data.pressReleases);
    } catch {
      toast.error('Failed to load press releases');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
        const res = await fetch(`/api/press-releases/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setItems(items.filter(i => i.id !== id));
            toast.success('Deleted successfully');
        }
    } catch {
        toast.error('Failed to delete');
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Press Releases</h1>
        <Link href="/admin/press-releases/new" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Create New
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
            <div className="p-4 text-center">Loading...</div>
        ) : (
            <ul className="divide-y divide-gray-200">
            {items.map((item) => (
                <li key={item.id} className="px-4 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href={`/admin/press-releases/${item.id}/edit`} className="text-indigo-600 font-medium hover:underline">
                            {item.title}
                        </Link>
                        <div className="text-sm text-gray-500 mt-1">
                            {item.published ? <span className="text-green-600 font-medium">Published</span> : <span className="text-yellow-600 font-medium">Draft</span>}
                            {' • '}
                            {item.categories.map(c => c.name).join(', ') || 'No Category'}
                            {' • '}
                            {item.publishedAt ? formatDateTime(new Date(item.publishedAt)) : 'Not published'}
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <Link href={`/admin/press-releases/${item.id}/edit`} className="text-gray-600 hover:text-gray-900">Edit</Link>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </div>
                </div>
                </li>
            ))}
            {items.length === 0 && <li className="px-4 py-4 text-center text-gray-500">No press releases found.</li>}
            </ul>
        )}
      </div>
    </AdminLayout>
  );
}
