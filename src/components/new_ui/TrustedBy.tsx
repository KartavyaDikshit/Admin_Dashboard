interface TrustedByProps {
  dict: any
}

export default function TrustedBy({ dict }: TrustedByProps) {
  const companies = [
    { code: 'TV', name: 'TechVision Corp' },
    { code: 'GR', name: 'GlobalRetail Solutions' },
    { code: 'IL', name: 'Innovation Labs' },
    { code: 'HP', name: 'HealthcarePro' },
    { code: 'FG', name: 'FinanceGroup International' },
    { code: 'SS', name: 'StartupSuccess' },
    { code: 'ED', name: 'Energy Dynamics' },
    { code: 'AT', name: 'AutoTech Industries' },
    { code: 'PI', name: 'Pharma Innovations' },
    { code: 'DM', name: 'Digital Marketing Pro' },
    { code: 'ME', name: 'Manufacturing Elite' },
    { code: 'FB', name: 'Food & Beverage Co' },
  ]

  // Create a duplicated list for the scroll effect if needed, but the mhtml just has a long list.
  // The mhtml shows a horizontal scroll container or just a flex container.
  // "overflow-hidden" and "flex gap-6 scroll-container"
  // I will replicate the HTML structure exactly.

  const companyItems = companies.concat(companies).map((company, index) => (
    <div key={`${company.code}-${index}`} className="flex flex-col items-center justify-center p-4 bg-white hover:bg-gray-50 rounded-lg transition-all duration-300 min-w-[140px] flex-shrink-0">
      <div className="w-12 h-12 mb-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">{company.code}</span>
      </div>
      <h3 className="text-xs font-semibold text-gray-900 text-center">{company.name}</h3>
    </div>
  ))

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{dict.trustedBy}</h2>
        </div>
        <div className="relative">
          <div className="overflow-hidden">
            <div className="flex gap-6 scroll-container">
              {companyItems}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}