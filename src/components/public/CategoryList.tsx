'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string;
}

export default function CategoryList({ lang }: { lang: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/${lang}/categories`);
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [lang]);

  if (loading) return <div>Loading categories...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/${lang}/categories/${category.slug}`}>
            <div className="border p-4 rounded-lg block hover:bg-gray-100 cursor-pointer">
              <h3 className="text-xl font-semibold">{category.name}</h3>
              <p>{category.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
