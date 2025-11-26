import Link from 'next/link';
import Image from 'next/image';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { getDictionary } from '@/i18n/dictionaries';

export default function PublicHeader({ lang }: { lang: string }) {
  const dict = getDictionary(lang);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-12">
          <Link href={`/${lang}`} className="flex items-center gap-3">
             <div className="relative w-48 h-12">
               <Image 
                  src="/logo.png" 
                  alt="The Brainy Insights" 
                  fill 
                  className="object-contain"
                  priority
                  unoptimized
                />
             </div>
          </Link>
          <nav className="hidden lg:flex gap-8">
            <Link href={`/${lang}`} className="text-gray-700 hover:text-blue-700 font-medium transition-colors">
              {dict.home}
            </Link>
            <Link href={`/${lang}/categories`} className="text-gray-700 hover:text-blue-700 font-medium transition-colors">
              {dict.categories}
            </Link>
            <Link href={`/${lang}/services`} className="text-gray-700 hover:text-blue-700 font-medium transition-colors">
              {dict.services}
            </Link>
            <Link href={`/${lang}/about`} className="text-gray-700 hover:text-blue-700 font-medium transition-colors">
              {dict.aboutUs}
            </Link>
            <Link href={`/${lang}/contact`} className="text-gray-700 hover:text-blue-700 font-medium transition-colors">
              {dict.contactUs}
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
