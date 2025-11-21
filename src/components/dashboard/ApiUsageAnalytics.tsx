'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';
import { ApiUsageLog } from '@prisma/client';

interface ApiUsageSummary {
  totalLogs: number;
  totalTokens: number;
  totalCost: number;
  successRate: number;
}

interface ApiUsageTimeSeries {
  date: string;
  totalTokens: number;
}

interface TokenDistributionData {
  name: string;
  value: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface ApiUsageAnalyticsData {
  summary: ApiUsageSummary;
  logs: ApiUsageLog[];
  timeSeries: ApiUsageTimeSeries[];
  tokenDistribution: TokenDistributionData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function ApiUsageAnalytics() {
  const [data, setData] = useState<ApiUsageAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch only the first page with a few items for the summary
        const res = await fetch('/api/analytics/api-usage?page=1&limit=5');
        const jsonData = await res.json();
        setData(jsonData);
      } catch (error) {
        console.error('Failed to fetch API usage analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!data || !data.summary) {
    return <div>Error loading data.</div>;
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-end">
            <Link href="/admin/analytics/api-usage" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium">
                View Full API Usage Log
            </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
            <CardHeader>
                <CardTitle>Total API Calls</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{data.summary.totalLogs.toLocaleString()}</div>
            </CardContent>
            </Card>
            <Card>
            <CardHeader>
                <CardTitle>Total Tokens</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{data.summary.totalTokens.toLocaleString()}</div>
            </CardContent>
            </Card>
            <Card>
            <CardHeader>
                <CardTitle>Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${Number(data.summary.totalCost).toFixed(4)}</div>
            </CardContent>
            </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                <CardTitle>Token Usage (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="totalTokens" stroke="#8884d8" />
                    </LineChart>
                </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle>Token Distribution by Model</CardTitle>
                </CardHeader>
                <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                    <Pie
                        data={data.tokenDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => percent ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                    >
                        {data.tokenDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                    </PieChart>
                </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
            <CardTitle>Recent API Calls</CardTitle>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Date</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {data.logs && data.logs.map((log) => (
                    <TableRow key={log.id}>
                    <TableCell>{log.serviceType}</TableCell>
                    <TableCell>{log.model}</TableCell>
                    <TableCell>{log.totalTokens}</TableCell>
                    <TableCell>${Number(log.totalCost).toFixed(6)}</TableCell>
                    <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    </div>
  );
}