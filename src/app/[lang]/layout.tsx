import PublicHeader from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader lang={lang} />
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
      <Footer lang={lang} />
    </div>
  );
}