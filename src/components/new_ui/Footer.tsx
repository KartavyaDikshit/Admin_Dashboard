import Link from 'next/link'

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
            <h3 className="text-xl font-bold mb-4">TheBrainyInsights</h3>
            <p className="text-gray-400 mb-4">{dict.footerDesc}</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><span className="sr-only">Twitter</span>🐦</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><span className="sr-only">LinkedIn</span>💼</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><span className="sr-only">Facebook</span>📘</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href={`/${lang}/reports`} className="hover:text-white transition-colors">{dict.reports}</Link></li>
              <li><Link href={`/${lang}/categories`} className="hover:text-white transition-colors">{dict.categoriesLabel}</Link></li>
              <li><Link href={`/${lang}/services`} className="hover:text-white transition-colors">{dict.service2Title}</Link></li>
              <li><Link href={`/${lang}/services`} className="hover:text-white transition-colors">{dict.services}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href={`/${lang}/about`} className="hover:text-white transition-colors">{dict.aboutUs}</Link></li>
              <li><Link href={`/${lang}/contact`} className="hover:text-white transition-colors">{dict.contactUs}</Link></li>
              <li><Link href={`/${lang}/clients`} className="hover:text-white transition-colors">Our Clients</Link></li>
              <li><Link href={`/${lang}/reports`} className="hover:text-white transition-colors">{dict.featuredReportsTitle}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Request Callback</h4>
            <p className="text-gray-400 text-sm mb-4">Our experts are ready to help you make informed business decisions.</p>
            <button data-slot="button" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-primary-foreground h-9 px-4 py-2 has-[>svg]:px-3 bg-indigo-600 hover:bg-indigo-700 w-full">Request a Callback</button>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">{dict.footerText}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href={`/${lang}/privacy-policy`} className="text-gray-400 hover:text-white text-sm transition-colors">{dict.privacyPolicy}</Link>
            <Link href={`/${lang}/terms-conditions`} className="text-gray-400 hover:text-white text-sm transition-colors">{dict.termsOfService}</Link>
            <Link href="/sitemap.xml" className="text-gray-400 hover:text-white text-sm transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}