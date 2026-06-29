'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

import Image from 'next/image'

interface HeaderProps {
  dict: any
  lang: string
}

export default function Header({ dict, lang }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const currentLocale = pathname.split('/')[1] || 'en'

  const switchLocale = (locale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${locale}`)
    router.push(newPath)
    setIsLangMenuOpen(false)
  }

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
    { code: 'it', label: 'Italiano' },
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
    { code: 'es', label: 'Español' }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
        <Link href={`/${lang}`} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="relative h-12 w-48 py-1 px-2">
            <Image 
              src="/logo.png" 
              alt="Fior Markets" 
              fill 
              className="object-contain"
              priority
              unoptimized
            />
          </div>
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          <Link href={`/${lang}`} className="text-sm hover:text-indigo-600 transition-colors font-medium">{dict.home || 'Home'}</Link>
          <Link href={`/${lang}/categories`} className="text-sm hover:text-indigo-600 transition-colors font-medium">{dict.categories || 'Industries'}</Link>
          <Link href={`/${lang}/reports`} className="text-sm hover:text-indigo-600 transition-colors font-medium">{dict.reports || 'Reports'}</Link>
          <Link href={`/${lang}/services`} className="text-sm hover:text-indigo-600 transition-colors font-medium">{dict.services || 'Services'}</Link>
          <Link href={`/${lang}/about`} className="text-sm hover:text-indigo-600 transition-colors font-medium">{dict.aboutUs || 'About Us'}</Link>
          <Link href={`/${lang}/contact`} className="text-sm hover:text-indigo-600 transition-colors font-medium">{dict.contactUs || 'Contact Us'}</Link>
        </nav>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button 
              className="justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 hidden sm:flex items-center space-x-1" 
              type="button" 
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe h-4 w-4" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                <path d="M2 12h20"></path>
              </svg>
              <span>{currentLocale.toUpperCase()}</span>
            </button>

            {isLangMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                {languages.map((locale) => (
                  <button
                    key={locale.code}
                    onClick={() => switchLocale(locale.code)}
                    className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                      currentLocale === locale.code ? 'text-indigo-600 font-semibold bg-indigo-50' : 'text-gray-700 hover:text-indigo-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{locale.label}</span>
                      {currentLocale === locale.code && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium uppercase">{locale.code}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden sm:flex flex-col items-end text-right mr-4">
             <a href="mailto:sales@fiormarkets.com" className="text-xs font-semibold text-gray-700 hover:text-indigo-600 transition-colors flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/></svg>
                sales@fiormarkets.com
             </a>
             <a href="tel:+919370600191" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                +91-9370600191
             </a>
          </div>

          <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 md:hidden" type="button" aria-haspopup="dialog" aria-expanded="false" data-state="closed" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu h-4 w-4" aria-hidden="true">
              <path d="M4 12h16"></path>
              <path d="M4 18h16"></path>
              <path d="M4 6h16"></path>
            </svg>
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="space-y-1 px-4 py-4">
            <Link href={`/${lang}`} onClick={() => setIsMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600">{dict.home || 'Home'}</Link>
            <Link href={`/${lang}/categories`} onClick={() => setIsMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600">{dict.categories || 'Industries'}</Link>
            <Link href={`/${lang}/reports`} onClick={() => setIsMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600">{dict.reports || 'Reports'}</Link>
            <Link href={`/${lang}/services`} onClick={() => setIsMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600">{dict.services || 'Services'}</Link>
            <Link href={`/${lang}/about`} onClick={() => setIsMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600">{dict.aboutUs || 'About Us'}</Link>
            <Link href={`/${lang}/contact`} onClick={() => setIsMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600">{dict.contactUs || 'Contact Us'}</Link>
          </div>
        </div>
      )}
    </header>
  )
}