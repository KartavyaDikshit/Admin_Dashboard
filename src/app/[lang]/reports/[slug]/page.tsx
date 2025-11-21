'use client';

import { useEffect, useState } from 'react';
import PublicHeader from '@/components/public/PublicHeader';
import { useParams } from 'next/navigation';
import Image from 'next/image';

interface Report {
    id: string;
    slug: string,
    title: string,
    description: string,
    imageUrl: string | null,
    publishedDate: string,
    marketResearchSummary: string | null;
    marketDynamics: string | null;
    regionalInsights: string | null;
    keyMarketPlayers: string | null;
    tableOfContents: string | null;
    
}

export default function ReportPage() {
  const params = useParams();
  const { lang, slug } = params;
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/${lang}/reports/${slug}`);
        if (!response.ok) {
          throw new Error('Failed to fetch report');
        }
        const data = await response.json();
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (lang && slug) {
      fetchReport();
    }
  }, [lang, slug]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!report) return <div>Report not found</div>;

  return (
    <div>
      <PublicHeader />
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold">{report.title}</h1>
        <p className="text-sm text-gray-500 mb-4">
          Published on: {new Date(report.publishedDate).toLocaleDateString(lang as string, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        {report.imageUrl && (
            <div className="relative h-96 mb-4">
            <Image
                src={report.imageUrl}
                alt={report.title}
                layout="fill"
                objectFit="cover"
            />
            </div>
        )}
        <p className="mb-4">{report.description}</p>
        <div className="space-y-4">
            {report.marketResearchSummary && (
            <div>
                <h2 className="text-2xl font-semibold">Market Research Summary</h2>
                <p>{report.marketResearchSummary}</p>
            </div>
            )}
            {report.marketDynamics && (
            <div>
                <h2 className="text-2xl font-semibold">Market Dynamics</h2>
                <p>{report.marketDynamics}</p>
            </div>
            )}
            {report.regionalInsights && (
            <div>
                <h2 className="text-2xl font-semibold">Regional Insights</h2>
                <p>{report.regionalInsights}</p>
            </div>
            )}
            {report.keyMarketPlayers && (
            <div>
                <h2 className="text-2xl font-semibold">Key Market Players</h2>
                <p>{report.keyMarketPlayers}</p>
            </div>
            )}
            {report.tableOfContents && (
            <div>
                <h2 className="text-2xl font-semibold">Table of Contents</h2>
                <p>{report.tableOfContents}</p>
            </div>
            )}
            
        </div>
      </main>
    </div>
  );
}