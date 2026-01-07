'use client';

import { useState } from 'react';
import { 
  CreditCardIcon, 
  ArrowDownTrayIcon, 
  DocumentTextIcon, 
  PhoneIcon, 
  CalendarIcon, 
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ReportSidebarProps {
  prices: {
    singleUser: number | null;
    multiUser: number | null;
    corporate: number | null;
    currency: string;
  };
  labels: any;
  reportId?: string;
  reportDbId?: string;
  reportTitle?: string;
  lang: string;
}

export default function ReportSidebar({ prices, labels, reportId, reportDbId, reportTitle, lang }: ReportSidebarProps) {
  const [licenseType, setLicenseType] = useState<'singleUser' | 'multiUser' | 'corporate'>('singleUser');
  const selectedPrice = prices[licenseType];
  const router = useRouter();

  return (
      <div className="w-80 sticky top-[58px] space-y-6">
        {/* License Card */}
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border bg-white shadow-sm">
          <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 !pt-4 !pb-2 border-b border-gray-100">
            <h4 className="text-lg font-semibold">Choose Your License</h4>
          </div>
          <div className="px-3 [&:last-child]:pb-6 !pt-2 !pb-4 space-y-3">
            <div className="grid gap-2 space-y-2">
              
              {/* Single User */}
              <div 
                className={`flex items-center space-x-3 p-2 border rounded-lg hover:border-indigo-500 transition-colors cursor-pointer ${licenseType === 'singleUser' ? 'bg-indigo-50/50 border-indigo-500' : 'border-gray-200'}`}
                onClick={() => setLicenseType('singleUser')}
              >
                <div className={`aspect-square h-4 w-4 rounded-full border flex items-center justify-center ${licenseType === 'singleUser' ? 'border-indigo-600 text-indigo-600' : 'border-gray-300'}`}>
                  {licenseType === 'singleUser' && <div className="h-2 w-2 rounded-full bg-current" />}
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <strong className="font-medium text-sm text-gray-900">{labels.singleUser || 'Single User'}</strong>
                  <span className="text-lg font-bold text-indigo-600">${prices.singleUser?.toLocaleString()}</span>
                </div>
              </div>

              {/* Multi User */}
              <div 
                className={`flex items-center space-x-3 p-2 border rounded-lg hover:border-indigo-500 transition-colors cursor-pointer ${licenseType === 'multiUser' ? 'bg-indigo-50/50 border-indigo-500' : 'border-gray-200'}`}
                onClick={() => setLicenseType('multiUser')}
              >
                <div className={`aspect-square h-4 w-4 rounded-full border flex items-center justify-center ${licenseType === 'multiUser' ? 'border-indigo-600 text-indigo-600' : 'border-gray-300'}`}>
                  {licenseType === 'multiUser' && <div className="h-2 w-2 rounded-full bg-current" />}
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <strong className="font-medium text-sm text-gray-900">{labels.multiUser || 'Multi-User'}</strong>
                    <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-medium w-fit whitespace-nowrap border-transparent bg-indigo-100 text-indigo-800 text-xs">{labels.mostPopular || 'Most Popular'}</span>
                  </div>
                  <span className="text-lg font-bold text-indigo-600">${prices.multiUser?.toLocaleString()}</span>
                </div>
              </div>

              {/* Corporate */}
              <div 
                className={`flex items-center space-x-3 p-2 border rounded-lg hover:border-indigo-500 transition-colors cursor-pointer ${licenseType === 'corporate' ? 'bg-indigo-50/50 border-indigo-500' : 'border-gray-200'}`}
                onClick={() => setLicenseType('corporate')}
              >
                <div className={`aspect-square h-4 w-4 rounded-full border flex items-center justify-center ${licenseType === 'corporate' ? 'border-indigo-600 text-indigo-600' : 'border-gray-300'}`}>
                  {licenseType === 'corporate' && <div className="h-2 w-2 rounded-full bg-current" />}
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <strong className="font-medium text-sm text-gray-900">{labels.corporate || 'Corporate'}</strong>
                  <span className="text-lg font-bold text-indigo-600">${prices.corporate?.toLocaleString()}</span>
                </div>
              </div>

            </div>

            <button 
              onClick={() => router.push(`/${lang}/buy-now/${reportId}/${licenseType}`)}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 h-9 px-4 w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold shadow-lg hover:shadow-xl transition-all text-lg py-6"
            >
              Buy Now - ${selectedPrice?.toLocaleString()}
            </button>

            <div className="flex items-center justify-center gap-2 pt-3">
              <CreditCardIcon className="h-3 w-3 text-gray-400" />
              <div className="text-xs text-gray-400">Visa, Mastercard, PayPal</div>
            </div>
          </div>
        </div>

        {/* Action Buttons Card */}
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border bg-white shadow-sm">
          <div className="px-3 [&:last-child]:pb-6 !pt-4 !pb-4 space-y-2">
            <Link 
              href={`/${lang}/enquiry/request-sample/${reportId}`}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 w-full justify-start bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm h-9 transition-all"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              {labels.requestSample || 'Request Sample PDF'}
            </Link>
            <Link 
              href={`/${lang}/enquiry/request-customization/${reportId}`}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 w-full justify-start bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm h-9 transition-all"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              {labels.requestCustomization || 'Request Customization'}
            </Link>
            <Link 
              href={`/${lang}/enquiry/talk-to-analyst/${reportId}`}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 w-full justify-start bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm h-9 transition-all"
            >
              <PhoneIcon className="h-4 w-4 mr-2" />
              {labels.talkToAnalyst || 'Talk to Analyst'}
            </Link>
            <Link 
              href={`/${lang}/enquiry/schedule-consultation/${reportId}`}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 w-full justify-start bg-green-600 hover:bg-green-700 text-white font-medium text-sm h-9 transition-all"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              {labels.scheduleConsultation || 'Schedule Consultation'}
            </Link>
            <Link 
              href={`/${lang}/enquiry/custom-pricing/${reportId}`}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 w-full justify-start bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm h-9 transition-all"
            >
              <CurrencyDollarIcon className="h-4 w-4 mr-2" />
              {labels.customPricing || 'Custom Pricing'}
            </Link>
          </div>
        </div>
      </div>
  );
}
