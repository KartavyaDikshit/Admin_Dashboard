import { getDictionary } from '@/i18n/dictionaries';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.thebrainyinsights.com';

  return {
    title: 'Frequently Asked Questions (FAQs) | The Brainy Insights',
    description: 'Find answers to common questions about our market research reports, ordering process, licenses, payments, and post-sale support.',
    alternates: {
      canonical: `${siteUrl}/${lang}/faqs`,
    },
  };
}

export default async function FAQs({ params }: Props) {
  const { lang } = await params;

  const faqs = [
      {
          category: "Report Related FAQs",
          items: [
              { q: "I’m visiting this website for the first time. How can I trust your service quality?", a: "We encourage you to explore our website to review the depth and relevance of our content. You may also contact our sales team at sales@thebrainyinsights.com to request free sample copies of reports you are interested in and schedule a product review call with our analysts." },
              { q: "Are samples available for all studies published by The Brainy Insights?", a: "Yes. Upon receiving your inquiry, our sales team will share a sample copy of the requested study. For upcoming reports, a demo sample is provided. These samples offer an overview of the report structure, methodology, and representative market insights to help validate data quality prior to purchase." },
              { q: "What should I do if I have additional questions or customization requirements?", a: "Our syndicated studies are designed to serve a broad audience. However, if you require specific customizations or have additional queries, please submit your request via the inquiry form available alongside the report description page or email us at sales@thebrainyinsights.com." },
              { q: "How do I ensure my requirements are clearly understood by the research team?", a: "Your customization request—shared via email or discussion with our team—is forwarded to our research analysts. After assessing feasibility, the team designs a client-centric study aligned with your objectives. A follow-up call may also be scheduled to discuss requirements and propose optimal solutions." },
              { q: "What is the pricing and delivery timeline for a customized report?", a: "Pricing and timelines are communicated by our sales representative after finalizing the scope and deliverables. The Brainy Insights offers up to 10% free customization on all reports. Please contact our sales team for further details." },
              { q: "How frequently does The Brainy Insights update its studies?", a: "Reports are typically updated every 6 to 12 months, depending on market dynamics and demand. For the latest update status of any report, please reach out to our sales team." },
              { q: "What if the report I’m looking for is not listed in your catalogue?", a: "The Brainy Insights maintains an extensive internal database of market intelligence and industry updates, not all of which are listed publicly. If you cannot find a specific study, please contact our sales team to schedule an analyst discussion or submit your requirements." },
              { q: "What pre-purchase services do you offer?", a: "At The Brainy Insights, we focus on delivering targeted, client-centric research. Our pre-sale offerings include: Free product review call with the report author or analyst, Customized research support for due diligence, Targeted purchase options to maximize value." },
              { q: "What formats are reports delivered in?", a: "Reports are delivered in PDF and spreadsheet formats. Presentation (PPT) formats can also be provided upon special request." },
              { q: "Are discounts available?", a: "We support students, academicians, NGOs, startups, and early-stage businesses through special pricing and flexible payment options. Please contact our sales team at sales@thebrainyinsights.com to learn more." },
          ]
      },
      {
          category: "Ordering and Delivery",
          items: [
              { q: "How can I purchase a report?", a: "A “Buy Now” option is available on the right side of each report description page. Purchase Process: Select the desired report, Complete payment via online checkout or wire transfer, Receive the invoice (purchase contract required for wire transfers), Report dispatched within 2–48 hours." },
              { q: "How soon will I receive the report?", a: "Reports are delivered within 2 to 48 hours after payment confirmation. Delays may occur due to time zone differences. Orders placed on weekends or holidays are processed on the next business day." },
              { q: "How will I receive the report?", a: "The report will be sent electronically to your registered email address. To ensure smooth delivery, please whitelist @thebrainyinsights.com and mark our emails as “Not Spam” if needed." },
              { q: "What ordering methods are available?", a: "Authorized buyers may place orders through Email Ordering: Send requirements, billing details, delivery address, and preferred payment method to sales@thebrainyinsights.com. Our team will respond within one business day." },
          ]
      },
      {
          category: "License Type and Purchase Options",
          items: [
              { q: "What do single-user, multi-user, and enterprise licenses mean?", a: "Licenses define report access and distribution rights: Single User License: Access for one individual only. Multi User License: Access for 2–5 users within the same organization. Enterprise License: Company-wide access, including subsidiaries or group entities." },
              { q: "Can I purchase individual chapters or segments?", a: "We generally do not sell individual chapters, as this may compromise the holistic understanding of the market. However, in select cases, specific sections may be provided based on requirements. Please contact our sales team for details." },
          ]
      },
      {
          category: "Payments and Invoicing",
          items: [
              { q: "What payment methods are accepted?", a: "We accept major credit cards for online payments. Alternate arrangements such as bank wire transfers or invoicing can be made by contacting our sales team." },
              { q: "Is the online payment process secure?", a: "Yes. Payment security is a top priority. All transactions are processed through trusted payment gateways, and we do not store any card or payment details." },
              { q: "Will I receive an invoice?", a: "An electronic invoice is sent immediately after purchase. Pro-forma invoices are also available upon request to assist with internal approvals." },
              { q: "What are the payment terms?", a: "All payments are non-refundable, in line with industry standards. As reports are based on knowledge transfer, refunds cannot be issued once content has been accessed. To avoid discrepancies, we provide extensive pre-purchase support." },
              { q: "I’m facing issues while making a payment. What should I do?", a: "Payment issues are uncommon but may occur due to billing address mismatches or bank verification errors. If the problem persists, please contact our sales team for immediate assistance." },
              { q: "Why am I seeing a “Payment Declined” message?", a: "This may occur due to: Billing address mismatch, Insufficient card limit, Bank-initiated security blocks for high-value transactions. Please contact your bank to authorize the transaction or update your billing details." },
          ]
      },
      {
          category: "Post-Sale Queries",
          items: [
              { q: "Can I speak with the analyst after purchasing a report?", a: "Yes. Every purchase includes 30 minutes of complimentary analyst access to address report-related questions and provide expert insights." },
              { q: "The report doesn’t fully meet my needs. How can The Brainy Insights help?", a: "While our reports are comprehensive, specific needs may vary. We recommend sharing customization requirements prior to purchase. If additional needs arise post-purchase, you may request post-sale customization." },
              { q: "Is post-sale customization chargeable?", a: "We offer up to 10% free customization on syndicated reports. Additional customization, if required, will be evaluated by our research team and quoted with timelines accordingly." },
          ]
      }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-600">Find answers to common questions about our services and processes.</p>
        </div>
        
        <div className="space-y-12">
            {faqs.map((category, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
                        <h2 className="text-xl font-bold text-indigo-900">{category.category}</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {category.items.map((item, i) => (
                            <div key={i} className="p-6 hover:bg-gray-50 transition-colors">
                                <h3 className="font-semibold text-gray-900 mb-2 flex gap-3">
                                    <span className="text-indigo-600 font-bold">{i + 1}.</span>
                                    {item.q}
                                </h3>
                                <p className="text-gray-600 leading-relaxed pl-7">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-12 text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
            <p className="text-gray-600 mb-6">Can’t find the answer you’re looking for? Please chat to our friendly team.</p>
            <a href={`/${lang}/contact`} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
                Contact Us
            </a>
        </div>
      </div>
    </div>
  );
}
