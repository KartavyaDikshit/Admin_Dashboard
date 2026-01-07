import Link from 'next/link';
import Image from 'next/image';
import { getDictionary } from '@/i18n/dictionaries';

export default function Footer({ lang }: { lang: string }) {
  const dict = getDictionary(lang);

  return (
    <footer className="bg-gray-900 text-gray-300 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-6 relative w-48 h-12">
                <Image 
                  src="/logo.png" 
                  alt="The Brainy Insights" 
                  fill 
                  className="object-contain brightness-0 invert"
                  unoptimized
                />
            </div>
            <p className="text-sm leading-relaxed mb-6">
              {dict.footerDesc}
            </p>
            <div className="flex gap-4">
               {/* Social Icons */}
               <a href="https://www.linkedin.com/company/thebrainyinsights" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-700 rounded-full hover:bg-blue-600 transition-colors cursor-pointer flex items-center justify-center">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
               </a>
               <a href="https://www.facebook.com/thebrainyinsights" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-700 rounded-full hover:bg-blue-800 transition-colors cursor-pointer flex items-center justify-center">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
               </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-lg border-b border-gray-700 pb-2 inline-block">Company</h4>
            <ul className="space-y-3">
              <li><Link href={`/${lang}/about`} className="hover:text-white hover:translate-x-1 transition-all inline-block">{dict.aboutUs}</Link></li>
              <li><Link href={`/${lang}/services`} className="hover:text-white hover:translate-x-1 transition-all inline-block">{dict.services}</Link></li>
              <li><Link href={`/${lang}/press-releases`} className="hover:text-white hover:translate-x-1 transition-all inline-block">{dict.pressReleases}</Link></li>
              <li><Link href={`/${lang}/contact`} className="hover:text-white hover:translate-x-1 transition-all inline-block">{dict.contactUs}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-lg border-b border-gray-700 pb-2 inline-block">{dict.contactInfo}</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>{dict.addressText}</span>
              </li>
              <li className="flex items-center gap-3">
                 <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                 <div className="flex flex-col">
                   <span>+1-315-215-1633</span>
                   <span>+91-9370600191</span>
                 </div>
              </li>
              <li className="flex items-center gap-3">
                 <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                 <span>sales@thebrainyinsights.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <Link href={`/${lang}`} className="relative w-32 h-8">
                <Image 
                  src="/logo.png" 
                  alt="The Brainy Insights" 
                  fill 
                  className="object-contain brightness-0 invert opacity-50 hover:opacity-100 transition-opacity"
                  unoptimized
                />
            </Link>
            <p>{dict.footerText}</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-6">
             <Link href={`/${lang}/privacy-policy`} className="hover:text-white transition-colors">{dict.privacyPolicy}</Link>
             <Link href={`/${lang}/terms-conditions`} className="hover:text-white transition-colors">{dict.termsOfService}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}