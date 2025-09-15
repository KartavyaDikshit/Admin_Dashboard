'use client';

'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'next/navigation';
import TestimonialForm from '@/components/testimonials/TestimonialForm';
import AdminLayout from '@/components/layout/AdminLayout';

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

export default function EditTestimonialPage() {
  const params = useParams();
  const testimonialId = params.id as string;

  const { data: testimonial, isLoading, isError } = useQuery<Testimonial>({
    queryKey: ['testimonial', testimonialId],
    queryFn: async () => {
      const response = await axios.get(`/api/testimonials/${testimonialId}`);
      return response.data;
    },
    enabled: !!testimonialId, // Only run query if testimonialId is available
  });

  if (isLoading) return <div className="container mx-auto py-8">Loading testimonial...</div>;
  if (isError) return <div className="container mx-auto py-8">Error loading testimonial.</div>;
  if (!testimonial) return <div className="container mx-auto py-8">Testimonial not found.</div>;

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 text-black">Edit Testimonial</h1>
        <TestimonialForm initialData={testimonial} />
      </div>
    </AdminLayout>
  );
}
