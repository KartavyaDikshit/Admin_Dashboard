
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import BuyNowForm from '@/components/new_ui/BuyNowForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Metadata } from 'next';

interface Props {
  params: Promise<{
    lang: string;
    reportId: string;
    licenseType: string;
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function BuyNowPage({ params }: Props) {
  const { lang, reportId, licenseType } = await params;

  // Fetch report by Friendly ID (or UUID fallback)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reportId);
  const whereCondition: any = {
    OR: [
      { reportId: reportId },
      { reportId: { endsWith: reportId } } 
    ]
  };
  if (isUuid) whereCondition.OR.push({ id: reportId });

  const report = await prisma.report.findFirst({
    where: whereCondition,
    select: {
      id: true,
      reportId: true,
      title: true,
      slug: true,
      singlePrice: true,
      multiPrice: true,
      corporatePrice: true,
      enterprisePrice: true,
      currency: true,
    }
  });

  if (!report) {
    notFound();
  }

  const validLicenses = ['single', 'multiple', 'corporate', 'enterprise'];
  let normalizedLicense = 'single';
  const lowerLicenseType = licenseType.toLowerCase();

  if (lowerLicenseType.includes('multi') || lowerLicenseType.includes('multiple')) {
    normalizedLicense = 'multiple';
  } else if (lowerLicenseType.includes('corporate')) {
    normalizedLicense = 'corporate';
  } else if (lowerLicenseType.includes('enterprise')) {
    normalizedLicense = 'enterprise';
  } else {
    normalizedLicense = 'single';
  }
  
  // Map normalized license to DB price field and display name
  let price: number | null = null;
  let licenseName = '';

  switch (normalizedLicense) {
      case 'multiple':
          price = report.multiPrice ? Number(report.multiPrice) : null;
          licenseName = 'Multi-User License';
          break;
      case 'corporate':
          price = report.corporatePrice ? Number(report.corporatePrice) : null;
          licenseName = 'Corporate License';
          break;
      case 'enterprise':
          price = report.enterprisePrice ? Number(report.enterprisePrice) : null;
          licenseName = 'Enterprise License';
          break;
      case 'single':
      default:
          price = report.singlePrice ? Number(report.singlePrice) : null;
          licenseName = 'Single User License';
          break;
  }

  if (!price) {
      // Fallback or error if price not available
       price = 0; 
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href={`/${lang}/reports/${report.slug}`} className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6 font-medium transition-colors">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Report
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
           <div className="bg-indigo-600 px-8 py-6 text-white">
              <h1 className="text-2xl font-bold">Secure Checkout</h1>
              <p className="opacity-90 mt-1">Complete your purchase for instant access.</p>
           </div>
           
           <div className="p-8">
              <div className="bg-indigo-50 rounded-lg p-4 mb-8 border border-indigo-100">
                  <h2 className="font-bold text-gray-900 mb-1">{report.title}</h2>
                  <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-medium text-indigo-800 bg-indigo-200/50 px-3 py-1 rounded-full">
                          {licenseName}
                      </span>
                      <span className="text-2xl font-bold text-indigo-700">
                          {report.currency} {price.toLocaleString()}
                      </span>
                  </div>
              </div>

              <BuyNowForm 
                 reportDbId={report.id}
                 reportTitle={report.title}
                 reportFriendlyId={report.reportId || report.id}
                 price={price}
                 currency={report.currency}
                 licenseType={normalizedLicense}
                 lang={lang}
              />
           </div>
        </div>
      </div>
    </div>
  );
}
