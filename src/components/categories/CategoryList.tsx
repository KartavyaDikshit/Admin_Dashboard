'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { formatDateTime, cn } from '@/lib/utils';
import { Category as CategoryType } from '@prisma/client';
import { useSession } from 'next-auth/react';

type CategoryWithCounts = CategoryType & {
  _count: {
    reports: number;
    translations: number;
  };
};

interface CategoryListProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
  };
}

export default function CategoryList({ searchParams }: CategoryListProps) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const [categories, setCategories] = useState<CategoryWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 100, total: 0, totalPages: 1 });
  const [translatingId, setTranslatingId] = useState<string | null>(null);

  const queryParams = useMemo(() => new URLSearchParams(searchParams), [searchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/categories?${queryParams.toString()}`);
        const data = await response.json();
        
        if (response.ok) {
          setCategories(data.categories);
          setPagination(data.pagination);
        } else {
          toast.error(data.error || 'Failed to load categories');
        }
      } catch {
        toast.error('An error occurred while loading categories.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [queryParams]);

  const handleTranslateCategory = async (categoryId: string) => {
    setTranslatingId(categoryId);
    toast.loading(`Translating category ${categoryId}...`);
    try {
      const response = await fetch(`/api/categories/${categoryId}/translate`, {
        method: 'POST',
      });
      const result = await response.json();
      toast.dismiss();
      if (response.ok) {
        toast.success(result.message);
        // Optionally refresh the data
      } else {
        toast.error(result.error || 'Failed to translate category.');
      }
    } catch {
      toast.dismiss();
      toast.error('An error occurred during translation.');
    } finally {
      setTranslatingId(null);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Category deleted');
        setCategories(prev => prev.filter(c => c.id !== categoryId));
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete category');
      }
    } catch {
      toast.error('An error occurred while deleting the category.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage market research categories ({pagination.total} total)
          </p>
        </div>
        <Link
          href="/admin/categories/create"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create Category
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories found</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li key={category.id} className="px-4 py-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                          className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                        >
                          {category.name}
                        </Link>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                          <span>Shortcode: {category.shortcode}</span>
                          <span>Reports: {category._count.reports}</span>
                          <span>Translations: {category._count.translations}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          category.status === 'PUBLISHED' && 'bg-green-100 text-green-800',
                          category.status === 'DRAFT' && 'bg-yellow-100 text-yellow-800',
                          category.status === 'ARCHIVED' && 'bg-gray-100 text-gray-800'
                        )}>
                          {category.status}
                        </span>
                        {category.featured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                          className="text-xs text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleTranslateCategory(category.id)}
                          disabled={translatingId === category.id}
                          className="text-xs text-blue-600 hover:text-blue-900 font-medium disabled:opacity-50"
                        >
                          {translatingId === category.id ? 'Translating...' : 'Translate'}
                        </button>
                        {userRole === 'SUPERADMIN' && (
                          <button
                            onClick={() => deleteCategory(category.id)}
                            className="text-xs text-red-600 hover:text-red-900 font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Created {formatDateTime(new Date(category.createdAt))}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}