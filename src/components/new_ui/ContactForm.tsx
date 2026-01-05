'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface ContactFormProps {
  dict?: any;
}

export default function ContactForm({ dict = {} }: ContactFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: '',
    phone: '',
    company: '',
    designation: '',
    description: ''
  });
  const [countryCode, setCountryCode] = useState('+00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const COUNTRY_CODES: Record<string, string> = {
    'US': '+1',
    'UK': '+44',
    'CA': '+1',
    'AU': '+61',
    'DE': '+49',
    'FR': '+33',
    'IN': '+91',
    'JP': '+81',
    'CN': '+86',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    
    if (id === 'country') {
        const code = COUNTRY_CODES[value] || '+00';
        setCountryCode(code);
    }

    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.loading(dict.submitting || 'Submitting your request...');

    try {
      const payload = {
          ...formData,
          phone: `${countryCode} ${formData.phone}`
      };

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      toast.dismiss();
      if (response.ok) {
        toast.success(dict.requestSuccess || 'Request submitted successfully! We will contact you soon.');
        setFormData({
          fullName: '',
          email: '',
          country: '',
          phone: '',
          company: '',
          designation: '',
          description: ''
        });
        setCountryCode('+00');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to submit request.');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('An unexpected error occurred.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none" htmlFor="fullName">{dict.formName || 'Full Name'} *</label>
        <input 
            type="text" 
            className="flex h-9 w-full rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-white" 
            id="fullName" 
            required 
            placeholder={dict.formPlaceholderName || "Enter your full name"}
            value={formData.fullName}
            onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none" htmlFor="email">{dict.formEmail || 'Business Email'} *</label>
        <input 
            type="email" 
            className="flex h-9 w-full rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-white" 
            id="email" 
            required 
            placeholder={dict.formPlaceholderEmail || "Enter your business email address"}
            value={formData.email}
            onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none" htmlFor="country">{dict.country || 'Country'} *</label>
        <select 
            id="country" 
            required 
            className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
            value={formData.country}
            onChange={handleChange}
        >
            <option value="">{dict.selectCountry || 'Select a country'}</option>
            <option value="US">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="IN">India</option>
            <option value="JP">Japan</option>
            <option value="CN">China</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none" htmlFor="phone">{dict.phoneNumber || 'Phone Number'} *</label>
        <div className="flex gap-2">
            <input 
                type="text" 
                className="flex h-9 rounded-md border border-input px-3 py-1 text-sm bg-gray-100 w-20 text-center font-semibold" 
                disabled 
                value={countryCode}
            />
            <input 
                type="tel" 
                className="flex h-9 w-full rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-white flex-1" 
                id="phone" 
                required 
                placeholder={dict.phoneNumber || "Enter your phone number"}
                value={formData.phone}
                onChange={handleChange}
            />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none" htmlFor="company">{dict.companyName || 'Company'} *</label>
        <input 
            type="text" 
            className="flex h-9 w-full rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-white" 
            id="company" 
            required 
            placeholder={dict.companyName || "Enter your company name"}
            value={formData.company}
            onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none" htmlFor="designation">{dict.designation || 'Designation'} *</label>
        <input 
            type="text" 
            className="flex h-9 w-full rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-white" 
            id="designation" 
            required 
            placeholder={dict.designation || "Enter your job title/designation"}
            value={formData.designation}
            onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none" htmlFor="description">{dict.specificRequirements || 'Description (Optional)'}</label>
        <textarea 
            className="flex min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-white" 
            id="description" 
            rows={4} 
            placeholder={dict.formPlaceholderMessage || "Tell us more about your needs..."}
            value={formData.description}
            onChange={handleChange}
        ></textarea>
      </div>
      <button 
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 h-11 rounded-md px-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg" 
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? (dict.submitting || 'Submitting...') : (dict.submitRequest || 'Submit Your Request')}
      </button>
    </form>
  );
}