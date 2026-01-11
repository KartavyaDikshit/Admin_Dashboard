'use client'

interface TestimonialsProps {
  testimonials: any[]
  dict: any
}

export default function Testimonials({ testimonials, dict }: TestimonialsProps) {
  const displayTestimonials = testimonials.length > 0 ? testimonials : [
    {
      id: '1',
      content: "The renewable energy market reports have been game-changers for our business planning. The data accuracy and projections exceed expectations.",
      author: "David Kim",
      position: "Business Development Manager",
      company: "Energy Dynamics Corp",
      initials: "DK",
      colorFrom: "from-indigo-500",
      colorTo: "to-purple-600"
    },
    {
      id: '2',
      content: "The financial sector reports provide comprehensive analysis that our clients rely on. The market forecasts and competitive landscape analysis are invaluable.",
      author: "James Wilson",
      position: "Financial Analyst",
      company: "Investment Partners LLC",
      initials: "JW",
      colorFrom: "from-indigo-500",
      colorTo: "to-purple-600"
    },
    {
      id: '3',
      content: "Their consumer behavior insights and retail analysis have transformed our go-to-market strategies. The ROI on these reports has been remarkable.",
      author: "Lisa Anderson",
      position: "VP of Marketing",
      company: "Consumer Brands Ltd",
      initials: "LA",
      colorFrom: "from-indigo-500",
      colorTo: "to-purple-600"
    },
    {
      id: '4',
      content: "Exceptional depth in their healthcare market research. The granular data helped us identify niche opportunities we would have missed.",
      author: "Sarah Chen",
      position: "Strategy Director",
      company: "MediCare Solutions",
      initials: "SC",
      colorFrom: "from-blue-500",
      colorTo: "to-cyan-600"
    }
  ];

  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{dict.clientsTestimonialsTitle || 'What Our Clients Say'}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{dict.clientsTestimonialsDesc || 'Trusted by industry leaders worldwide for data-driven insights.'}</p>
        </div>
        
        <div className="relative w-full overflow-hidden group">
           {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>

          <div className="flex w-max animate-marquee-fast group-hover:[animation-play-state:paused]" style={{ willChange: 'transform' }}>
             {/* Duplicate 3 times for smooth loop */}
             {[1, 2, 3].map((setIndex) => (
                <div key={`set-${setIndex}`} className="flex gap-6 px-3">
                  {displayTestimonials.map((t, i) => (
                    <div key={`${setIndex}-${t.id}-${i}`} className="w-[400px] flex-shrink-0 bg-white text-card-foreground flex flex-col gap-6 rounded-xl border hover:shadow-lg transition-all duration-300 transform">
                        <div className="p-6 h-full flex flex-col">
                        <div className="mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-quote h-6 w-6 text-indigo-600 opacity-20">
                            <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path>
                            <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path>
                            </svg>
                        </div>
                        <div className="flex items-center mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star h-4 w-4 text-yellow-400 fill-current">
                                <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                            </svg>
                            ))}
                        </div>
                        <blockquote className="text-gray-700 mb-6 flex-grow leading-relaxed text-sm">
                            “{t.content}”
                        </blockquote>
                        <div className="flex items-center mt-auto">
                            <div className="flex-shrink-0">
                            {t.image ? (
                                <img 
                                    src={t.image} 
                                    alt={t.author} 
                                    className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                                />
                            ) : (
                                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.colorFrom || 'from-indigo-500'} ${t.colorTo || 'to-purple-600'} flex items-center justify-center text-white font-semibold text-xs`}>
                                    {t.initials || t.author.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                            )}
                            </div>
                            <div className="ml-3">
                            <p className="text-sm font-semibold text-gray-900">{t.author}</p>
                            <p className="text-xs text-gray-600">{t.position}</p>
                            <p className="text-xs text-indigo-600 font-medium">{t.company}</p>
                            </div>
                        </div>
                        </div>
                    </div>
                  ))}
                </div>
             ))}
          </div>
        </div>
      </div>
    </section>
  )
}
