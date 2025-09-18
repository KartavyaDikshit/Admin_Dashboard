"use client"

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';

interface CategoryTranslation {
  id: string;
  categoryId: string;
  locale: string;
  title: string | null;
  description: string | null;
  seoKeywords: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  status: string;
}

interface Category {
  id: string;
  shortcode: string;
  title: string;
  description: string | null;
  icon: string | null;
  featured: boolean;
  sortOrder: number;
  seoKeywords: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  status: string;
  translations: CategoryTranslation[];
}

interface Report {
  id: string;
  title: string;
  description: string;
  summary: string | null;
  pages: number;
  publishedDate: string;
  baseYear: number | null;
  forecastPeriod: string | null;
  tableOfContents: string | null;
  methodology: string | null;
  executiveSummary: string | null;
  reportType: string | null;
  researchMethod: string | null;
  metaTitle: string;
  metaDescription: string;
  singlePrice: number | null;
  multiPrice: number | null;
  corporatePrice: number | null;
  enterprisePrice: number | null;
  status: string;
}

export default function SimpleDashboardPage() {
  const pathname = usePathname();
  const currentLocale = pathname ? pathname.split('/')[1] || 'en' : 'en';

  const [categories, setCategories] = useState<Category[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [categoriesRes, reportsRes] = await Promise.all([
          fetch(`/api/categories?locale=${currentLocale}`),
          fetch(`/api/reports?locale=${currentLocale}`)
        ]);

        if (!categoriesRes.ok) {
          throw new Error(`Failed to fetch categories: ${categoriesRes.statusText}`);
        }
        if (!reportsRes.ok) {
          throw new Error(`Failed to fetch reports: ${reportsRes.statusText}`);
        }

        const categoriesData = await categoriesRes.json();
        const reportsData = await reportsRes.json();

        setCategories(categoriesData.categories);
        setReports(reportsData.reports);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentLocale]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Simple Dashboard ({currentLocale.toUpperCase()})</h1>
        
        <div className="mb-8">
          <LanguageSwitcher />
        </div>

        {loading && <p className="text-gray-600">Loading content...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Categories</h2>
              {categories.length === 0 ? (
                <p className="text-gray-500">No categories found for this language.</p>
              ) : (
                <ul className="space-y-4">
                  {categories.map((category) => (
                    <li key={category.id} className="bg-gray-50 p-4 rounded-md shadow-sm">
                      <h3 className="text-lg font-medium text-gray-800">{category.title} ({category.shortcode})</h3>
                      <p className="text-gray-600 text-sm mt-1">{category.description || 'No description available.'}</p>
                      <p className="text-gray-500 text-xs mt-1">Status: {category.status} | Featured: {category.featured ? 'Yes' : 'No'}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Reports</h2>
              {reports.length === 0 ? (
                <p className="text-gray-500">No reports found for this language.</p>
              ) : (
                <ul className="space-y-4">
                  {reports.map((report) => (
                                        <li key={report.id} className="bg-gray-50 p-4 rounded-md shadow-sm">
                                          <h3 className="text-lg font-medium text-gray-800">{report.title}</h3>
                                          <p className="text-gray-600 text-sm mt-1">{report.description}</p>
                                          <div className="text-gray-500 text-xs mt-1">
                                            {report.pages > 0 && <span>Pages: {report.pages} | </span>}
                                            {report.publishedDate && <span>Published: {new Date(report.publishedDate).toLocaleDateString()} | </span>}
                                            {report.status && <span>Status: {report.status} | </span>}
                                            {report.singlePrice && <span>Price: ${report.singlePrice}</span>}
                                          </div>
                                          {report.summary && <p className="text-gray-600 text-sm mt-1">Summary: {report.summary}</p>}
                                        </li>                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
