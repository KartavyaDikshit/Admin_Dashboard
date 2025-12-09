'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface HeroProps {
  dict: any
  lang: string
}

export default function Hero({ dict, lang }: HeroProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/${lang}/reports?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <section className="hero-section min-h-[375px] h-auto flex items-center">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-indigo-700/95 to-purple-800/90"></div>
        <div className="hero-overlay-pattern"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute top-32 right-20 w-32 h-32 bg-purple-300/10 rounded-lg rotate-45 blur-lg"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-indigo-300/10 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-white/5 rounded-lg rotate-12 blur-xl"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 via-transparent to-transparent"></div>
      </div>
      <div className="hero-container pt-20 pb-12">
        <div className="text-center max-w-4xl mx-auto w-full">
          <h1 className="hero-title">{dict.heroTitle}</h1>
          <p className="hero-subtitle mb-6">{dict.heroSubtitle}</p>
          <div className="max-w-2xl mx-auto mb-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" aria-hidden="true">
                  <path d="m21 21-4.34-4.34"></path>
                  <circle cx="11" cy="11" r="8"></circle>
                </svg>
                <input 
                  type="text" 
                  placeholder={dict.searchPlaceholder} 
                  className="w-full pl-10 h-12 text-base rounded-md border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white">
                {dict.searchButton}
              </button>
            </form>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download h-4 w-4 text-indigo-200" aria-hidden="true">
                <path d="M12 15V3"></path>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <path d="m7 10 5 5 5-5"></path>
              </svg>
              <span>{dict.instantDownload}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card h-4 w-4 text-indigo-200" aria-hidden="true">
                <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                <line x1="2" x2="22" y1="10" y2="10"></line>
              </svg>
              <span>{dict.secureCheckout}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}