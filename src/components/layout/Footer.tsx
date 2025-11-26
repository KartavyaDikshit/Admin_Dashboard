import Link from 'next/link';
import { getDictionary } from '@/i18n/dictionaries';

export default function Footer({ lang }: { lang: string }) {
  const dict = getDictionary(lang);

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">TBI</h3>
            <p className="text-gray-400">
              AI-Powered Market Intelligence.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{dict.categories}</h4>
            <ul className="space-y-2 text-gray-400">
              {/* Dynamic links could go here, for now static placeholders or links to main category page */}
              <li><Link href={`/${lang}/categories`} className="hover:text-white">All Categories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-white">{dict.contactUs}</Link></li>
              <li><Link href="#" className="hover:text-white">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-white">{dict.privacyPolicy}</Link></li>
              <li><Link href="#" className="hover:text-white">{dict.termsOfService}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>{dict.footerText}</p>
        </div>
      </div>
    </footer>
  );
}
