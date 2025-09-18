import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import Link from 'next/link';

export default function PublicHeader() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              TBI Reports
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-base font-medium text-gray-500 hover:text-gray-900">
              Home
            </Link>
            <Link href="/#categories" className="text-base font-medium text-gray-500 hover:text-gray-900">
              Categories
            </Link>
            <Link href="/#reports" className="text-base font-medium text-gray-500 hover:text-gray-900">
              Reports
            </Link>
          </nav>
          <div className="flex items-center">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
