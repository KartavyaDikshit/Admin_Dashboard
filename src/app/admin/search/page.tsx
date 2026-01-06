import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import AdminLayout from '@/components/layout/AdminLayout';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminSearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q || '';

  if (!query) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-700">Please enter a search term</h2>
        </div>
      </AdminLayout>
    );
  }

  // Fetch Reports
  const reports = await prisma.report.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
        { reportId: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  // Fetch Categories
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Search Results for &quot;{query}&quot;</h1>

        {/* Reports Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Reports ({reports.length})</h2>
            <Link href={`/admin/reports?search=${encodeURIComponent(query)}`} className="text-indigo-600 hover:text-indigo-800 text-sm">
              View All Reports
            </Link>
          </div>
          {reports.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <li key={report.id} className="px-4 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <Link href={`/admin/reports/${report.id}/edit`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 truncate block">
                          {report.title}
                        </Link>
                        <div className="mt-1 text-xs text-gray-500">
                          SKU: {report.sku} | ID: {report.reportId}
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        report.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500">No reports found.</p>
          )}
        </section>

        {/* Categories Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Categories ({categories.length})</h2>
            <Link href={`/admin/categories?search=${encodeURIComponent(query)}`} className="text-indigo-600 hover:text-indigo-800 text-sm">
              View All Categories
            </Link>
          </div>
          {categories.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <li key={category.id} className="px-4 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <Link href={`/admin/categories/${category.id}/edit`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 truncate block">
                          {category.name}
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500">No categories found.</p>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
