'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { Testimonial } from '@prisma/client';
import React, { useState } from "react";
import Image from 'next/image';
import { upload } from '@vercel/blob/client';

const formSchema = z.object({
  author: z.string().min(2, { message: 'Author must be at least 2 characters.' }),
  company: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  content: z.string().min(10, { message: 'Content must be at least 10 characters.' }),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  image: z.string().nullable().optional(),
  approved: z.boolean(),
});

interface TestimonialFormProps {
  initialData?: Omit<Testimonial, 'createdAt' | 'updatedAt'> & {
    createdAt: string | Date;
    updatedAt: string | Date;
  };
}

export default function TestimonialForm({ initialData }: TestimonialFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const defaultFormValues: z.infer<typeof formSchema> = {
    author: initialData?.author ?? '',
    company: initialData?.company ?? null,
    position: initialData?.position ?? null,
    content: initialData?.content ?? '',
    rating: initialData?.rating ?? null,
    image: initialData?.image ?? null,
    approved: initialData?.approved ?? false,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  const currentImage = watch('image');

  React.useEffect(() => {
    if (initialData) {
      reset({
        author: initialData.author,
        company: initialData.company,
        position: initialData.position,
        content: initialData.content,
        rating: initialData.rating,
        image: initialData.image,
        approved: initialData.approved,
      });
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading('Uploading image...');

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload/client',
      });
      
      toast.dismiss(toastId);
      setValue('image', newBlob.url);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.dismiss(toastId);
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please check file size.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setValue('image', null);
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

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Author Image
            </label>
            <div className="flex items-center gap-4">
              {currentImage && (
                <div className="relative w-20 h-20 rounded-full overflow-hidden border border-gray-200">
                  <Image 
                    src={currentImage} 
                    alt="Author" 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-xs"
                  >
                    Remove
                  </button>
                </div>
              )}
              
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100
                  "
                  disabled={isUploading}
                />
                {isUploading && <p className="text-sm text-indigo-600 mt-1">Uploading...</p>}
              </div>
            </div>
            {/* Hidden input to register field */}
            <input type="hidden" {...register('image')} />
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
              disabled={createTestimonial.isPending || updateTestimonial.isPending || isUploading}
              className={cn(
                'px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700',
                (createTestimonial.isPending || updateTestimonial.isPending || isUploading) && 'opacity-50 cursor-not-allowed'
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