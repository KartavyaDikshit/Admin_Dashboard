'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { toast } from 'sonner';

interface CustomizationRequest {
  id: string;
  reportId: string;
  reportTitle: string;
  requestType: string;
  name: string | null;
  description: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  createdAt: string;
}

export default function AdminCustomizationPage() {
  const [requests, setRequests] = useState<CustomizationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/customization');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      } else {
        toast.error('Failed to fetch customization requests');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (requests.length === 0) {
      toast.info('No data to export');
      return;
    }

    const headers = ['Date', 'Report Title', 'Request Type', 'Name', 'Email', 'Company', 'Phone', 'Description'];
    const rows = requests.map(r => [
      `"${new Date(r.createdAt).toLocaleString()}"`,
      `"${(r.reportTitle || '').split('"').join('""')}"`,
      `"${r.requestType}"`,
      `"${r.name || ''}"`,
      `"${r.email}"`,
      `"${r.company || ''}"`,
      `"${r.phone || ''}"`,
      `"${(r.description || '').split('"').join('""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'customization_requests.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Customization Requests</h1>
        <button 
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
          Export to Excel
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Report
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                 <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                    Loading...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                    No requests found.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm whitespace-nowrap">
                       {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <span className="inline-block px-3 py-1 font-semibold text-indigo-900 leading-tight bg-indigo-100 rounded-full text-xs">
                        {request.requestType}
                      </span>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm max-w-xs truncate" title={request.reportTitle}>
                      {request.reportTitle}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <div className="font-medium text-gray-900">{request.name}</div>
                      <div className="text-gray-500">{request.email}</div>
                      <div className="text-gray-500 text-xs">{request.phone}</div>
                      <div className="text-gray-500 text-xs">{request.company}</div>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm max-w-xs">
                       <p className="truncate" title={request.description || ''}>{request.description}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
