import { getDictionary } from '@/i18n/dictionaries';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.thebrainyinsights.com';

  return {
    title: 'Terms and Conditions | The Brainy Insights',
    description: 'Read our terms and conditions regarding the use of our website, products, and services.',
    alternates: {
      canonical: `${siteUrl}/${lang}/terms-conditions`,
    },
  };
}

export default async function TermsConditions({ params }: Props) {
  const { lang } = await params;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">Terms and Conditions</h1>
        
        <div className="prose max-w-none text-gray-700 leading-relaxed text-justify space-y-6">
          <p><strong>Welcome to The Brainy Insights</strong></p>
          <p>
            These Terms and Conditions govern your use of the website operated by The Brainy Insights, accessible at https://brainyinsights.com/ (the “Website”).
            By accessing or using this Website, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not continue to use The Brainy Insights Website.
          </p>

          <h3 className="font-bold text-gray-900 text-lg">Definitions and Interpretation</h3>
          <p>
            The following terminology applies to these Terms and Conditions, the Privacy Policy, Disclaimer, and all related agreements:
            “Client,” “You,” “Your” refers to the individual accessing or using this Website and complying with the Company’s terms.
            “The Company,” “We,” “Us,” “Our,” “Ourselves” refers to The Brainy Insights.
            “Party,” “Parties” refers collectively to the Client and the Company.
            All terms refer to the offer, acceptance, and consideration of payment necessary to provide our services in the most appropriate manner to meet the Client’s needs, in accordance with applicable laws of the Netherlands. Words used in the singular or plural, or any gender references, shall be deemed interchangeable.
          </p>

          <h3 className="font-bold text-gray-900 text-lg">Cookies</h3>
          <p>
            We use cookies to enhance user experience. By accessing The Brainy Insights Website, you consent to the use of cookies in accordance with our Privacy Policy.
            Cookies help us retrieve user details, enable website functionality, and improve usability. Some affiliate or third-party partners may also use cookies.
          </p>

          <h3 className="font-bold text-gray-900 text-lg">Intellectual Property Rights</h3>
          <p>
            Unless otherwise stated, The Brainy Insights and/or its licensors own all intellectual property rights for the content published on this Website. All rights are reserved.
            You may access content from The Brainy Insights for personal use only, subject to the restrictions outlined below.
          </p>
          <p>You must not:</p>
          <ul className="list-disc pl-5">
            <li>Republish material from The Brainy Insights</li>
            <li>Sell, rent, or sub-license material</li>
            <li>Reproduce, duplicate, or copy material</li>
            <li>Redistribute content</li>
          </ul>
          <p>This Agreement becomes effective from the date you access the Website.</p>

          <h3 className="font-bold text-gray-900 text-lg">Products and Services</h3>
          <p>The Brainy Insights reserves the right to modify, update, suspend, or discontinue any product or service at its sole discretion without prior notice.</p>

          <h3 className="font-bold text-gray-900 text-lg">Delivery of Products</h3>
          <p>Purchased reports and products will generally be delivered within three (3) working days. Delivery timelines may vary depending on client-specific requirements or customization.</p>

          <h3 className="font-bold text-gray-900 text-lg">Limitation of Liability</h3>
          <p>The Brainy Insights shall not be held liable for any direct, indirect, incidental, consequential, monetary, or statutory loss or damage arising from the use of our products, services, or information.</p>

          <h3 className="font-bold text-gray-900 text-lg">Payments</h3>
          <p>Payments made on The Brainy Insights Website are processed through third-party payment gateways. By purchasing from our Website, you agree to the processing of payments through these third-party service providers.</p>

          <h3 className="font-bold text-gray-900 text-lg">Refund and Cancellation Policy</h3>
          <p>Due to the nature of our products and services, all sales are final. No refunds or cancellations will be provided once an order has been placed.</p>

          <h3 className="font-bold text-gray-900 text-lg">Warranty Disclaimer</h3>
          <p>The Brainy Insights does not provide any warranties or guarantees, express or implied, regarding its products or services.</p>

          <h3 className="font-bold text-gray-900 text-lg">Hyperlinking to Our Content</h3>
          <p>The following organizations may link to our Website without prior written approval:</p>
          <ul className="list-disc pl-5">
            <li>Government agencies</li>
            <li>Search engines</li>
            <li>News organizations</li>
            <li>Online directory distributors</li>
            <li>System-wide accredited businesses (excluding soliciting non-profits, charity malls, or fundraising groups)</li>
          </ul>
          <p>Such links must:</p>
          <ul className="list-disc pl-5">
            <li>Not be misleading or deceptive</li>
            <li>Not falsely imply sponsorship or endorsement</li>
            <li>Be appropriate within the context of the linking site</li>
          </ul>

          <h3 className="font-bold text-gray-900 text-lg">Other Link Requests</h3>
          <p>We may review and approve link requests from:</p>
          <ul className="list-disc pl-5">
            <li>Consumer or business information sources</li>
            <li>Online communities</li>
            <li>Associations and charities</li>
            <li>Internet portals</li>
            <li>Professional service firms</li>
            <li>Educational institutions and trade associations</li>
          </ul>
          <p>
            Approval is subject to our discretion based on reputation, relevance, and mutual benefit.
            Interested organizations must email The Brainy Insights with relevant details. Please allow 2–3 weeks for a response.
            Approved organizations may link using:
          </p>
          <ul className="list-disc pl-5">
            <li>Our corporate name</li>
            <li>The Website URL</li>
            <li>A contextually appropriate description</li>
          </ul>
          <p>Use of our logo or artwork is prohibited without a written trademark license agreement.</p>

          <h3 className="font-bold text-gray-900 text-lg">iFrames</h3>
          <p>Without prior written consent, you may not create frames around our Website that alter its visual appearance or presentation.</p>

          <h3 className="font-bold text-gray-900 text-lg">Content Liability</h3>
          <p>
            We are not responsible for content appearing on external websites linking to us. You agree to indemnify and defend us against any claims arising from your Website.
            No links should appear on websites containing unlawful, defamatory, obscene, or infringing content.
          </p>

          <h3 className="font-bold text-gray-900 text-lg">Privacy</h3>
          <p>Please refer to our Privacy Policy for information on how we collect, use, and protect your data.</p>

          <h3 className="font-bold text-gray-900 text-lg">Reservation of Rights</h3>
          <p>
            We reserve the right to request removal of any link to our Website at any time. You agree to comply immediately upon request.
            We also reserve the right to amend these Terms and Conditions and our linking policy at any time. Continued use of the Website constitutes acceptance of any changes.
          </p>

          <h3 className="font-bold text-gray-900 text-lg">Removal of Links from Our Website</h3>
          <p>If you find any link on our Website objectionable, you may notify us. While we will consider such requests, we are not obligated to remove links or respond directly.</p>

          <h3 className="font-bold text-gray-900 text-lg">Accuracy of Information</h3>
          <p>We do not guarantee the accuracy, completeness, or timeliness of information on this Website. We do not warrant uninterrupted availability or that content will always be up to date.</p>

          <h3 className="font-bold text-gray-900 text-lg">Trademarks</h3>
          <p>All trademarks, service marks, logos, and trade names displayed on the Website are the property of their respective owners and are protected under applicable intellectual property laws.</p>

          <h3 className="font-bold text-gray-900 text-lg">Disclaimer</h3>
          <p>
            To the maximum extent permitted by law, we exclude all representations, warranties, and conditions related to the Website and its use.
            Nothing in this disclaimer shall:
          </p>
          <ul className="list-disc pl-5">
            <li>Limit liability for death or personal injury</li>
            <li>Limit liability for fraud or fraudulent misrepresentation</li>
            <li>Exclude liabilities not permitted under applicable law</li>
          </ul>
          <p>
            These limitations apply to all liabilities arising in contract, tort, or statutory duty.
            As long as the Website and its services are provided free of charge, we shall not be liable for any loss or damage of any nature.
          </p>
        </div>
      </div>
    </div>
  );
}
