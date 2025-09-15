import TestimonialList from '@/components/testimonials/TestimonialList';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';

export default function AdminTestimonialsPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-black">Testimonials</h1>
          <Link href="/admin/testimonials/create" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            Add New Testimonial
          </Link>
        </div>
        <TestimonialList />
      </div>
    </AdminLayout>
  );
}
