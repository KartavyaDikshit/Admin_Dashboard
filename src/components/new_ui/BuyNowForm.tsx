'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { ShieldCheckIcon, BuildingLibraryIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { countries } from '@/lib/countries';

interface BuyNowFormProps {
  reportDbId: string;
  reportTitle: string;
  reportFriendlyId: string;
  price: number;
  currency: string;
  licenseType: string;
  lang: string;
}

export default function BuyNowForm({ reportDbId, reportTitle, reportFriendlyId, price, currency, licenseType, lang }: BuyNowFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    country: '',
    phoneCode: '+1'
  });
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'ccavenue' | 'wire'>('paypal');
  const [ccAvenueData, setCcAvenueData] = useState<{ encRequest: string, access_code: string, merchant_id: string, url: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      // Auto-detect country
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
            if (data.country_name) {
                const foundCountry = countries.find(c => c.name.toLowerCase() === data.country_name.toLowerCase() || c.code === data.country_code);
                if (foundCountry) {
                    setFormData(prev => ({ 
                        ...prev, 
                        country: foundCountry.name,
                        phoneCode: foundCountry.dialCode
                    }));
                } else {
                    setFormData(prev => ({ ...prev, country: data.country_name }));
                }
            }
        })
        .catch(err => console.error("Error fetching country:", err));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'country') {
        const selectedCountry = countries.find(c => c.name === value);
        setFormData(prev => ({
            ...prev,
            country: value,
            phoneCode: selectedCountry ? selectedCountry.dialCode : prev.phoneCode
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const createOrder = async () => {
    if (!formData.email) {
        toast.error("Please enter your email address first.");
        return "";
    }

    try {
        const fullPhone = `${formData.phoneCode} ${formData.phone}`;
        const response = await fetch('/api/orders/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reportId: reportDbId,
                licenseType: licenseType.toUpperCase(),
                userEmail: formData.email,
                userName: formData.name,
                userPhone: fullPhone,
                userCompany: formData.company,
                userCountry: formData.country
            })
        });
        const orderData = await response.json();
        
        if (orderData.error) {
            console.error("Error creating order:", orderData.error);
            toast.error("Could not initiate payment. Please try again.");
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
            toast.success("Payment Successful!");
            router.push(`/${lang}/thank-you/purchase/${reportFriendlyId}`);
        } else {
            toast.error("Payment not completed. Please contact support.");
        }
      } catch (err) {
          console.error("Capture Error:", err);
          toast.error("Error finalizing payment. Please contact support.");
      }
  };

  const initiateCCAvenuePayment = async () => {
    if (!formData.email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `${formData.phoneCode} ${formData.phone}`;
      const response = await fetch('/api/orders/ccavenue/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: reportDbId,
          licenseType: licenseType.toUpperCase(),
          userEmail: formData.email,
          userName: formData.name,
          userPhone: fullPhone,
          userCompany: formData.company,
          userCountry: formData.country
        })
      });

      const data = await response.json();

      if (data.error) {
        toast.error("Failed to initiate payment: " + data.error);
        setLoading(false);
        return;
      }

      setCcAvenueData({
        encRequest: data.encRequest,
        access_code: data.access_code,
        merchant_id: data.merchant_id,
        url: data.url
      });

      // Give state a moment to update then submit
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.submit();
        }
      }, 100);

    } catch (err) {
      console.error("CC Avenue Error:", err);
      toast.error("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleWireTransfer = async () => {
      if (!formData.email) {
          toast.error("Please enter your email address.");
          return;
      }

      setLoading(true);
      try {
          const fullPhone = `${formData.phoneCode} ${formData.phone}`;
          const response = await fetch('/api/orders/wire-transfer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  reportId: reportDbId,
                  licenseType: licenseType,
                  userEmail: formData.email,
                  userName: formData.name,
                  userPhone: fullPhone,
                  userCompany: formData.company,
                  userCountry: formData.country
              })
          });

          const data = await response.json();

          if (data.success) {
              router.push(`/${lang}/thank-you/wire-transfer/${reportFriendlyId}`);
          } else {
              toast.error(data.error || "Failed to process wire transfer request.");
          }
      } catch (err) {
          console.error("Wire Transfer Error:", err);
          toast.error("An error occurred. Please try again.");
      } finally {
          setLoading(false);
      }
  };

  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
    currency: currency || "USD",
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
       <div className="space-y-8">
         {/* Hidden Form for CC Avenue */}
         {ccAvenueData && (
           <form ref={formRef} method="post" action={ccAvenueData.url} className="hidden">
             <input type="hidden" name="encRequest" value={ccAvenueData.encRequest} />
             <input type="hidden" name="access_code" value={ccAvenueData.access_code} />
             <input type="hidden" name="merchant_id" value={ccAvenueData.merchant_id} />
           </form>
         )}

         {/* Contact Info Form */}
         <div className="space-y-4">
            <h4 className="text-lg font-bold text-gray-900 border-b pb-2">1. Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Row 1: Full Name and Email */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-3"
                        placeholder="John Doe"
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-3 ${!formData.email && 'border-indigo-200'}`}
                        placeholder="john@example.com"
                    />
                 </div>

                 {/* Row 2: Country Dropdown and Phone */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-3 bg-white"
                    >
                        <option value="">Select Country</option>
                        {countries.map((c) => (
                            <option key={c.code} value={c.name}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="flex">
                        <div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
                            {formData.phoneCode}
                        </div>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-r-lg border-l-0 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="123-456-7890"
                        />
                    </div>
                 </div>
                 
                 {/* Row 3: Company */}
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company (Optional)</label>
                    <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-3"
                        placeholder="Acme Inc."
                    />
                 </div>
            </div>
         </div>

         <div className="space-y-4">
            <h4 className="text-lg font-bold text-gray-900 border-b pb-2">2. Payment Method</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                    onClick={() => setPaymentMethod('paypal')}
                    className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all h-24 ${paymentMethod === 'paypal' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                >
                    <span className="font-bold text-gray-800 text-center">PayPal</span>
                </div>
                <div 
                    onClick={() => setPaymentMethod('ccavenue')}
                    className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all h-24 ${paymentMethod === 'ccavenue' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                >
                    <CreditCardIcon className="h-6 w-6 text-gray-700"/>
                    <span className="font-bold text-gray-800 text-center text-sm">Credit / Debit Card</span>
                </div>
                <div 
                    onClick={() => setPaymentMethod('wire')}
                    className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all h-24 ${paymentMethod === 'wire' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                >
                    <BuildingLibraryIcon className="h-6 w-6 text-gray-700"/>
                    <span className="font-bold text-gray-800 text-center text-sm">Wire Transfer</span>
                </div>
            </div>
         </div>

         <div className="pt-2">
            {paymentMethod === 'paypal' && (
                <div className={`transition-opacity ${!formData.email ? 'opacity-50 pointer-events-none' : ''}`}>
                    {!formData.email && <p className="text-sm text-amber-600 mb-3 text-center bg-amber-50 p-2 rounded border border-amber-200">Please enter your email above to proceed with payment</p>}
                    <PayPalButtons 
                        style={{ layout: "vertical", shape: "rect", height: 48 }}
                        createOrder={createOrder}
                        onApprove={onApprove}
                        onCancel={() => {
                            toast.error("Payment cancelled.");
                            router.push(`/${lang}/order-failed?reason=cancelled`);
                        }}
                        forceReRender={[price, licenseType]}
                    />
                </div>
            )}

            {paymentMethod === 'ccavenue' && (
                <div className="text-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 font-medium mb-4">Secure Credit/Debit Card payment gateway.</p>
                    <button 
                      onClick={initiateCCAvenuePayment}
                      disabled={loading || !formData.email}
                      className="w-full bg-indigo-600 text-white font-bold py-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Proceed to Payment'}
                    </button>
                    {!formData.email && <p className="text-sm text-red-500 mt-2">Email is required</p>}
                </div>
            )}

            {paymentMethod === 'wire' && (
                <div className="text-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 font-medium mb-4">You will receive an invoice with bank details via email.</p>
                    <button 
                      onClick={handleWireTransfer}
                      disabled={loading || !formData.email}
                      className="w-full bg-slate-800 text-white font-bold py-4 rounded-lg hover:bg-slate-900 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <BuildingLibraryIcon className="h-5 w-5"/>
                      {loading ? 'Processing...' : 'Request Wire Transfer'}
                    </button>
                    {!formData.email && <p className="text-sm text-red-500 mt-2">Email is required</p>}
                </div>
            )}
         </div>
         
         <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <ShieldCheckIcon className="h-5 w-5 text-green-600" />
            <span>Guaranteed Safe & Secure Checkout with 256-bit SSL Encryption</span>
         </div>
      </div>
    </PayPalScriptProvider>
  );
}
