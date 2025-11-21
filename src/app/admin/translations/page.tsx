'use client';

import { useState, useEffect, Fragment, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ApiUsageLog } from '@prisma/client';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatDateTime, cn } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface SummaryStats {
    totalLogs: number;
    totalCost: number;
    totalTokens: number;
    successRate: number;
}

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
        <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
);

function TranslationLogsContent() {
    const searchParams = useSearchParams();
    const [logs, setLogs] = useState<ApiUsageLog[]>([]);
    const [summary, setSummary] = useState<SummaryStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
    const [expandedLogRowId, setExpandedLogRowId] = useState<string | null>(null);

    useEffect(() => {
        const page = searchParams.get('page') || '1';
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/translations/logs?page=${page}`);
                const data = await response.json();
                if (response.ok) {
                    setLogs(data.logs);
                    setSummary(data.summary);
                    setPagination(data.pagination);
                } else {
                    toast.error(data.error || 'Failed to load translation logs');
                }
            } catch {
                toast.error('An error occurred while loading logs.');
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [searchParams]);

    const handleToggleRow = (logId: string) => {
        setExpandedLogRowId(expandedLogRowId === logId ? null : logId);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-semibold">AI Translation Usage & Logs</h1>

            {summary && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Translation Calls" value={summary.totalLogs.toLocaleString()} />
                    <StatCard title="Total Translation Cost" value={`$${Number(summary.totalCost).toFixed(4)}`} />
                    <StatCard title="Total Translation Tokens" value={summary.totalTokens.toLocaleString()} />
                    <StatCard title="Success Rate" value={`${summary.successRate.toFixed(2)}%`} />
                </div>
            )}

            <div className="bg-white shadow-sm rounded-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="w-12"></th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-12">Loading...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-12">No translation logs found.</td></tr>
                            ) : logs.map((log) => (
                                <Fragment key={log.id}>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <button onClick={() => handleToggleRow(log.id)} className="text-gray-500 hover:text-gray-700">
                                                {expandedLogRowId === log.id ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(new Date(log.createdAt))}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.serviceType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.model}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={cn('px-2 inline-flex text-xs leading-5 font-semibold rounded-full', log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                                                {log.success ? 'Success' : 'Failed'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.totalTokens.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${Number(log.totalCost).toFixed(6)}</td>
                                    </tr>
                                    {expandedLogRowId === log.id && (
                                        <tr className="bg-gray-50">
                                            <td colSpan={7} className="p-4">
                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="font-semibold text-sm text-gray-800 mb-1">Request Data</h4>
                                                        <pre className="text-xs overflow-x-auto p-2 bg-gray-100 rounded border border-gray-200">
                                                            {log.requestData ? JSON.stringify(log.requestData, null, 2) : 'Not available'}
                                                        </pre>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-sm text-gray-800 mb-1">Response Data</h4>
                                                        <pre className="text-xs overflow-x-auto p-2 bg-gray-100 rounded border border-gray-200">
                                                            {log.responseData ? JSON.stringify(log.responseData, null, 2) : 'Not available'}
                                                        </pre>
                                                    </div>
                                                    {log.errorMessage && (
                                                        <div>
                                                            <h4 className="font-semibold text-sm text-red-800 mb-1">Error Message</h4>
                                                            <pre className="text-xs whitespace-pre-wrap p-2 bg-red-50 text-red-700 rounded border border-red-200">
                                                                {log.errorMessage}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    hasNextPage={pagination.page < pagination.totalPages}
                    hasPrevPage={pagination.page > 1}
                />
            </div>
        </div>
    );
}

export default function TranslationLogsPage() {
    return (
        <AdminLayout>
            <Suspense fallback={<div>Loading...</div>}>
                <TranslationLogsContent />
            </Suspense>
        </AdminLayout>
    );
}