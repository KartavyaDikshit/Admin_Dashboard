import Link from 'next/link'

interface FeaturedCategoriesProps {
  categories: any[]
  dict: any
  lang: string
}

export default function FeaturedCategories({ categories, dict, lang }: FeaturedCategoriesProps) {
  // Helper to get icon SVG - In a real app, these might be dynamic or mapped. 
  // For "Exactness", I will use the SVGs from the MHTML for the specific categories if I can match them, 
  // otherwise I'll use a generic one but with the EXACT classes.
  // The MHTML has specific SVGs for: Healthcare, Technology, Manufacturing, Financial, Retail, Energy.
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{dict.featuredCategoriesTitle}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{dict.featuredCategoriesDesc}</p>
        </div>
        <div className="bg-indigo-600/10 backdrop-blur-sm rounded-2xl p-6 border border-indigo-200/30 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/${lang}/categories/${category.slug}`}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="mb-3 text-indigo-600">
                  <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="2.5" fill="none"></circle>
                    <rect x="28" y="18" width="8" height="28" rx="1" fill="currentColor"></rect>
                    <rect x="18" y="28" width="28" height="8" rx="1" fill="currentColor"></rect>
                  </svg>
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-indigo-600 transition-colors">{category.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{category.description || 'Market analysis and insights.'}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="text-center mt-12">
          <Link href={`/${lang}/categories`} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
            {dict.viewAllCategories}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 w-5 h-5">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}