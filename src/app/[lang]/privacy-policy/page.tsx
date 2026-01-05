import { Metadata } from 'next';
import { getDictionary } from '@/i18n/dictionaries';

export const metadata: Metadata = {
  title: 'Privacy Policy | The Brainy Insights',
  description: 'Privacy Policy for The Brainy Insights.',
};

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="hero-section" style={{height: '375px'}}>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-indigo-700/95 to-purple-800/90"></div>
          <div className="hero-overlay-pattern"></div>
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute top-32 right-20 w-32 h-32 bg-purple-300/10 rounded-lg rotate-45 blur-lg"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-indigo-300/10 rounded-full blur-lg"></div>
          <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-white/5 rounded-lg rotate-12 blur-xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 via-transparent to-transparent"></div>
        </div>
        <div className="hero-container">
          <div className="text-center">
            <h1 className="hero-title">{dict.privacyPolicy}</h1>
            <p className="hero-subtitle">{dict.privacyPolicyDesc || 'We are committed to respecting the privacy rights of our customers.'}</p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          
          <div className="p-8 sm:p-12 space-y-8 text-gray-700 leading-relaxed text-justify">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2 uppercase">{dict.introduction || 'INTRODUCTION'}</h2>
              <p className="mb-4">
                The Brainy Insights LLP (“us,” “we,” or “Company”) is committed to respecting the privacy rights of its customers, visitors, and other users of the Company Website (the “Site”). We created this Website Privacy Policy (this “Policy”) to give you confidence as you visit and use the Site, and to demonstrate our commitment to fair information practices and the protection of privacy. This Policy is only applicable to the Site, and not to any other websites that you may be able to access from the Site, each of which may have data collection and use practices and policies that differ materially from this Policy.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">THE GENERAL DATA PROTECTION REGULATION</h3>
              <p className="mb-4">
                The General Data Protection Regulation (GDPR) addressing the data protection and privacy of users accessing our website from the European Union. User are requested to feel free to get in touch with us on sales@thebrainyinsights.com for any queries regarding the GDPR policy.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Data of User and the Company</h3>
              <p className="mb-4">
                The privacy policy explains how the user information is collected, used, shared, and protected as we respect user privacy. This policy also reveals the user choices for managing user information preferences, which includes rights of user’s personal data under the EU GDPR.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Data Collected By the Company</h3>
              <p className="mb-4">
                A user opting for the services on the website is liable to submit information such as name, email address, phone number, and address.
              </p>
              <p className="mb-4">
                Also, when a user makes a purchase from our website, we collect users financial information like credit card details. However, the website does not store such information and it is used only by the payment card processor to complete the payment. The affirmative consent from the users from EU makes our process and mechanism of collecting payments easier. The users from EU can withdraw such consent anytime by sending us an email on payments@thebrainyinsights.com.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Data Storage and Use</h3>
              <p className="mb-4">The personal data collected on the website is used to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Attain requests submitted by the user</li>
                <li>Complete the payment process</li>
                <li>Send updates to the user regarding the purchased products</li>
                <li>Inform users about new offers and products that might interest them</li>
              </ul>
              <p className="mb-4">
                The data submitted by the user is stored on secure servers in the United States. This information will not be shared with any third party without the consent of the user. The exception to this will be cases wherein it becomes necessary for us to provide the user information to comply with the law.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Data Collected Other Than Personal Information</h3>
              <p className="mb-4">
                We analyse our website traffic and may collect information such as IP address, browser information, and location. This information helps us in monitoring our marketing strategies and improving overall user interaction on the website.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Information Collected</h3>
              <p className="mb-4">
                We collect information such as name, email address, phone number, and address in order to offer the best services to our clients. Our website may also access your IP address, browser, and location, which may not necessarily include your personal information.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Information Sharing</h3>
              <p className="mb-4">
                We strictly do not disclose or share our user’s information to any third party whatsoever. The information collected is only used by us for business purpose and providing additional services related to product purchases.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}