'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ReportSidebarProps {
  prices: {
    singleUser: number | null;
    multiUser: number | null;
    corporate: number | null;
    currency: string;
  };
  labels: {
    chooseLicense: string;
    singleUser: string;
    multiUser: string;
    corporate: string;
    mostPopular: string;
    buyNow: string;
    securePayment: string;
    requestSample: string;
    requestCustomization: string;
    talkToAnalyst: string;
    scheduleConsultation: string;
    customPricing: string;
  };
}

type LicenseType = 'single' | 'multi' | 'corporate';

export default function ReportSidebar({ prices, labels }: ReportSidebarProps) {
  const [selectedLicense, setSelectedLicense] = useState<LicenseType>('multi');

  const getPrice = (type: LicenseType) => {
    switch (type) {
      case 'single': return prices.singleUser;
      case 'multi': return prices.multiUser;
      case 'corporate': return prices.corporate;
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'Contact us';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: prices.currency }).format(price);
  };

  return (
    <div className="space-y-3 sticky top-24 z-10 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
      {/* Purchase Box */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden flex-shrink-0">
        <div className="bg-indigo-900 text-white p-3 text-center">
          <h3 className="text-base font-bold uppercase tracking-wider">{labels.chooseLicense}</h3>
        </div>
        
        <div className="p-4 space-y-2">
          {/* Single User */}
          <label 
            className={cn(
              "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all",
              selectedLicense === 'single' 
                ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600" 
                : "border-gray-200 hover:border-indigo-300"
            )}
            onClick={() => setSelectedLicense('single')}
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center", selectedLicense === 'single' ? "border-indigo-600" : "border-gray-400")}>
                {selectedLicense === 'single' && <div className="w-2 h-2 bg-indigo-600 rounded-full" />}
              </div>
              <span className="font-medium text-sm text-gray-900">{labels.singleUser}</span>
            </div>
            <span className="font-bold text-sm text-gray-900">{formatPrice(prices.singleUser)}</span>
          </label>

          {/* Multi User */}
          <label 
            className={cn(
              "relative flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all mt-3",
              selectedLicense === 'multi' 
                ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600" 
                : "border-gray-200 hover:border-indigo-300"
            )}
            onClick={() => setSelectedLicense('multi')}
          >
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm">
              {labels.mostPopular}
            </div>
            <div className="flex items-center gap-3">
              <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center", selectedLicense === 'multi' ? "border-indigo-600" : "border-gray-400")}>
                {selectedLicense === 'multi' && <div className="w-2 h-2 bg-indigo-600 rounded-full" />}
              </div>
              <span className="font-medium text-sm text-gray-900">{labels.multiUser}</span>
            </div>
            <span className="font-bold text-sm text-gray-900">{formatPrice(prices.multiUser)}</span>
          </label>

          {/* Corporate */}
          <label 
            className={cn(
              "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all",
              selectedLicense === 'corporate' 
                ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600" 
                : "border-gray-200 hover:border-indigo-300"
            )}
            onClick={() => setSelectedLicense('corporate')}
          >
             <div className="flex items-center gap-3">
              <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center", selectedLicense === 'corporate' ? "border-indigo-600" : "border-gray-400")}>
                {selectedLicense === 'corporate' && <div className="w-2 h-2 bg-indigo-600 rounded-full" />}
              </div>
              <span className="font-medium text-sm text-gray-900">{labels.corporate}</span>
            </div>
            <span className="font-bold text-sm text-gray-900">{formatPrice(prices.corporate)}</span>
          </label>

          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg shadow-md transition-colors text-base mt-2">
            {labels.buyNow}
          </button>
          
          <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 mt-1">
            <span className="flex items-center gap-1">
               🔒 {labels.securePayment}
            </span>
          </div>
        </div>
      </div>

      {/* Actions Box */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden p-2">
         <div className="grid grid-cols-1 gap-1">
            <button className="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors group text-left">
               <span>{labels.requestSample}</span>
               <span className="text-indigo-600 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors group text-left">
               <span>{labels.requestCustomization}</span>
               <span className="text-indigo-600 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors group text-left">
               <span>{labels.talkToAnalyst}</span>
               <span className="text-indigo-600 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors group text-left">
               <span>{labels.scheduleConsultation}</span>
               <span className="text-indigo-600 group-hover:translate-x-1 transition-transform">→</span>
            </button>
             <button className="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors group text-left">
               <span>{labels.customPricing}</span>
               <span className="text-indigo-600 group-hover:translate-x-1 transition-transform">→</span>
            </button>
         </div>
      </div>
    </div>
  );
}
