'use client';

import Image from 'next/image';

const companies = [
  { name: 'Company 1', logo: '/window.svg' },
  { name: 'Company 2', logo: '/globe.svg' },
  { name: 'Company 3', logo: '/file.svg' },
  { name: 'Company 4', logo: '/window.svg' },
  { name: 'Company 5', logo: '/globe.svg' },
  { name: 'Company 6', logo: '/file.svg' },
  { name: 'Company 7', logo: '/window.svg' },
  { name: 'Company 8', logo: '/globe.svg' },
];

interface TrustedByStripProps {
  title: string;
}

export default function TrustedByStrip({ title }: TrustedByStripProps) {
  return (
    <div className="w-full bg-white border-b border-gray-200 py-8 overflow-hidden">
      <div className="container mx-auto px-4 mb-6 text-center">
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</p>
      </div>
      
      <div className="relative flex overflow-x-hidden group">
        <div className="py-2 animate-marquee whitespace-nowrap flex items-center gap-16 group-hover:[animation-play-state:paused]">
          {/* First set of logos */}
          {companies.map((company, index) => (
            <div key={`logo-1-${index}`} className="mx-4 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0">
              <Image 
                src={company.logo} 
                alt={company.name} 
                width={100} 
                height={40} 
                className="h-8 w-auto object-contain"
              />
            </div>
          ))}
          
          {/* Duplicate set for seamless loop */}
          {companies.map((company, index) => (
            <div key={`logo-2-${index}`} className="mx-4 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0">
              <Image 
                src={company.logo} 
                alt={company.name} 
                width={100} 
                height={40} 
                className="h-8 w-auto object-contain"
              />
            </div>
          ))}

           {/* Triplicate set for seamless loop on wide screens */}
           {companies.map((company, index) => (
            <div key={`logo-3-${index}`} className="mx-4 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0">
              <Image 
                src={company.logo} 
                alt={company.name} 
                width={100} 
                height={40} 
                className="h-8 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
