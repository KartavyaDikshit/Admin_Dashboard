'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Report {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  slug: string;
  publishedDate: string;
  // The 5 sections
  marketResearchSummary: string | null;
  marketDynamics: string | null;
  regionalInsights: string | null;
  keyMarketPlayers: string | null;
}

export default function ReportList({ lang }: { lang: string }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/${lang}/reports`);
        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }
        const data = await response.json();
        setReports(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [lang]);

  if (loading) return <div>Loading reports...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mt-8 mb-4">Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reports.map((report) => (
          <Link key={report.id} href={`/${lang}/reports/${report.slug}`}>
            <div className="border rounded-lg overflow-hidden block hover:bg-gray-100 cursor-pointer">
              {report.imageUrl && (
                <div className="relative h-48">
                  <Image
                    src={report.imageUrl}
                    alt={report.title}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{report.title}</h3>
                <p className="text-gray-700 mb-4">{report.description}</p>
                <details>
                  <summary>Details</summary>
                  <div className="mt-4 space-y-2">
                    {report.marketResearchSummary && (
                      <div>
                        <h4 className="font-semibold">Market Research Summary</h4>
                        <p>{report.marketResearchSummary}</p>
                      </div>
                    )}
                    {report.marketDynamics && (
                      <div>
                        <h4 className="font-semibold">Market Dynamics</h4>
                        <p>{report.marketDynamics}</p>
                      </div>
                    )}
                    {report.regionalInsights && (
                      <div>
                        <h4 className="font-semibold">Regional Insights</h4>
                        <p>{report.regionalInsights}</p>
                      </div>
                    )}
                    {report.keyMarketPlayers && (
                      <div>
                        <h4 className="font-semibold">Key Market Players</h4>
                        <p>{report.keyMarketPlayers}</p>
                      </div>
                    )}
                    
                  </div>
                </details>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}