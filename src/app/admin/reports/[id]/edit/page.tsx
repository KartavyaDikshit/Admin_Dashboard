'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { toast } from 'sonner';
import { Report, Category, Prisma, ReportTranslation } from '@prisma/client'; // Import Prisma and ReportTranslation
import { locales } from '@/components/layout/LanguageSwitcher'; // Import locales
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { upload } from '@vercel/blob/client';

import RichTextEditor from '@/components/RichTextEditor';

type ReportWithCategories = Report & { categories: { id: string; name: string }[] };
type ReportTranslationWithRelations = ReportTranslation;

// Helper function to safely convert value to string for input fields
const formatInputValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value instanceof Date) return value.toISOString().split('T')[0]; // Format Date for date inputs
  if (value instanceof Prisma.Decimal) return value.toString();
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'object') return JSON.stringify(value); // For JsonObject, JsonArray
  return '';
};

export default function EditReportPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [report, setReport] = useState<Partial<ReportWithCategories>>({});
  const [translatedReport, setTranslatedReport] = useState<Partial<ReportTranslationWithRelations>>({});
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [viewLocale, setViewLocale] = useState('en');
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/reports/${id}`);
        if (response.ok) {
          const data: ReportWithCategories = await response.json();
          setReport(data);
          setSelectedCategoryIds(new Set(data.categories.map(c => c.id)));
          if (data.imageUrl) {
            setImagePreview(data.imageUrl);
          } else {
            setImagePreview(null);
          }
        } else {
          toast.error('Failed to fetch report data.');
        }
      } catch {
        toast.error('An error occurred while fetching the report.');
      }
    };

    const fetchTranslatedReport = async (locale: string) => {
      if (locale === 'en') {
        setTranslatedReport({});
        return;
      }
      try {
        const response = await fetch(`/api/reports/${id}/translations/${locale}`);
        if (response.ok) {
          const data = await response.json();
          setTranslatedReport(data.translation);
        } else {
          setTranslatedReport({});
          toast.error(`Failed to fetch ${locale} translation.`);
        }
      } catch {
        setTranslatedReport({});
        toast.error(`An error occurred while fetching ${locale} translation.`);
      }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            if(response.ok) {
                const data = await response.json();
                setAllCategories(data.categories);
            } else {
                toast.error('Failed to fetch categories.');
            }
        } catch {
            toast.error('An error occurred while fetching categories.');
        }
    }

    setIsLoading(true);
    Promise.all([
      fetchReport(),
      fetchCategories(),
      fetchTranslatedReport(viewLocale)
    ]).finally(() => setIsLoading(false));
  }, [id, viewLocale]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | null = value;

    if (type === 'number') {
      processedValue = value === '' ? null : parseFloat(value);
    } else if (value === '') {
      // Treat empty strings as null for optional text fields if desired by schema
      processedValue = null;
    }

    if (viewLocale === 'en') {
      setReport(prev => ({ ...prev, [name]: processedValue }));
    } else {
      setTranslatedReport(prev => ({ ...prev, [name]: processedValue }));
    }
  };

  const handleRichTextChange = (name: string, value: string) => {
    if (viewLocale === 'en') {
      setReport(prev => ({ ...prev, [name]: value }));
    } else {
      setTranslatedReport(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setImagePreview(null);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    toast.loading('Uploading image...');

    try {
      const newBlob = await upload(selectedFile.name, selectedFile, {
        access: 'public',
        handleUploadUrl: '/api/upload/client',
      });

      toast.dismiss();
      setReport(prev => ({ ...prev, imageUrl: newBlob.url }));
      toast.success('Image uploaded successfully!');
      setSelectedFile(null); // Clear selected file after upload
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error('Failed to upload image. Please check file size and try again.');
    } finally {
      setIsUploading(false);
    }
  };


  const handleCategoryChange = (categoryId: string) => {
    const newSelectedIds = new Set(selectedCategoryIds);
    if (newSelectedIds.has(categoryId)) {
      newSelectedIds.delete(categoryId);
    } else {
      newSelectedIds.add(categoryId);
    }
    setSelectedCategoryIds(newSelectedIds);
  };

  const handleSave = async () => {
    setIsSaving(true);
    toast.loading('Saving changes...');

    try {
      let response;
      if (viewLocale === 'en') {
        const payload = {
            ...report,
            categoryIds: Array.from(selectedCategoryIds),
            imageUrl: report.imageUrl === '' ? null : report.imageUrl,
        };
        response = await fetch(`/api/reports/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`/api/reports/${id}/translations/${viewLocale}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(translatedReport),
        });
      }

      toast.dismiss();
      if (response.ok) {
        toast.success(`Report ${viewLocale === 'en' ? '' : `(${viewLocale.toUpperCase()}) `}saved successfully!`);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save report.');
      }
    } catch {
      toast.dismiss();
      toast.error('An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    // Optional: auto-save before publishing
    await handleSave();

    setIsPublishing(true);
    toast.loading('Publishing report in all languages...');

    try {
        const response = await fetch(`/api/reports/${id}/publish`, {
            method: 'POST',
        });

        toast.dismiss();
        if(response.ok) {
            toast.success('Report published successfully!');
            router.push('/admin/reports'); // Navigate to reports list after publish
        } else {
            const data = await response.json();
            toast.error(data.error || 'Failed to publish report.');
        }
    } catch {
        toast.dismiss();
        toast.error('An unexpected error occurred during publishing.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleGenerateSeo = async () => {
    if (viewLocale !== 'en') {
      toast.error('SEO generation is only available for the English version.');
      return;
    }
    if (!report.title) {
      toast.error('Please provide a title for the report before generating SEO metadata.');
      return;
    }

    setIsGeneratingSeo(true);
    toast.loading('Generating SEO metadata...');

    try {
      const response = await fetch(`/api/reports/${id}/generate-seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      toast.dismiss();
      if (response.ok) {
        const updatedReport = await response.json();
        setReport(prev => ({ ...prev, ...updatedReport }));
        toast.success('SEO metadata generated successfully!');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to generate SEO metadata.');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error generating SEO:', error);
      toast.error('An unexpected error occurred during SEO generation.');
    } finally {
      setIsGeneratingSeo(false);
    }
  };
  
  if (isLoading) {
    return <AdminLayout><div className="text-center py-12">Loading report...</div></AdminLayout>;
  }

  if (!report.id) {
    return <AdminLayout><div className="text-center py-12">Report not found.</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Edit Report</h1>
            <div className="flex items-center space-x-4">
                <Menu as="div" className="relative inline-block text-left">
                    <div>
                        <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            View Language: {viewLocale.toUpperCase()}
                            <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" />
                        </Menu.Button>
                    </div>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                            <div className="py-1">
                                {locales.map((locale) => (
                                    <Menu.Item key={locale}>
                                        {({ active }) => (
                                            <button
                                                onClick={() => setViewLocale(locale)}
                                                className={`${
                                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                } ${
                                                    viewLocale === locale ? 'font-bold bg-gray-50' : 'font-normal'
                                                } block w-full text-left px-4 py-2 text-sm`}
                                            >
                                                {locale.toUpperCase()}
                                            </button>
                                        )}
                                    </Menu.Item>
                                ))}
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
                <button
                    onClick={handlePublish}
                    disabled={isPublishing || isSaving}
                    className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                    {isPublishing ? 'Publishing...' : 'Publish in all languages'}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Report Content</h2>
                    {/* Render a form field for each section */}
                    {[
                        { name: 'title', label: 'Title', type: 'input' },
                        { name: 'titleDescription', label: 'Title Description', type: 'textarea' },
                        { name: 'marketResearchSummary', label: 'Market Research Summary', type: 'richtext' },
                        { name: 'marketDynamics', label: 'Market Dynamics', type: 'richtext' },
                        { name: 'regionalInsights', label: 'Regional Insights', type: 'richtext' },
                        { name: 'keyMarketPlayers', label: 'Key Market Players', type: 'richtext' },
                        { name: 'tableOfContents', label: 'Table of Contents', type: 'richtext' },
                        // SEO Fields
                        { name: 'metaTitle', label: 'Meta Title', type: 'input' },
                        { name: 'metaDescription', label: 'Meta Description', type: 'textarea' },
                        { name: 'canonicalUrl', label: 'Canonical URL', type: 'input' },
                        { name: 'ogTitle', label: 'OG Title', type: 'input' },
                        { name: 'ogDescription', label: 'OG Description', type: 'textarea' },
                        { name: 'ogImage', label: 'OG Image URL', type: 'input' },
                        { name: 'twitterTitle', label: 'Twitter Title', type: 'input' },
                        { name: 'twitterDescription', label: 'Twitter Description', type: 'textarea' },
                        { name: 'schemaMarkup', label: 'Schema Markup (JSON)', type: 'textarea' },
                        { name: 'breadcrumbData', label: 'Breadcrumb Data (JSON)', type: 'textarea' },
                        { name: 'faqData', label: 'FAQ Data (JSON)', type: 'textarea' },
                        // Price Fields
                        { name: 'singlePrice', label: 'Single User Price', type: 'number' },
                        { name: 'multiPrice', label: 'Multi User Price', type: 'number' },
                        { name: 'corporatePrice', label: 'Corporate Price', type: 'number' },
                    ].map(field => (
                        <div key={field.name} className="mb-4">
                            {field.type === 'richtext' ? (
                              <RichTextEditor
                                id={field.name}
                                label={field.label}
                                value={formatInputValue(viewLocale === 'en' ? report[field.name as keyof typeof report] : translatedReport[field.name as keyof typeof translatedReport])}
                                onChange={(value) => handleRichTextChange(field.name, value)}
                              />
                            ) : (
                              <>
                                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                                {field.type === 'textarea' ? (
                                    <textarea
                                        id={field.name}
                                        name={field.name}
                                        value={formatInputValue(viewLocale === 'en' ? report[field.name as keyof typeof report] : translatedReport[field.name as keyof typeof translatedReport])}
                                        onChange={handleInputChange}
                                        rows={8}
                                        className="w-full p-2 border rounded-md"
                                    />
                                ) : (
                                    <input
                                        type={field.type === 'number' ? 'number' : 'text'}
                                        id={field.name}
                                        name={field.name}
                                        value={formatInputValue(viewLocale === 'en' ? report[field.name as keyof typeof report] : translatedReport[field.name as keyof typeof translatedReport])}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded-md"
                                    />
                                )}
                              </>
                            )}
                        </div>
                    ))}
                    {viewLocale === 'en' && (
                      <button
                        type="button"
                        onClick={handleGenerateSeo}
                        disabled={isGeneratingSeo || isSaving || isPublishing}
                        className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 disabled:bg-gray-400"
                      >
                        {isGeneratingSeo ? 'Generating SEO...' : 'Generate SEO with AI'}
                      </button>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Image</h2>
                    {imagePreview && (
                        <div className="mt-2 relative w-full h-48 border rounded-md overflow-hidden">
                        <img src={imagePreview} alt="Image Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                    {viewLocale === 'en' && (
                        <>
                        <div className="mt-4">
                        <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 mb-1">Upload New Image</label>
                        <input
                            type="file"
                            id="imageUpload"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full p-2 border rounded-md"
                        />
                        {selectedFile && (
                            <button
                            onClick={handleImageUpload}
                            disabled={isUploading}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
                            >
                            {isUploading ? 'Uploading...' : 'Upload'}
                            </button>
                        )}
                        </div>
                        <div className="mt-4">
                          <label htmlFor="imageAlt" className="block text-sm font-medium text-gray-700 mb-1">Image Alt Tag</label>
                          <input
                            type="text"
                            id="imageAlt"
                            name="imageAlt"
                            value={formatInputValue(report.imageAlt)}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded-md"
                          />
                        </div>
                        </>
                    )}
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Categories</h2>
                    <div className="space-y-2">
                        {allCategories.map(category => (
                            <label key={category.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedCategoryIds.has(category.id)}
                                    onChange={() => handleCategoryChange(category.id)}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving || isPublishing}
                    className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
      </div>
    </AdminLayout>
  );
}