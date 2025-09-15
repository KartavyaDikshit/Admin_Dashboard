'use client'

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Testimonial {
  id: string;
  author: string;
  company?: string;
  position?: string;
  content: string;
  rating?: number;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TestimonialList() {
  const router = useRouter();
  const { data: testimonials, isLoading, isError, refetch } = useQuery<Testimonial[]>({ queryKey: ['testimonials'], queryFn: async () => {
    const response = await axios.get('/api/testimonials');
    return response.data;
  }});

  const handleApproveToggle = async (id: string, currentStatus: boolean) => {
    try {
      await axios.put(`/api/testimonials/${id}`, { approved: !currentStatus });
      toast.success(`Testimonial ${!currentStatus ? 'approved' : 'unapproved'} successfully.`);
      refetch();
    } catch (error) {
      toast.error('Failed to update testimonial status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await axios.delete(`/api/testimonials/${id}`);
      toast.success('Testimonial deleted successfully.');
      refetch();
    } catch (error) {
      toast.error('Failed to delete testimonial.');
    }
  };

  if (isLoading) return <div>Loading testimonials...</div>;
  if (isError) return <div>Error loading testimonials.</div>;

  return (
    <div className="rounded-md border">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <th className="h-12 px-4 text-left align-middle font-medium text-black [&:has([role=checkbox])]:pr-0">Author</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-black [&:has([role=checkbox])]:pr-0">Company</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-black [&:has([role=checkbox])]:pr-0">Content</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-black [&:has([role=checkbox])]:pr-0">Rating</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-black [&:has([role=checkbox])]:pr-0">Approved</th>
            <th className="h-12 px-4 text-right align-middle font-medium text-black [&:has([role=checkbox])]:pr-0">Actions</th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {testimonials?.map((testimonial) => (
            <tr key={testimonial.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium text-black">{testimonial.author}</td>
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-black">{testimonial.company || 'N/A'}</td>
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 max-w-[300px] truncate text-black">{testimonial.content}</td>
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-black">{testimonial.rating || 'N/A'}</td>
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                <input
                  type="checkbox"
                  role="switch"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={testimonial.approved}
                  onChange={() => handleApproveToggle(testimonial.id, testimonial.approved)}
                />
                <span className={cn(
                    'ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    testimonial.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  )}>
                  {testimonial.approved ? 'Approved' : 'Pending'}
                </span>
              </td>
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right">
                <button type="button" className="text-xs text-indigo-600 hover:text-indigo-900 font-medium mr-2"
                  onClick={() => router.push(`/admin/testimonials/${testimonial.id}/edit`)}
                >
                  Edit
                </button>
                <button type="button" className="text-xs text-red-600 hover:text-red-900 font-medium"
                  onClick={() => handleDelete(testimonial.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}