import PublicHeader from '@/components/public/PublicHeader';
import CategoryList from '@/components/public/CategoryList';
import ReportList from '@/components/public/ReportList';

export default function LangPage({ params }: { params: { lang: string } }) {
  const { lang } = params;

  return (
    <div>
      <PublicHeader />
      <main className="container mx-auto p-4">
        <CategoryList lang={lang} />
        <ReportList lang={lang} />
      </main>
    </div>
  );
}