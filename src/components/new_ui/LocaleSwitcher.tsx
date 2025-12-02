'use client'

import { usePathname, useRouter } from 'next/navigation'
import { GlobeAltIcon } from '@heroicons/react/24/outline'

export default function LocaleSwitcher() {
  const pathname = usePathname()
  const router = useRouter()

  const currentLocale = pathname.split('/')[1] || 'en'

  const switchLocale = (locale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${locale}`)
    router.push(newPath)
  }

  return (
    <div className="relative group">
      <button className="flex items-center space-x-1 text-sm font-medium hover:text-indigo-600 transition-colors">
        <GlobeAltIcon className="h-4 w-4" />
        <span className="uppercase">{currentLocale}</span>
      </button>
      <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {['en', 'de', 'fr', 'it', 'ja', 'ko', 'es'].map((locale) => (
          <button
            key={locale}
            onClick={() => switchLocale(locale)}
            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
              currentLocale === locale ? 'text-indigo-600 font-medium' : 'text-gray-700'
            }`}
          >
            {locale.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}
