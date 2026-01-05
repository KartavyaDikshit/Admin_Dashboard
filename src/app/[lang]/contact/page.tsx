import { getDictionary } from '@/i18n/dictionaries';
import ContactForm from '@/components/new_ui/ContactForm';

export default async function Contact({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return (
    <div className="min-h-screen bg-white">
      <section className="hero-section">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="hero-container py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
            <div>
              <h1 className="hero-title text-left mb-6">{dict.contactTitle || 'Get Expert Market Research Insights'}</h1>
              <p className="hero-subtitle text-left mb-8 mx-0">{dict.contactText}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#contact-form" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all h-11 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-3 shadow-md hover:shadow-lg">
                  {dict.requestCallback || 'Request Callback'}
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-2xl w-full h-64 flex items-center justify-center"><span className="text-white text-lg font-semibold">{dict.headquarters || 'Professional Business Office'}</span></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#4f46e5]/20 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact-form" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{dict.contactFormTitle || 'Ready to Get Started?'}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{dict.formPlaceholderMessage}</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div data-slot="card" className="text-card-foreground flex flex-col gap-6 rounded-xl border bg-white shadow-lg">
              <div data-slot="card-header" className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 [.border-b]:pb-6">
                <h4 data-slot="card-title" className="text-2xl text-indigo-600">{dict.contactFormTitle}</h4>
              </div>
              <div data-slot="card-content" className="px-3 [&:last-child]:pb-6">
                <ContactForm dict={dict} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{dict.contactInfo}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{dict.chooseCommunicationMethod || 'Choose the communication method that works best for you. Our team is ready to assist.'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border text-center group hover:shadow-lg transition-all duration-300">
              <div data-slot="card-content" className="p-8">
                <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-700 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone h-12 w-12 text-white" aria-hidden="true"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"></path></svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{dict.phone || 'Phone Support'}</h3>
                <p className="text-gray-600 mb-6">{dict.phoneSupportDesc || 'Speak directly with our research consultants for immediate assistance and project discussions.'}</p>
                <div className="space-y-2 mb-6">
                  <p className="font-semibold text-indigo-600">+1-315-215-1633</p>
                  <p className="text-sm text-gray-500">{dict.phoneHours || 'Monday - Friday, 9 AM - 6 PM EST'}</p>
                </div>
                <a href="tel:+13152151633" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-bold transition-all h-11 px-4 py-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">{dict.callNow || 'Call Now'}</a>
              </div>
            </div>
            <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border text-center group hover:shadow-lg transition-all duration-300">
              <div data-slot="card-content" className="p-8">
                <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-700 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail h-12 w-12 text-white" aria-hidden="true"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path><rect x="2" y="4" width="20" height="16" rx="2"></rect></svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{dict.email || 'Email Us'}</h3>
                <p className="text-gray-600 mb-6">{dict.emailSupportDesc || 'Send us detailed information about your project requirements and we\'ll respond within 24 hours.'}</p>
                <div className="space-y-2 mb-6">
                  <p className="font-semibold text-indigo-600">sales@thebrainyinsights.com</p>
                  <p className="text-sm text-gray-500">{dict.emailResponseTime || 'Response within 24 hours'}</p>
                </div>
                <a href="mailto:sales@thebrainyinsights.com" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-bold transition-all h-11 px-4 py-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">{dict.sendEmail || 'Send Email'}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin h-8 w-8 text-indigo-600 mr-3" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <h2 className="text-3xl font-bold text-gray-900">{dict.address || 'Visit Our Office'}</h2>
              </div>
              <div className="space-y-4 text-gray-600">
                <div><p className="text-lg font-semibold text-gray-900 mb-2">TheBrainyInsights</p><p>450 Lexington Avenue</p><p>Suite 1200</p><p>New York, NY 10017</p></div>
                <div className="pt-4"><p className="text-sm text-gray-500 mb-2">Office Hours:</p><p className="text-sm">Monday - Friday: 9:00 AM - 6:00 PM EST</p></div>
                <div className="pt-4"><a href="https://www.google.com/maps/search/?api=1&query=450+Lexington+Avenue+Suite+1200+New+York,+NY+10017" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-navigation h-4 w-4 mr-2" aria-hidden="true"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>Get Directions</a></div>
              </div>
            </div>
            <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border overflow-hidden">
              <div data-slot="card-content" className="p-0">
                <a href="https://www.google.com/maps/search/?api=1&query=450+Lexington+Avenue+Suite+1200+New+York,+NY+10017" target="_blank" rel="noopener noreferrer" className="block bg-gray-100 h-64 cursor-pointer relative group transition-all duration-300 hover:bg-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin h-12 w-12 text-indigo-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      <p className="text-gray-700 font-semibold">Click to Open Map</p>
                      <p className="text-sm text-gray-500 mt-1">450 Lexington Ave, NYC</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 opacity-10">
                    <div className="grid grid-cols-8 grid-rows-6 h-full">
                      {Array.from({ length: 48 }).map((_, i) => <div key={i} className="border border-gray-300"></div>)}
                    </div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 bg-indigo-600 rounded-full animate-pulse shadow-lg"></div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
