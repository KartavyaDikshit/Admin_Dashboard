'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { TranslationJob, TranslationJobStatus } from '@prisma/client';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatDateTime, cn } from '@/lib/utils';
import { ArrowRightIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const getStatusColor = (status: TranslationJobStatus) => {
    switch (status) {
        case 'COMPLETED': return 'bg-green-100 text-green-800';
        case 'PROCESSING': return 'bg-blue-100 text-blue-800';
        case 'PENDING': return 'bg-yellow-100 text-yellow-800';
        case 'FAILED': return 'bg-red-100 text-red-800';
        case 'CANCELLED': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getStatusIcon = (status: TranslationJobStatus) => {
    switch (status) {
        case 'COMPLETED': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
        case 'PROCESSING': return <ClockIcon className="h-5 w-5 text-blue-500 animate-spin" />;
        case 'PENDING': return <ClockIcon className="h-5 w-5 text-yellow-500" />;
        case 'FAILED': return <XCircleIcon className="h-5 w-5 text-red-500" />;
        default: return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
    }
}

const DetailCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={cn("bg-white shadow-sm rounded-lg overflow-hidden", className)}>
        <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
                {children}
            </dl>
        </div>
    </div>
);

const DetailRow: React.FC<{ label: string; value: React.ReactNode; }> = ({ label, value }) => (
    <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value}</dd>
    </div>
);

export default function TranslationJobDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const [job, setJob] = useState<TranslationJob | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchJob = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/translations/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setJob(data);
                } else {
                    toast.error('Failed to load translation job details.');
                }
            } catch {
                toast.error('An error occurred while fetching job details.');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    if (loading) {
        return <AdminLayout><div className="text-center py-12">Loading job details...</div></AdminLayout>;
    }

    if (!job) {
        return <AdminLayout><div className="text-center py-12">Translation job not found.</div></AdminLayout>;
    }

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="bg-white shadow-sm rounded-lg p-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Translation Job Details</h1>
                        <p className="text-sm text-gray-500 mt-1">Job ID: {job.id}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {getStatusIcon(job.status)}
                        <span className={cn('text-lg font-semibold', getStatusColor(job.status).replace('bg-', 'text-'))}>
                            {job.status}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <DetailCard title="Content">
                            <div className="p-6 space-y-6">
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Original Text ({job.sourceLocale.toUpperCase()})</h4>
                                    <div className="p-4 bg-gray-50 rounded-md text-sm text-gray-800 max-h-60 overflow-y-auto">{job.originalText}</div>
                                </div>
                                <div className="flex justify-center">
                                    <ArrowRightIcon className="h-6 w-6 text-gray-400" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Translated Text ({job.targetLocale.toUpperCase()})</h4>
                                    <div className="p-4 bg-blue-50 rounded-md text-sm text-blue-800 max-h-60 overflow-y-auto">{job.translatedText || 'N/A'}</div>
                                </div>
                            </div>
                        </DetailCard>
                        {job.errorMessage && (
                             <DetailCard title="Error Details">
                                <DetailRow label="Error Code" value={job.errorCode || 'N/A'} />
                                <DetailRow label="Error Message" value={<pre className="whitespace-pre-wrap text-red-600">{job.errorMessage}</pre>} />
                            </DetailCard>
                        )}
                    </div>
                    <div className="space-y-8">
                        <DetailCard title="Job Summary">
                            <DetailRow label="Content Type" value={job.contentType} />
                            <DetailRow label="Content Field" value={job.fieldName} />
                            <DetailRow label="Source Locale" value={job.sourceLocale.toUpperCase()} />
                            <DetailRow label="Target Locale" value={job.targetLocale.toUpperCase()} />
                            <DetailRow label="Created At" value={formatDateTime(new Date(job.createdAt))} />
                            <DetailRow label="Started At" value={job.processingStarted ? formatDateTime(new Date(job.processingStarted)) : 'N/A'} />
                            <DetailRow label="Finished At" value={job.processingEnded ? formatDateTime(new Date(job.processingEnded)) : 'N/A'} />
                        </DetailCard>
                        <DetailCard title="AI Performance">
                            <DetailRow label="AI Model" value={job.aiModel} />
                            <DetailRow label="Input Tokens" value={job.inputTokens?.toLocaleString() ?? 'N/A'} />
                            <DetailRow label="Output Tokens" value={job.outputTokens?.toLocaleString() ?? 'N/A'} />
                            <DetailRow label="Total Tokens" value={job.totalTokens?.toLocaleString() ?? 'N/A'} />
                            <DetailRow label="Processing Time" value={job.processingTime ? `${job.processingTime} ms` : 'N/A'} />
                            <DetailRow label="Actual Cost" value={job.actualCost ? `$${Number(job.actualCost).toFixed(6)}` : 'N/A'} />
                        </DetailCard>
                        <DetailCard title="Quality Scores">
                            <DetailRow label="Quality" value={job.qualityScore ? `${job.qualityScore}/10` : 'N/A'} />
                            <DetailRow label="Fluency" value={job.fluencyScore ? `${job.fluencyScore}/10` : 'N/A'} />
                            <DetailRow label="Accuracy" value={job.accuracyScore ? `${job.accuracyScore}/10` : 'N/A'} />
                            <DetailRow label="Cultural Fit" value={job.culturalScore ? `${job.culturalScore}/10` : 'N/A'} />
                            <DetailRow label="SEO Relevance" value={job.seoRelevanceScore ? `${job.seoRelevanceScore}/10` : 'N/A'} />
                        </DetailCard>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
