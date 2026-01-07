'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'ccavenue'>('paypal');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createOrder = async () => {
    if (!formData.email) {
        toast.error("Please enter your email address first.");
        return "";
    }

    try {
        const response = await fetch('/api/orders/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reportId: reportDbId,
                licenseType: licenseType.toUpperCase(), // Enum format
                userEmail: formData.email,
                userName: formData.name,
                userPhone: formData.phone,
                userCompany: formData.company
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

  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
    currency: currency || "USD",
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
       <div className="space-y-8">
         {/* Contact Info Form */}
         <div className="space-y-4">
            <h4 className="text-lg font-bold text-gray-900 border-b pb-2">1. Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-3"
                        placeholder="+1 (555) 000-0000"
                    />
                 </div>
                 
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
            <div className="flex gap-4">
                <div 
                    onClick={() => setPaymentMethod('paypal')}
                    className={`flex-1 border-2 rounded-xl p-4 cursor-pointer flex items-center justify-center gap-2 transition-all ${paymentMethod === 'paypal' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                >
                    <span className="font-bold text-gray-800">PayPal</span>
                </div>
                <div 
                    onClick={() => setPaymentMethod('ccavenue')}
                    className={`flex-1 border-2 rounded-xl p-4 cursor-pointer flex items-center justify-center gap-2 transition-all ${paymentMethod === 'ccavenue' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                >
                    <span className="font-bold text-gray-800">Credit / Debit Card</span>
                </div>
            </div>
         </div>

         <div className="pt-2">
            {paymentMethod === 'paypal' ? (
                <div className={`transition-opacity ${!formData.email ? 'opacity-50 pointer-events-none' : ''}`}>
                    {!formData.email && <p className="text-sm text-amber-600 mb-3 text-center bg-amber-50 p-2 rounded border border-amber-200">Please enter your email above to proceed with payment</p>}
                    <PayPalButtons 
                        style={{ layout: "vertical", shape: "rect", height: 48 }}
                        createOrder={createOrder}
                        onApprove={onApprove}
                        forceReRender={[price, licenseType, formData.email]}
                    />
                </div>
            ) : (
                <div className="text-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 font-medium mb-4">Secure Credit/Debit Card payment gateway.</p>
                    <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg" disabled>
                        Proceed to Payment (Coming Soon)
                    </button>
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
