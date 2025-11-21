'use client';

import { useEffect, useState } from 'react';
import PublicHeader from '@/components/public/PublicHeader';
import { useParams } from 'next/navigation';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

export default function CategoryPage() {
  const params = useParams();
  const { lang, slug } = params;
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/${lang}/categories/${slug}`);
        if (!response.ok) {
          throw new Error('Failed to fetch category');
        }
        const data = await response.json();
        setCategory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (lang && slug) {
      fetchCategory();
    }
  }, [lang, slug]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!category) return <div>Category not found</div>;

  return (
    <div>
      <PublicHeader />
      <main className="container mx-auto p-4">
        <div className="flex items-center space-x-4 mb-4">
            {category.icon && (
                <div className="relative h-16 w-16">
                <Image
                    src={category.icon}
                    alt={category.name}
                    layout="fill"
                    objectFit="contain"
                />
                </div>
            )}
            <h1 className="text-3xl font-bold">{category.name}</h1>
        </div>
        <p>{category.description}</p>
      </main>
    </div>
  );
}