import { Metadata } from 'next';
import { getDictionary } from '@/i18n/dictionaries';

export const metadata: Metadata = {
  title: 'Terms and Conditions | The Brainy Insights',
  description: 'Terms and conditions for using The Brainy Insights website and services.',
};

export default async function TermsConditionsPage({ params }: { params: Promise<{ lang: string }> }) {
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
            <h1 className="hero-title">{dict.termsOfService}</h1>
            <p className="hero-subtitle">{dict.termsOfServiceDesc || 'Please read these terms and conditions carefully before using our service.'}</p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          
          <div className="p-8 sm:p-12 space-y-8 text-gray-700 leading-relaxed text-justify">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2 uppercase">{dict.welcomeMessage || 'Welcome to The Brainy Insights!'}</h2>
              <p className="mb-4">
                These terms and conditions outline the rules and regulations for the use of The Brainy Insight's Website, located at https://www.thebrainyinsights.com/.
              </p>
              <p>
                By accessing this website we assume you accept these terms and conditions. Do not continue to use The Brainy Insights if you do not agree to take all of the terms and conditions stated on this page.
              </p>
            </section>

            <section>
              <p className="mb-4">
                The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all Agreements: "Client", "You" and "Your" refers to you, the person log on this website and compliant to the Company’s terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company. "Party", "Parties", or "Us", refers to both the Client and ourselves. All terms refer to the offer, acceptance and consideration of payment necessary to undertake the process of our assistance to the Client in the most appropriate manner for the express purpose of meeting the Client’s needs in respect of provision of the Company’s stated services, in accordance with and subject to, prevailing law of Netherlands. Any use of the above terminology or other words in the singular, plural, capitalization and/or he/she or they, are taken as interchangeable and therefore as referring to same.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 uppercase">{dict.cookies || 'Cookies'}</h3>
              <p className="mb-4">
                We employ the use of cookies. By accessing The Brainy Insights, you agreed to use cookies in agreement with the The Brainy Insights's Privacy Policy.
              </p>
              <p>
                Most interactive websites use cookies to let us retrieve the user’s details for each visit. Cookies are used by our website to enable the functionality of certain areas to make it easier for people visiting our website. Some of our affiliate partners may also use cookies.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 uppercase">{dict.license || 'License'}</h3>
              <p className="mb-4">
                Unless otherwise stated, The Brainy Insights and/or its licensors own the intellectual property rights for all material on The Brainy Insights. All intellectual property rights are reserved. You may access this from The Brainy Insights for your own personal use subjected to restrictions set in these terms and conditions.
              </p>
              <p className="mb-2">You must not:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Republish material from The Brainy Insights</li>
                <li>Sell, rent or sub-license material from The Brainy Insights</li>
                <li>Reproduce, duplicate or copy material from The Brainy Insights</li>
                <li>Redistribute content from The Brainy Insights</li>
              </ul>
              <p>This Agreement shall begin on the date hereof.</p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 uppercase">{dict.productsAndServices || 'Products and Services'}</h3>
              <p>
                The Brainy Insights holds all the rights to change, modify, and discontinue any of its products or services without prior notice.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 uppercase">{dict.deliveryOfProducts || 'Delivery of the Products'}</h3>
              <p>
                The delivery of purchase reports through The Brainy Insights will be done within 3 working days. However, the delivery duration may increase as per the client requirements.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 uppercase">{dict.liability || 'Liability'}</h3>
              <p>
                If any of our product, service, or information leads to monetary or statuary loss or damage to the user, The Brainy Insights is not liable and cannot be hold accountable.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 uppercase">{dict.payments || 'Payments'}</h3>
              <p>
                The Brainy Insights uses several third-party payment gateways in order to process the payments. All users purchasing products from our website thus approve to process payments through such third-party gateways.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 uppercase">{dict.refundPolicy || 'Refund and Cancellation Policy'}</h3>
              <p>
                Considering the nature of the product, The Brainy Insights does not have a refund policy and no refunds will be provided to the users purchasing our products and services. Also, order once placed cannot be cancelled.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 uppercase">{dict.warranty || 'Warranty'}</h3>
              <p>
                The Brainy Insights do not provide any warranty or gurantee of any of its products and services.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 uppercase">{dict.disclaimer || 'Disclaimer'}</h3>
              <p className="mb-4">
                To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>limit or exclude our or your liability for death or personal injury;</li>
                <li>limit or exclude our or your liability for fraud or fraudulent misrepresentation;</li>
                <li>limit any of our or your liabilities in any way that is not permitted under applicable law; or</li>
                <li>exclude any of our or your liabilities that may not be excluded under applicable law.</li>
              </ul>
              <p className="mb-4">
                The limitations and prohibitions of liability set in this Section and elsewhere in this disclaimer: (a) are subject to the preceding paragraph; and (b) govern all liabilities arising under the disclaimer, including liabilities arising in contract, in tort and for breach of statutory duty.
              </p>
              <p>
                As long as the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}