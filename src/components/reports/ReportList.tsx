'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatDateTime, cn } from '@/lib/utils';
import { Report as ReportType, Category as CategoryType } from '@prisma/client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import * as XLSX from 'xlsx';
import { useSession } from 'next-auth/react';

type ReportWithRelations = ReportType & {
  categories: CategoryType[];
  _count: {
    translations: number;
    orderItems: number;
    reviews: number;
  };
};

export default function ReportList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const [reports, setReports] = useState<ReportWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [exporting, setExporting] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  // Convert searchParams object to URLSearchParams for easier manipulation
  const queryParams = useMemo(() => {
    return new URLSearchParams(searchParams.toString());
  }, [searchParams]);

  useEffect(() => {
    // Fetch categories for filter
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories?limit=100'); // Assuming endpoint exists and returns all/many
        const data = await response.json();
        if (response.ok) {
          setCategories(data.categories || data); // Adjust based on API response structure
        }
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
        setLoading(true);
        setSelectedReports([]); // Clear selection on fetch
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

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset page to 1 on filter change
    if (key !== 'page') {
      params.set('page', '1');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    updateFilters('page', newPage.toString());
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Report deleted');
        setReports(prev => prev.filter(r => r.id !== reportId));
        setSelectedReports(prev => prev.filter(id => id !== reportId));
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete report');
      }
    } catch {
      toast.error('An error occurred while deleting the report.');
    }
  };

  const deleteSelected = async () => {
    if (selectedReports.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedReports.length} reports? This action cannot be undone.`)) return;

    let successCount = 0;
    let failCount = 0;

    // Ideally, use a bulk delete API. For now, we loop.
    // If we had a bulk delete endpoint: await fetch('/api/reports/bulk-delete', { body: JSON.stringify({ ids: selectedReports }) })
    // Iterating for safety if API doesn't support bulk
    for (const reportId of selectedReports) {
        try {
            const response = await fetch(`/api/reports/${reportId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                successCount++;
            } else {
                failCount++;
            }
        } catch (error) {
            console.error(error);
            failCount++;
        }
    }

    if (successCount > 0) {
        toast.success(`${successCount} reports deleted successfully.`);
        setReports(prev => prev.filter(r => !selectedReports.includes(r.id)));
        setSelectedReports([]);
    }
    
    if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} reports.`);
    }
  };

  const toggleSelectAll = () => {
      if (selectedReports.length === reports.length) {
          setSelectedReports([]);
      } else {
          setSelectedReports(reports.map(r => r.id));
      }
  };

  const toggleSelect = (id: string) => {
      if (selectedReports.includes(id)) {
          setSelectedReports(prev => prev.filter(rId => rId !== id));
      } else {
          setSelectedReports(prev => [...prev, id]);
      }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set('export', 'true');
      
      const response = await fetch(`/api/reports?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch reports for export');
      
      const data = await response.json();
      const reportsToExport = data.reports || [];

      if (reportsToExport.length === 0) {
        toast.info('No reports to export');
        return;
      }

      // Flatten data for Excel
      const flattenedData = reportsToExport.map((r: any) => ({
        ID: r.id,
        SKU: r.sku,
        ReportID: r.reportId,
        Title: r.title,
        TitleDescription: r.titleDescription,
        Slug: r.slug,
        Status: r.status,
        Featured: r.featured ? 'Yes' : 'No',
        PublishedDate: r.publishedDate ? new Date(r.publishedDate).toISOString().split('T')[0] : '',
        Pages: r.pages,
        SingleUserPrice: r.singlePrice,
        MultiUserPrice: r.multiPrice,
        CorporatePrice: r.corporatePrice,
        EnterprisePrice: r.enterprisePrice,
        Currency: r.currency,
        Categories: r.categories.map((c: any) => c.name).join(', '),
        Description: r.description,
        Summary: r.summary,
        TableOfContents: r.tableOfContents,
        Methodology: r.methodology,
        ExecutiveSummary: r.executiveSummary,
        MarketResearchSummary: r.marketResearchSummary,
        MarketDynamics: r.marketDynamics,
        RegionalInsights: r.regionalInsights,
        KeyMarketPlayers: r.keyMarketPlayers,
        RecentStrategicDevelopments: typeof r.recentStrategicDevelopments === 'object' ? JSON.stringify(r.recentStrategicDevelopments) : r.recentStrategicDevelopments,
        ListOfFigures: r.listOfFigures,
        KeyFindings: Array.isArray(r.keyFindings) ? r.keyFindings.join(', ') : r.keyFindings,
        ReportType: r.reportType,
        ResearchMethod: r.researchMethod,
        BaseYear: r.baseYear,
        ForecastPeriod: r.forecastPeriod,
        ImageURL: r.imageUrl,
        ImageAlt: r.imageAlt,
        MetaTitle: r.metaTitle,
        MetaDescription: r.metaDescription,
        CanonicalURL: r.canonicalUrl,
        OGTitle: r.ogTitle,
        OGDescription: r.ogDescription,
        OGImage: r.ogImage,
        TwitterTitle: r.twitterTitle,
        TwitterDescription: r.twitterDescription,
        Keywords: Array.isArray(r.keywords) ? r.keywords.join(', ') : '',
        SchemaMarkup: typeof r.schemaMarkup === 'object' ? JSON.stringify(r.schemaMarkup) : r.schemaMarkup,
        Priority: r.priority,
        ViewCount: r.viewCount ? r.viewCount.toString() : '0',
        DownloadCount: r.downloadCount ? r.downloadCount.toString() : '0',
        EnquiryCount: r.enquiryCount ? r.enquiryCount.toString() : '0',
        CreatedAt: r.createdAt ? new Date(r.createdAt).toISOString() : '',
        UpdatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(flattenedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
      XLSX.writeFile(workbook, `Reports_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Export completed');
    } catch (error) {
      console.error(error);
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Reports ({pagination.total})</h1>
        <div className="flex gap-2">
           {selectedReports.length > 0 && userRole === 'SUPERADMIN' && (
               <button 
                 onClick={deleteSelected}
                 className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
               >
                 Delete Selected ({selectedReports.length})
               </button>
           )}
           <button  
             onClick={handleExport} 
             disabled={exporting}
             className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
           >
             {exporting ? 'Exporting...' : 'Export Excel'}
           </button>
           <Link href="/admin/ai-generation" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
             Create AI Report
           </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-md shadow">
        <select 
          className="border rounded p-2 text-sm"
          value={searchParams.get('status') || 'all'}
          onChange={(e) => updateFilters('status', e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </select>

        <select 
            className="border rounded p-2 text-sm"
            value={searchParams.get('featured') || 'all'}
            onChange={(e) => updateFilters('featured', e.target.value)}
        >
            <option value="all">All Types</option>
            <option value="true">Featured</option>
            <option value="false">Standard</option>
        </select>

        <select 
          className="border rounded p-2 text-sm max-w-xs"
          value={searchParams.get('categoryId') || 'all'}
          onChange={(e) => updateFilters('categoryId', e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="p-6 text-center">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No reports found.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center">
                 <input 
                    type="checkbox" 
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={reports.length > 0 && selectedReports.length === reports.length}
                    onChange={toggleSelectAll}
                 />
                 <span className="ml-2 text-sm text-gray-700">Select All</span>
            </div>
            <ul className="divide-y divide-gray-200">
            {reports.map((report) => (
              <li key={report.id} className="px-4 py-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={selectedReports.includes(report.id)}
                        onChange={() => toggleSelect(report.id)}
                      />
                  </div>
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
                        <button
                          onClick={async () => {
                            const newStatus = !report.featured;
                            // Optimistic update
                            setReports(prev => prev.map(r => r.id === report.id ? { ...r, featured: newStatus } : r));
                            try {
                              const res = await fetch(`/api/reports/${report.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ featured: newStatus })
                              });
                              if (!res.ok) throw new Error('Failed to update');
                              toast.success(newStatus ? 'Marked as featured' : 'Removed from featured');
                            } catch {
                              // Revert on error
                              setReports(prev => prev.map(r => r.id === report.id ? { ...r, featured: !newStatus } : r));
                              toast.error('Failed to update featured status');
                            }
                          }}
                          className={cn(
                            'inline-flex items-center px-2 py-1 rounded border text-xs font-medium transition-colors',
                            report.featured 
                              ? 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200' 
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          )}
                        >
                          <span className={cn("w-3 h-3 mr-1.5 rounded-sm border flex items-center justify-center", report.featured ? "bg-purple-600 border-purple-600" : "border-gray-400")}>
                            {report.featured && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>}
                          </span>
                          Featured
                        </button>
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          report.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        )}>
                          {report.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Link href={`/en/reports/${report.slug}`} target="_blank" className="text-xs text-green-600 hover:text-green-900 font-medium">
                          View
                        </Link>
                        <Link href={`/admin/reports/${report.id}/edit`} className="text-xs text-indigo-600 hover:text-indigo-900 font-medium">
                          Edit
                        </Link>
                        {userRole === 'SUPERADMIN' && (
                          <button onClick={() => deleteReport(report.id)} className="text-xs text-red-600 hover:text-red-900 font-medium">
                            Delete
                          </button>
                        )}
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
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}