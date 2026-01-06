'use client';

import { useState } from 'react';
import { 
  CreditCardIcon, 
  ArrowDownTrayIcon, 
  DocumentTextIcon, 
  PhoneIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  XMarkIcon,
  CheckCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'ccavenue'>('paypal');

  const openModal = (type: string) => {
    setRequestType(type);
    setIsModalOpen(true);
    setSubmitStatus('idle');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
        if (submitStatus === 'success') {
            setSubmitStatus('idle');
            setFormData({ name: '', email: '', phone: '', company: '', description: '' });
        }
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/customization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: reportDbId, // Use DB ID for relation
          reportTitle,
          requestType,
          ...formData
        })
      });

      if (res.ok) {
        setSubmitStatus('success');
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // PayPal Handlers
  const createOrder = async () => {
    // Validate form data slightly if needed, though PayPal handles a lot.
    // We strictly need user email for our DB.
    if (!formData.email) {
        alert("Please enter your email address first.");
        return ""; // Cancel
    }

    try {
        const response = await fetch('/api/orders/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reportId: reportDbId, // Pass the UUID here
                licenseType,
                userEmail: formData.email,
                userName: formData.name
            })
        });
        const orderData = await response.json();
        
        if (orderData.error) {
            console.error("Error creating order:", orderData.error);
            alert("Could not initiate payment. Please try again.");
            return "";
        }
        
        return orderData.orderID;
    } catch (err) {
        console.error("Payment Error:", err);
        return "";
    }
  };

  const onApprove = async (data: any) => {
      try {
          const response = await fetch('/api/orders/capture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderID: data.orderID
            })
        });
        const details = await response.json();
        
        if (details.status === 'COMPLETED') {
            setSubmitStatus('success');
            // We reuse the success state of the modal but maybe we want a specific message for payment
        } else {
            alert("Payment not completed. Please contact support.");
        }
      } catch (err) {
          console.error("Capture Error:", err);
          alert("Error finalizing payment. Please contact support.");
      }
  };

  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test", // Fallback to avoid crash if env missing
    currency: prices.currency || "USD",
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
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
              onClick={() => openModal('Purchase Report')}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={closeModal}></div>
          
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto transform rounded-2xl bg-white p-8 text-left shadow-2xl transition-all sm:w-full border border-gray-100 flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="absolute right-6 top-6 z-10">
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XMarkIcon className="h-7 w-7" />
              </button>
            </div>

            {submitStatus === 'success' ? (
                <div className="py-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                        <CheckCircleIcon className="h-12 w-12 text-green-600" aria-hidden="true" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                    <p className="text-gray-600 mb-8 px-4">
                        {requestType === 'Purchase Report' 
                           ? `Your payment for "${reportTitle}" was successful. You will receive a confirmation email shortly.`
                           : `Your request for ${requestType} has been submitted. Our team will reach out to you soon.`
                        }
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <button
                          onClick={closeModal}
                          className="w-full inline-flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                        >
                          Continue Reading Report
                        </button>
                        <button
                          onClick={() => router.push('/reports')}
                          className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          Browse More Reports
                        </button>
                    </div>
                </div>
            ) : (
                requestType === 'Purchase Report' ? (
                  /* PURCHASE FLOW */
                  <div className="space-y-6">
                     <div className="border-b pb-4">
                        <h3 className="text-2xl font-bold text-gray-900">{labels.secureCheckout || 'Secure Checkout'}</h3>
                        <p className="text-sm text-gray-500 mt-1">Complete your purchase securely.</p>
                     </div>

                     <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-1">
                        <p className="text-sm text-gray-500 font-medium uppercase text-xs">{labels.orderSummary || 'Order Summary'}</p>
                        <p className="font-semibold text-gray-900 line-clamp-1">{reportTitle}</p>
                        <div className="flex justify-between items-center mt-2">
                           <span className="text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded text-sm capitalize">
                             {licenseType.replace(/([A-Z])/g, ' $1').trim()} License
                           </span>
                           <span className="text-xl font-bold text-gray-900">${selectedPrice?.toLocaleString()}</span>
                        </div>
                     </div>
                     
                     {/* Contact Info Form - needed for order */}
                     <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-900 uppercase">1. {labels.contactInformation || 'Contact Information'}</h4>
                        <div className="grid grid-cols-2 gap-3">
                             <input
                                type="text"
                                name="name"
                                placeholder={labels.fullName || "Full Name"}
                                value={formData.name}
                                onChange={handleInputChange}
                                className="col-span-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5"
                             />
                             <input
                                type="email"
                                name="email"
                                placeholder={(labels.emailAddress || "Email Address") + " *"}
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`col-span-1 w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5 ${!formData.email && 'border-red-300'}`}
                             />
                             <input
                                type="text"
                                name="company"
                                placeholder={labels.companyOptional || "Company (Optional)"}
                                value={formData.company}
                                onChange={handleInputChange}
                                className="col-span-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5"
                             />
                        </div>
                     </div>

                     <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-900 uppercase">2. {labels.paymentMethod || 'Payment Method'}</h4>
                        <div className="flex gap-3">
                            <div 
                                onClick={() => setPaymentMethod('paypal')}
                                className={`flex-1 border rounded-lg p-3 cursor-pointer flex items-center justify-center gap-2 transition-all ${paymentMethod === 'paypal' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'hover:border-gray-300'}`}
                            >
                                <span className="font-semibold text-gray-700">PayPal</span>
                            </div>
                            <div 
                                onClick={() => setPaymentMethod('ccavenue')}
                                className={`flex-1 border rounded-lg p-3 cursor-pointer flex items-center justify-center gap-2 transition-all ${paymentMethod === 'ccavenue' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'hover:border-gray-300'}`}
                            >
                                <span className="font-semibold text-gray-700">{labels.creditDebitCard || 'Credit/Debit Card'}</span>
                            </div>
                        </div>
                     </div>

                     <div className="pt-2">
                        {paymentMethod === 'paypal' ? (
                            <div className={`transition-opacity ${!formData.email ? 'opacity-50 pointer-events-none' : ''}`}>
                                {!formData.email && <p className="text-xs text-red-500 mb-2 text-center">Please enter your email to proceed</p>}
                                <PayPalButtons 
                                    style={{ layout: "vertical", shape: "rect" }}
                                    createOrder={createOrder}
                                    onApprove={onApprove}
                                    forceReRender={[selectedPrice, licenseType, formData.email]}
                                />
                            </div>
                        ) : (
                            <div className="text-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500 text-sm mb-3">Secure Credit/Debit Card payment via CCAvenue.</p>
                                <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-md hover:bg-indigo-700 transition-colors" disabled>
                                    {labels.proceedToPaymentSoon || 'Proceed to Payment (Coming Soon)'}
                                </button>
                            </div>
                        )}
                     </div>
                     
                     <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <ShieldCheckIcon className="h-4 w-4" />
                        <span>{labels.secureSslPayment || '256-bit SSL Secure Payment'}</span>
                     </div>
                  </div>
                ) : (
                  /* OTHER FORMS (Customization, Sample, etc) */
                  <>
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">{requestType}</h3>
                        <p className="text-sm text-indigo-600 font-medium mt-1">{labels.reportPrefix || 'Report:'} {reportTitle}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{labels.fullName || 'Full Name'}</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="John Doe"
                                    className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-3 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="company" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{labels.companyName || 'Company Name'}</label>
                                <input
                                    type="text"
                                    id="company"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    placeholder="Acme Inc."
                                    className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-3 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{labels.emailAddress || 'Email Address'} <span className="text-red-500">*</span></label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="john@example.com"
                                className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-3 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{labels.phoneNumber || 'Phone Number'}</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="+1 (555) 000-0000"
                                className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-3 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{labels.specificRequirements || 'Specific Requirements'}</label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                value={formData.description}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-3 outline-none transition-all"
                                placeholder="Please describe your requirements..."
                            ></textarea>
                        </div>

                        {submitStatus === 'error' && (
                            <p className="text-red-600 text-sm font-medium">Failed to submit request. Please try again.</p>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                  </>
                )
            )}
          </div>
        </div>
      )}
    </PayPalScriptProvider>
  );
}