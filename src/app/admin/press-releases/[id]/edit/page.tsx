'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { toast } from 'sonner';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

const locales = ['en', 'de', 'fr', 'it', 'ja', 'ko', 'es'];

export default function EditPressRelease() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [viewLocale, setViewLocale] = useState('en');
  
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [data, setData] = useState<any>({}); // Original English Data
  const [translations, setTranslations] = useState<any[]>([]); // All translations

  useEffect(() => {
    Promise.all([
        fetch(`/api/press-releases/${id}`).then(res => res.json()),
        fetch('/api/categories').then(res => res.json())
    ]).then(([prData, catData]) => {
        if (prData.error) {
            toast.error(prData.error);
            router.push('/admin/press-releases');
            return;
        }
        setData(prData);
        setTranslations(prData.translations || []);
        setSelectedCategories(prData.categories.map((c: any) => c.id));
        setCategories(catData.categories || []);
        setLoading(false);
    });
  }, [id, router]);

  const currentData = viewLocale === 'en' 
    ? data 
    : translations.find(t => t.locale === viewLocale) || { title: '', description: '' };

  const handleInputChange = (field: string, value: string) => {
      if (viewLocale === 'en') {
          setData({ ...data, [field]: value });
      } else {
          // Simplified: Translation editing not fully implemented in this scope, read-only or just display
          // If requirement was to edit translations, we'd need a PUT endpoint for translations
          toast.info("Editing translations is not yet supported. Please edit the English version and re-translate.");
      }
  };

  const handleSave = async () => {
      if (viewLocale !== 'en') return;
      setSaving(true);
      try {
          const res = await fetch(`/api/press-releases/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  title: data.title,
                  description: data.description,
                  categoryIds: selectedCategories,
                  published: data.published
              })
          });
          if (res.ok) toast.success('Saved successfully');
          else toast.error('Failed to save');
      } catch {
          toast.error('Error saving');
      } finally {
          setSaving(false);
      }
  };

  const handleTranslate = async () => {
      if (viewLocale !== 'en') return;
      setTranslating(true);
      toast.loading('Translating...');
      try {
          const res = await fetch(`/api/press-releases/${id}/translate`, { method: 'POST' });
          if (res.ok) {
              toast.success('Translated successfully');
              // Refresh data
              const fresh = await fetch(`/api/press-releases/${id}`).then(r => r.json());
              setData(fresh);
              setTranslations(fresh.translations || []);
          } else {
              toast.error('Translation failed');
          }
      } catch {
          toast.error('Error translating');
      } finally {
          setTranslating(false);
          toast.dismiss();
      }
  };

  if (loading) return <AdminLayout>Loading...</AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Edit Press Release</h1>
            <div className="flex items-center space-x-4">
                <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Language: {viewLocale.toUpperCase()}
                        <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" />
                    </Menu.Button>
                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                            <div className="py-1">
                                {locales.map((l) => (
                                    <Menu.Item key={l}>
                                        {({ active }) => (
                                            <button onClick={() => setViewLocale(l)} className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm`}>
                                                {l.toUpperCase()}
                                            </button>
                                        )}
                                    </Menu.Item>
                                ))}
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
                
                {viewLocale === 'en' && (
                    <button onClick={handleTranslate} disabled={translating} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                        {translating ? 'Translating...' : 'Translate All'}
                    </button>
                )}
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Title ({viewLocale.toUpperCase()})</label>
                <input 
                    type="text" 
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    value={currentData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    readOnly={viewLocale !== 'en'}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Description ({viewLocale.toUpperCase()})</label>
                <textarea 
                    rows={10} 
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    value={currentData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    readOnly={viewLocale !== 'en'}
                />
            </div>

            {viewLocale === 'en' && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                        <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded">
                            {categories.map(cat => (
                                <label key={cat.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(cat.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedCategories([...selectedCategories, cat.id]);
                                            else setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                                        }}
                                        className="rounded border-gray-300 text-indigo-600"
                                    />
                                    <span>{cat.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="published"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                            checked={data.published || false}
                            onChange={(e) => setData({ ...data, published: e.target.checked })}
                        />
                        <label htmlFor="published" className="ml-2 text-sm text-gray-900">Published</label>
                    </div>
                    
                    <div className="flex justify-end">
                        <button onClick={handleSave} disabled={saving} className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </>
            )}
        </div>
      </div>
    </AdminLayout>
  );
}
