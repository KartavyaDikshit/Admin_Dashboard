import { getDictionary } from '@/i18n/dictionaries';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | The Brainy Insights',
  description: 'Contact The Brainy Insights for your market research needs. Address: Pune, India. Phone: +1-315-215-1633.',
};

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{dict.contactTitle}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {dict.contactText}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">{dict.contactInfo}</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{dict.headquarters}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {dict.addressText}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{dict.phone}</h3>
                <p className="text-gray-600">+1-315-215-1633</p>
                <p className="text-gray-600">+91-9370600191</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{dict.email}</h3>
                <a href="mailto:sales@thebrainyinsights.com" className="text-blue-600 hover:underline">sales@thebrainyinsights.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{dict.contactFormTitle}</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{dict.formName}</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder={dict.formPlaceholderName} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{dict.formEmail}</label>
              <input type="email" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder={dict.formPlaceholderEmail} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{dict.formSubject}</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder={dict.formPlaceholderSubject} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{dict.formMessage}</label>
              <textarea className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none h-32" placeholder={dict.formPlaceholderMessage}></textarea>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
              {dict.formSubmit}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}