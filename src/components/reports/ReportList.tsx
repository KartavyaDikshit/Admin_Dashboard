'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatDateTime, cn } from '@/lib/utils';
import { Report as ReportType, Category as CategoryType } from '@prisma/client';

type ReportWithRelations = ReportType & {
  categories: CategoryType[];
  _count: {
    translations: number;
    orderItems: number;
    reviews: number;
  };
};

interface ReportListProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
  };
}

export default function ReportList({ searchParams }: ReportListProps) {
  const [reports, setReports] = useState<ReportWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const queryParams = useMemo(() => new URLSearchParams(searchParams), [searchParams]);

  useEffect(() => {
    const fetchReports = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/reports?${queryParams.toString()}`);
          const data = await response.json();
          
          if (response.ok) {
            setReports(data.reports);
            setPagination(data.pagination);
          } else {
            toast.error(data.error || 'Failed to load reports');
          }
        } catch {
          toast.error('An error occurred while loading reports.');
        } finally {
          setLoading(false);
        }
      };
    fetchReports();
  }, [queryParams]);

  const deleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Report deleted');
        setReports(prev => prev.filter(r => r.id !== reportId));
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete report');
      }
    } catch {
      toast.error('An error occurred while deleting the report.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reports ({pagination.total})</h1>
        <Link href="/admin/ai-generation" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Create AI Report
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="p-6 text-center">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No reports found.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {reports.map((report) => (
              <li key={report.id} className="px-4 py-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <Link href={`/admin/reports/${report.id}/edit`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 truncate">
                          {report.title}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span>SKU: {report.sku || 'N/A'}</span>
                          <span>Categories: {report.categories.map(cat => cat.name).join(', ') || 'None'}</span>
                          <span>Translations: {report._count.translations}/6</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          report.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        )}>
                          {report.status}
                        </span>
                        {report.featured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Link href={`/admin/reports/${report.id}/edit`} className="text-xs text-indigo-600 hover:text-indigo-900 font-medium">
                          Edit
                        </Link>
                        <button onClick={() => deleteReport(report.id)} className="text-xs text-red-600 hover:text-red-900 font-medium">
                          Delete
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        Created {report.createdAt ? formatDateTime(new Date(report.createdAt)) : 'N/A'}
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