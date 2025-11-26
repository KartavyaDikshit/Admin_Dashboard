import Link from 'next/link';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { getDictionary } from '@/i18n/dictionaries';

export default function PublicHeader({ lang }: { lang: string }) {
  const dict = getDictionary(lang);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href={`/${lang}`} className="text-2xl font-bold text-blue-600">
            TBI
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href={`/${lang}`} className="text-gray-600 hover:text-blue-600 transition-colors">
              {dict.home}
            </Link>
            <Link href={`/${lang}/categories`} className="text-gray-600 hover:text-blue-600 transition-colors">
              {dict.categories}
            </Link>
            <Link href={`/${lang}/reports`} className="text-gray-600 hover:text-blue-600 transition-colors">
              {dict.reports}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
