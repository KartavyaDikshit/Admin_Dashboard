import TestimonialForm from '@/components/testimonials/TestimonialForm';
import AdminLayout from '@/components/layout/AdminLayout';

export default function CreateTestimonialPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Create New Testimonial</h1>
        <TestimonialForm />
      </div>
    </AdminLayout>
  );
}
