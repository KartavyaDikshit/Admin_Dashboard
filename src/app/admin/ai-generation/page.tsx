
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { toast } from 'sonner';

export default function AiGenerationPage() {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Report title is required.');
      return;
    }

    setIsLoading(true);
    toast.loading('Generating report sections...');

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      const data = await response.json();
      toast.dismiss();

      if (response.ok) {
        toast.success('Report generated successfully! Redirecting to editor...');
        router.push(`/admin/reports/${data.id}/edit`);
      } else {
        toast.error(data.error || 'Failed to generate report.');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('An unexpected error occurred.');
      console.error('Generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New AI-Generated Report</h1>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Report Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Global Market for Renewable Energy"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-2">
                The 4 main sections of the report will be generated in English based on this title.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !title.trim()}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
