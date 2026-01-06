'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface EnquiryPageFormProps {
  reportId: string;
  reportTitle: string;
  enquiryType: string;
  lang: string;
}

const COUNTRIES = [
  { name: 'United States', code: '+1' },
  { name: 'United Kingdom', code: '+44' },
  { name: 'Canada', code: '+1' },
  { name: 'India', code: '+91' },
  { name: 'Germany', code: '+49' },
  { name: 'France', code: '+33' },
  { name: 'Japan', code: '+81' },
  { name: 'China', code: '+86' },
  { name: 'Australia', code: '+61' },
  { name: 'Singapore', code: '+65' },
  { name: 'Other', code: '' }
];

export default function EnquiryPageForm({ reportId, reportTitle, enquiryType, lang }: EnquiryPageFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: 'United States',
    phoneCode: '+1',
    phoneNumber: '',
    company: '',
    designation: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    const found = COUNTRIES.find(c => c.name === country);
    setFormData(prev => ({
      ...prev,
      country,
      phoneCode: found ? found.code : ''
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const descriptionWithExtras = `
Country: ${formData.country}
Designation: ${formData.designation}

${formData.description}
      `.trim();

      const payload = {
        reportId,
        reportTitle,
        requestType: enquiryType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        name: formData.fullName,
        email: formData.email,
        phone: `${formData.phoneCode} ${formData.phoneNumber}`,
        company: formData.company,
        description: descriptionWithExtras,
      };

      const res = await fetch('/api/customization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success('Request submitted successfully!');
        router.push(`/${lang}/thank-you/${enquiryType}/${reportId}`);
      } else {
        toast.error('Failed to submit request. Please try again.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeLabel = enquiryType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{typeLabel}</h1>
        <p className="text-gray-600">
          For Report: <span className="font-semibold text-indigo-600">{reportTitle}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Email *</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
            <select
              name="country"
              required
              value={formData.country}
              onChange={handleCountryChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {COUNTRIES.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                {formData.phoneCode}
              </span>
              <input
                type="tel"
                name="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                className="flex-1 rounded-r-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
            <input
              type="text"
              name="company"
              required
              value={formData.company}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
            <input
              type="text"
              name="designation"
              required
              value={formData.designation}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Please provide details about your request..."
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}