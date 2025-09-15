'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { cn } from '@/lib/utils';
import * as React from "react";

const formSchema = z.object({
  author: z.string().min(2, { message: 'Author must be at least 2 characters.' }),
  company: z.string().optional(),
  position: z.string().optional(),
  content: z.string().min(10, { message: 'Content must be at least 10 characters.' }),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  approved: z.boolean().default(false),
});

interface TestimonialFormProps {
  initialData?: Testimonial;
}

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

export default function TestimonialForm({ initialData }: TestimonialFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      author: '',
      company: '',
      position: '',
      content: '',
      rating: 5,
      approved: false,
    },
  });

  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const createTestimonial = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => axios.post('/api/testimonials', data),
    onSuccess: () => {
      toast.success('Testimonial created successfully!');
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      router.push('/admin/testimonials');
    },
    onError: (error) => {
      toast.error('Failed to create testimonial.');
      console.error(error);
    },
  });

  const updateTestimonial = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => axios.put(`/api/testimonials/${initialData?.id}`, data),
    onSuccess: () => {
      toast.success('Testimonial updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      router.push('/admin/testimonials');
    },
    onError: (error) => {
      toast.error('Failed to update testimonial.');
      console.error(error);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (initialData) {
      updateTestimonial.mutate(values);
    } else {
      createTestimonial.mutate(values);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-black">
            {initialData ? 'Edit Testimonial' : 'Create New Testimonial'}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 text-black">
          {/* Author */}
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-black mb-1">
              Author *
            </label>
            <input
              id="author"
              type="text"
              {...register('author')}
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-black',
                errors.author && 'border-red-500'
              )}
              placeholder="John Doe"
            />
            {errors.author && (
              <p className="mt-1 text-sm text-red-600">{errors.author.message}</p>
            )}
          </div>

          {/* Company */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-black mb-1">
              Company
            </label>
            <input
              id="company"
              type="text"
              {...register('company')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-black"
              placeholder="Acme Corp"
            />
          </div>

          {/* Position */}
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-black mb-1">
              Position
            </label>
            <input
              id="position"
              type="text"
              {...register('position')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-black"
              placeholder="CEO"
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-black mb-1">
              Content *
            </label>
            <textarea
              id="content"
              {...register('content')}
              rows={4}
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-black',
                errors.content && 'border-red-500'
              )}
              placeholder="This product is amazing..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          {/* Rating */}
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-black mb-1">
              Rating (1-5)
            </label>
            <input
              id="rating"
              type="number"
              {...register('rating', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-black"
              placeholder="5"
              min="1"
              max="5"
            />
            {errors.rating && (
              <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
            )}
          </div>

          {/* Approved */}
          <div className="flex items-center space-x-2">
            <input
              id="approved"
              type="checkbox"
              {...register('approved')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="approved" className="text-sm font-medium text-black">
              Approved
            </label>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTestimonial.isPending || updateTestimonial.isPending}
              className={cn(
                'px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700',
                (createTestimonial.isPending || updateTestimonial.isPending) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {initialData ? 'Save Changes' : 'Create Testimonial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
