'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TokenUsageBreakdown {
  serviceType: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  totalCost: number; // Added totalCost
}

interface AnalyticsData {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCost: number; // Added totalCost
  breakdownByServiceType: TokenUsageBreakdown[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function TokenUsageDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await fetch(`/api/analytics/token-usage?${params.toString()}`);
        if (response.ok) {
          const data: AnalyticsData = await response.json();
          // Calculate totalCost for overall summary and breakdown
          const totalCost = data.breakdownByServiceType.reduce((sum, item) => sum + item.totalCost, 0);
          setAnalyticsData({ ...data, totalCost });
        } else {
          toast.error('Failed to fetch analytics data.');
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('An error occurred while fetching analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [startDate, endDate]);

  const pieChartData = analyticsData?.breakdownByServiceType.map(item => ({
    name: item.serviceType,
    value: item.totalTokens,
  })) || [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Token Usage Analytics</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="flex space-x-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading analytics data...</div>
      ) : analyticsData ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Input Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.totalInputTokens}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Output Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.totalOutputTokens}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.totalTokens}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analyticsData.totalCost.toFixed(4)}</div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Usage by Service Type (Tokens)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={analyticsData.breakdownByServiceType}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="serviceType" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="inputTokens" fill="#8884d8" name="Input Tokens" />
                <Bar dataKey="outputTokens" fill="#82ca9d" name="Output Tokens" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Total Tokens Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => percent ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">No analytics data available.</div>
      )}
    </div>
  );
}
