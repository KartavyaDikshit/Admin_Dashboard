'use client';

import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';

type Testimonial = {
  id: string;
  author: string;
  company?: string | null;
  position?: string | null;
  content: string;
  rating?: number | null;
  image?: string | null;
};

type Props = {
  testimonials: Testimonial[];
  title: string;
  subtitle: string;
};

export default function TestimonialsStrip({ testimonials, title, subtitle }: Props) {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Duplicate testimonials to create seamless loop
  const allTestimonials = [...testimonials, ...testimonials, ...testimonials];

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4 text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      <div 
        className="relative w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

        <div 
          ref={scrollRef}
          className={`flex gap-6 w-max animate-marquee ${isPaused ? 'pause-animation' : ''}`}
          style={{ animationDuration: `${testimonials.length * 10}s` }}
        >
          {allTestimonials.map((testimonial, index) => (
            <div 
              key={`${testimonial.id}-${index}`} 
              className="w-[350px] md:w-[400px] bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between flex-shrink-0"
            >
              <div>
                <div className="flex gap-1 mb-4 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-5 h-5 ${i < (testimonial.rating || 5) ? 'fill-current' : 'text-gray-300'}`} 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                <p className="text-gray-700 text-lg italic leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>
              </div>

              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 relative rounded-full overflow-hidden bg-indigo-100 flex-shrink-0">
                  {testimonial.image ? (
                    <Image 
                      src={testimonial.image} 
                      alt={testimonial.author} 
                      fill 
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                      {testimonial.author.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h4 className="font-bold text-gray-900 truncate">{testimonial.author}</h4>
                  <p className="text-sm text-gray-500 truncate">
                    {testimonial.position}{testimonial.position && testimonial.company ? ', ' : ''}{testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
