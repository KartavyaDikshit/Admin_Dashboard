'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Category, CategoryTranslation, TranslationStatus } from '@prisma/client';
import Image from 'next/image';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

const locales = ['en', 'de', 'fr', 'it', 'ja', 'ko', 'es'];

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable().optional(),
  shortcode: z.string().min(2, 'Shortcode must be at least 2 characters').max(20, 'Shortcode cannot exceed 20 characters'),
  icon: z.string().nullable().optional(),
  featured: z.boolean(),
  sortOrder: z.coerce.number().int(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'ACTIVE']),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
});

const translatedCategorySchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().nullable().optional(),
    metaTitle: z.string().nullable().optional(),
    metaDescription: z.string().nullable().optional(),
    status: z.nativeEnum(TranslationStatus),
});

type CategoryFormData = z.infer<typeof categorySchema>;
type TranslatedCategoryFormData = z.infer<typeof translatedCategorySchema>;

interface CategoryFormProps {
  initialData?: Category & { translations: CategoryTranslation[] };
}

export default function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const categoryId = initialData?.id;

  const [viewLocale, setViewLocale] = useState('en');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.icon ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    getValues,
  } = useForm({
    resolver: zodResolver(viewLocale === 'en' ? categorySchema : translatedCategorySchema),
    defaultValues: {
        ...initialData,
    },
  });

  useEffect(() => {
    if (viewLocale === 'en') {
      reset(initialData);
    } else {
      const translation = initialData?.translations.find(t => t.locale === viewLocale);
      reset({
        title: translation?.title ?? '',
        description: translation?.description ?? '',
        metaTitle: translation?.metaTitle ?? '',
        metaDescription: translation?.metaDescription ?? '',
        status: translation?.status ?? TranslationStatus.DRAFT,
      });
    }
  }, [viewLocale, initialData, reset]);

  useEffect(() => {
    if (initialData?.icon) {
      setImagePreview(initialData.icon);
    }
  }, [initialData?.icon]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    const toastId = toast.loading('Uploading icon...');
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      toast.dismiss(toastId);
      if (response.ok) {
        const data = await response.json();
        setValue('icon', data.url, { shouldValidate: true });
        setImagePreview(data.url);
        setSelectedFile(null);
        toast.success('Icon uploaded successfully!');
      } else {
        toast.error((await response.json()).error || 'Failed to upload icon.');
      }
    } catch {
      toast.dismiss(toastId);
      toast.error('An unexpected error occurred during icon upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateDetails = async () => {
    setIsGenerating(true);
    const toastId = toast.loading('Generating details with AI...');
    try {
        const name = getValues('name');
        const description = getValues('description');

        if (!name) {
            toast.error('Please provide a category name first.');
            return;
        }

        const response = await fetch('/api/categories/generate-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description }),
        });

        if (response.ok) {
            const details = await response.json();
            setValue('shortcode', details.shortcode, { shouldValidate: true });
            setValue('description', details.description, { shouldValidate: true });
            setValue('metaTitle', details.metaTitle, { shouldValidate: true });
            setValue('metaDescription', details.metaDescription, { shouldValidate: true });
            toast.success('AI-generated details have been filled in.');
        } else {
            toast.error('Failed to generate details.');
        }
    } catch {
        toast.error('An error occurred while generating details.');
    } finally {
        toast.dismiss(toastId);
        setIsGenerating(false);
    }
  };

  const handleTranslateAll = async () => {
    if (!categoryId) return;
    setIsTranslatingAll(true);
    const toastId = toast.loading('Initiating translations for all languages...');
    try {
        const response = await fetch(`/api/categories/${categoryId}/translate-all`, {
            method: 'POST',
        });
        if (response.ok) {
            toast.success('Translation jobs started for all languages. Refresh to see updates.');
            router.refresh();
        } else {
            toast.error('Failed to start translation jobs.');
        }
    } catch {
        toast.error('An error occurred while starting translation jobs.');
    } finally {
        toast.dismiss(toastId);
        setIsTranslatingAll(false);
    }
  };

  const onSubmit = async (data: CategoryFormData | TranslatedCategoryFormData) => {
    if (viewLocale === 'en' && selectedFile && !isUploading) {
        toast.error('Please upload the selected icon before saving.');
        return;
    }

    const toastId = toast.loading(initialData ? 'Updating...' : 'Creating...');
    
    try {
      let url: string;
      let method: string;
      let body: string;

      if (viewLocale === 'en') {
        url = initialData ? `/api/categories/${categoryId}` : '/api/categories';
        method = initialData ? 'PATCH' : 'POST';
        body = JSON.stringify(data);
      } else {
        url = `/api/categories/${categoryId}/translations/${viewLocale}`;
        method = 'PUT';
        body = JSON.stringify(data);
      }

      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
      const result = await response.json();
      toast.dismiss(toastId);

      if (response.ok) {
        toast.success(`Category (${viewLocale.toUpperCase()}) ${initialData ? 'updated' : 'created'} successfully!`);
        router.push('/admin/categories');
        router.refresh();
      } else {
        toast.error(result.error || 'An error occurred.');
      }
    } catch {
      toast.dismiss(toastId);
      toast.error('An unexpected error occurred.');
    }
  };

  const isTranslationView = viewLocale !== 'en';

  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
                {initialData ? `Edit Category: ${initialData.name}` : 'Create New Category'}
            </h2>
            {initialData && (
                <div className="flex items-center space-x-4">
                    <button
                        type="button"
                        onClick={handleTranslateAll}
                        disabled={isTranslatingAll}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400"
                    >
                        {isTranslatingAll ? 'Translating...' : 'Translate All'}
                    </button>
                    <Menu as="div" className="relative inline-block text-left">
                        <div>
                            <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                                View Language: {viewLocale.toUpperCase()}
                                <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" />
                            </Menu.Button>
                        </div>
                        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                            <Menu.Items className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                <div className="py-1">
                                    {locales.map((locale) => (
                                        <Menu.Item key={locale}>
                                            {({ active }) => (
                                                <button onClick={() => setViewLocale(locale)} className={`${active ? 'bg-gray-100' : ''} ${viewLocale === locale ? 'font-bold' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700`}>
                                                    {locale.toUpperCase()}
                                                </button>
                                            )}
                                        </Menu.Item>
                                    ))}
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            )}
        </div>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-8 space-y-8">
        
        {isTranslationView ? (
            <>
                {/* Translation Fields */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title *</label>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <input id="title" {...register('title')} className={cn('mt-1 block w-full rounded-md border-gray-300 shadow-sm', (errors as any).title && 'border-red-500')} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(errors as any).title && <p className="mt-1 text-sm text-red-600">{(errors as any).title.message}</p>}
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea id="description" {...register('description')} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">Meta Title</label>
                    <input id="metaTitle" {...register('metaTitle')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">Meta Description</label>
                    <textarea id="metaDescription" {...register('metaDescription')} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                 <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                    <select id="status" {...register('status')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        {Object.values(TranslationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </>
        ) : (
            <>
                {/* Original Category Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name *</label>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <input id="name" {...register('name')} className={cn('mt-1 block w-full rounded-md border-gray-300 shadow-sm', (errors as any).name && 'border-red-500')} />
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(errors as any).name && <p className="mt-1 text-sm text-red-600">{(errors as any).name.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="shortcode" className="block text-sm font-medium text-gray-700">Shortcode *</label>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <input id="shortcode" {...register('shortcode')} className={cn('mt-1 block w-full rounded-md border-gray-300 shadow-sm', (errors as any).shortcode && 'border-red-500')} />
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(errors as any).shortcode && <p className="mt-1 text-sm text-red-600">{(errors as any).shortcode.message}</p>}
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <button type="button" onClick={handleGenerateDetails} disabled={isGenerating} className="text-xs text-indigo-600 hover:text-indigo-800 disabled:opacity-50">
                            {isGenerating ? 'Generating...' : 'Generate with AI'}
                        </button>
                    </div>
                    <textarea id="description" {...register('description')} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">Meta Title</label>
                    <input id="metaTitle" {...register('metaTitle')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">Meta Description</label>
                    <textarea id="metaDescription" {...register('metaDescription')} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
            </>
        )}

        {/* Shared Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="icon" className="block text-sm font-medium text-gray-700">Icon</label>
                {imagePreview && (
                    <div className="mt-4 relative w-32 h-32 border rounded-md overflow-hidden">
                        <Image src={imagePreview} alt="Icon Preview" layout="fill" objectFit="cover" />
                    </div>
                )}
                {!isTranslationView && (
                    <div className="mt-2">
                        <input type="file" id="icon-upload" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" />
                        {selectedFile && (
                            <button type="button" onClick={handleImageUpload} disabled={isUploading} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
                                {isUploading ? 'Uploading...' : 'Upload Icon'}
                            </button>
                        )}
                    </div>
                )}
                <input type="hidden" {...register('icon')} />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(errors as any).icon && <p className="mt-1 text-sm text-red-600">{(errors as any).icon.message}</p>}
            </div>
            {!isTranslationView && (
                <div>
                    <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">Sort Order</label>
                    <input id="sortOrder" type="number" {...register('sortOrder')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mt-4">Status</label>
                    <select id="status" {...register('status')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Draft</option>
                    </select>

                    <div className="flex items-center pt-6">
                        <input id="featured" type="checkbox" {...register('featured')} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
                        <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">Featured Category</label>
                    </div>
                </div>
            )}
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting || isUploading || isGenerating} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}