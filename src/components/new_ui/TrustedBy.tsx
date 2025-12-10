import Image from 'next/image'

interface TrustedByProps {
  dict: any
}

const CLIENT_LOGOS = [
  'accenture.jpg', 'alpha-laval.jpg', 'ames.jpg', 'basf.jpg', 'bridgestone.jpg',
  'camso.jpg', 'corning.jpg', 'elanco.jpg', 'evonik.jpg', 'fuzifilm.jpg',
  'gaf.jpg', 'ge.jpg', 'global-knowledge.jpg', 'honeywell.jpg', 'ibm.jpg',
  'intel.jpg', 'jindal-stainless.jpg', 'kawasaki.jpg', 'kodak-alaris.jpg', 'kongsberg.jpg',
  'kpmg.jpg', 'leica-geosystems.jpg', 'lg.jpg', 'mahindra-rise.jpg', 'mckinsey.jpg',
  'michelin.jpg', 'microban.jpg', 'microsoft.jpg', 'mitsubishi.jpg', 'morgan.jpg',
  'mpa.jpg', 'nestle.jpg', 'nov.jpg', 'panasonic.jpg', 'paychex.jpg',
  'philips.jpg', 'rockwell.jpg', 'saint-gobain.jpg', 'selo.jpg', 'shell.jpg',
  'sony.jpg', 'soraa.jpg', 'strattec.jpg', 'sumitomo.jpg', 'symantec.jpg',
  'tetra-pak.jpg', 'texas-instruments.jpg', 'thermo-fisher.jpg', 'transcontinental.jpg', 'tsi.jpg',
  'wacker.jpg'
];

export default function TrustedBy({ dict }: TrustedByProps) {
  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{dict.trustedBy}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="relative w-full overflow-hidden group">
          {/* Gradient Masks for smooth fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>

          <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]" style={{ willChange: 'transform' }}>
            {/* First Copy */}
            <div className="flex items-center gap-12 px-6">
              {CLIENT_LOGOS.map((logo, index) => (
                <div key={`logo-1-${index}`} className="relative w-32 h-16 flex items-center justify-center transition-all duration-300 hover:scale-110 transform-gpu">
                  <Image
                    src={`/images/clients/${logo}`}
                    alt={logo.replace('.jpg', '').replace(/-/g, ' ')}
                    fill
                    className="object-contain"
                    sizes="128px"
                  />
                </div>
              ))}
            </div>

            {/* Second Copy for Infinite Loop */}
            <div className="flex items-center gap-12 px-6">
              {CLIENT_LOGOS.map((logo, index) => (
                <div key={`logo-2-${index}`} className="relative w-32 h-16 flex items-center justify-center transition-all duration-300 hover:scale-110 transform-gpu">
                  <Image
                    src={`/images/clients/${logo}`}
                    alt={logo.replace('.jpg', '').replace(/-/g, ' ')}
                    fill
                    className="object-contain"
                    sizes="128px"
                  />
                </div>
              ))}
            </div>

            {/* Third Copy for Wide Screens/Safety */}
            <div className="flex items-center gap-12 px-6">
              {CLIENT_LOGOS.map((logo, index) => (
                <div key={`logo-3-${index}`} className="relative w-32 h-16 flex items-center justify-center transition-all duration-300 hover:scale-110 transform-gpu">
                  <Image
                    src={`/images/clients/${logo}`}
                    alt={logo.replace('.jpg', '').replace(/-/g, ' ')}
                    fill
                    className="object-contain"
                    sizes="128px"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
