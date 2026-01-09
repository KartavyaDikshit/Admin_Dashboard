import Link from 'next/link'
import Image from 'next/image'

interface FooterProps {
  dict: any
  lang: string
}

export default function Footer({ dict, lang }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="relative h-12 w-48 mb-4">
              <Image 
                src="/logo.png" 
                alt="The Brainy Insights" 
                fill 
                className="object-contain brightness-0 invert"
                unoptimized
              />
            </div>
            <p className="text-gray-400 mb-4">{dict.footerDesc}</p>
            <div className="flex space-x-4">
              <a href="https://www.linkedin.com/company/thebrainyinsights" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://www.facebook.com/thebrainyinsights" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            {/* Empty column to replace Products */}
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href={`/${lang}/about`} className="hover:text-white transition-colors">{dict.aboutUs || 'About Us'}</Link></li>
              <li><Link href={`/${lang}/services`} className="hover:text-white transition-colors">{dict.services || 'Services'}</Link></li>
              <li><Link href={`/${lang}/press-releases`} className="hover:text-white transition-colors">{dict.pressReleases || 'Press Releases'}</Link></li>
              <li><Link href={`/${lang}/contact`} className="hover:text-white transition-colors">{dict.contactUs || 'Contact Us'}</Link></li>
              <li><Link href={`/${lang}/faqs`} className="hover:text-white transition-colors">{dict.faqs || 'FAQs'}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{dict.requestCallbackTitle || 'Request Callback'}</h4>
            <p className="text-gray-400 text-sm mb-4">{dict.requestCallbackDesc || 'Our experts are ready to help you make informed business decisions.'}</p>
            <Link href={`/${lang}/contact`} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all h-9 px-4 py-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
              {dict.requestCallbackButton || 'Request a Callback'}
            </Link>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">{dict.footerText}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href={`/${lang}/privacy-policy`} className="text-gray-400 hover:text-white text-sm transition-colors">{dict.privacyPolicy}</Link>
            <Link href={`/${lang}/terms-conditions`} className="text-gray-400 hover:text-white text-sm transition-colors">{dict.termsOfService}</Link>
            {/* <Link href="/sitemap.xml" className="text-gray-400 hover:text-white text-sm transition-colors">Sitemap</Link> */}
          </div>
        </div>
      </div>
    </footer>
  )
}