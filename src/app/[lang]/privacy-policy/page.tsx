import { getDictionary } from '@/i18n/dictionaries';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.fiormarkets.com';

  return {
    title: 'Privacy Policy',
    description: 'Learn how we collect, use, store, and protect your personal information.',
    alternates: {
      canonical: `${siteUrl}/${lang}/privacy-policy`,
    },
  };
}

export default async function PrivacyPolicy({ params }: Props) {
  const { lang } = await params;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">Privacy Policy</h1>
        
        <div className="prose max-w-none text-gray-700 leading-relaxed text-justify space-y-6">
          <h3 className="font-bold text-gray-900 text-lg">INTRODUCTION</h3>
          <p>
            Fior Markets Private Limited (“Company,” “we,” “us,” or “our”) is committed to protecting the privacy and personal information of its customers, website visitors, and users (collectively, “users”). This Website Privacy Policy (“Policy”) is designed to inform users about how we collect, use, store, and protect personal information when accessing or using our website (the “Site”).
            This Policy applies solely to information collected through the Site and does not extend to any third-party websites that may be accessed through links on our Site. Such third-party websites operate under their own privacy policies and data handling practices, which may differ materially from this Policy.
          </p>

          <h3 className="font-bold text-gray-900 text-lg">GENERAL DATA PROTECTION REGULATION (GDPR)</h3>
          <p>
            This Policy is compliant with the General Data Protection Regulation (GDPR), which governs the protection and privacy of personal data of users accessing our website from the European Union. Users may contact us at sales@fiormarkets.com for any queries or concerns related to GDPR compliance.
          </p>

          <h3 className="font-bold text-gray-900 text-lg">USER PERSONAL DATA AND COMPANY RESPONSIBILITIES</h3>
          <p>
            This Privacy Policy explains how personal information provided by users is collected, used, processed, shared, and safeguarded. It also outlines the choices available to users regarding the management of their personal data and highlights user rights under the EU GDPR.
          </p>

          <h3 className="font-bold text-gray-900 text-lg">PERSONAL DATA COLLECTED BY THE COMPANY</h3>
          <p>
            When users choose to access our services or interact with our website, they may be required to provide certain personal information, including but not limited to:
          </p>
          <ul className="list-disc pl-5">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Physical address</li>
          </ul>
          <p>
            In the event of a purchase, users may be required to submit financial information such as credit or debit card details. Please note that we do not store or retain any financial information. Such data is processed securely by authorized third-party payment processors solely for the purpose of completing transactions.
            For users located in the European Union, explicit consent is obtained before processing payment-related data. Users may withdraw their consent at any time by contacting us at payments@fiormarkets.com.
          </p>

          <h3 className="font-bold text-gray-900 text-lg">PERSONAL DATA STORAGE AND USE</h3>
          <p>The personal data collected through the Site is used for the following purposes:</p>
          <ul className="list-disc pl-5">
            <li>To fulfill user requests and inquiries</li>
            <li>To process and complete payments</li>
            <li>To provide updates related to purchased products or services</li>
            <li>To communicate information about new products, services, or promotional offers that may be of interest to users</li>
          </ul>
          <p>
            All user data is stored on secure servers located in the United States. We do not share personal information with third parties without user consent, except where disclosure is required to comply with applicable laws, regulations, or legal processes.
          </p>

          <h3 className="font-bold text-gray-900 text-lg">NON-PERSONAL DATA COLLECTION</h3>
          <p>
            We may collect non-personal information such as IP addresses, browser type, device information, and geographic location. This data helps us analyze website traffic, evaluate marketing effectiveness, and improve overall user experience.
            Additionally, with user consent, we use browser cookies and similar technologies to enhance website functionality and personalize the browsing experience.
          </p>

          <h3 className="font-bold text-gray-900 text-lg">INFORMATION COLLECTED</h3>
          <p>
            To provide efficient and high-quality services, we collect personal information including name, email address, phone number, and address. We may also automatically collect technical data such as IP address, browser details, and approximate location, which may not directly identify individual users. Cookies are used only with user consent to improve site performance and usability.
          </p>

          <h3 className="font-bold text-gray-900 text-lg">INFORMATION SHARING</h3>
          <p>
            We do not sell, trade, or disclose user personal information to any third party. All information collected is used strictly for internal business purposes, including service delivery, transaction processing, and customer support related to product purchases.
          </p>
        </div>
      </div>
    </div>
  );
}
