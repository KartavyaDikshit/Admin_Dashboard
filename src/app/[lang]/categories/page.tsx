import PublicHeader from '@/components/public/PublicHeader';
import CategoryList from '@/components/public/CategoryList';

export default function CategoriesPage({ params }: { params: { lang: string } }) {
  const { lang } = params;

  return (
    <div>
      <PublicHeader />
      <main className="container mx-auto p-4">
        <CategoryList lang={lang} />
      </main>
    </div>
  );
}