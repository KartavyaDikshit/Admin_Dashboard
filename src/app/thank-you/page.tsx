import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default async function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100">
            <CheckCircleIcon className="h-12 w-12 text-green-600" aria-hidden="true" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Thank You!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your request has been submitted successfully.
          </p>
          <p className="mt-4 text-lg text-gray-700 font-medium">
            Our team will reach out to you soon.
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <Link href="/" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm">
            Return to Home
          </Link>
          <Link href="/reports" className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm">
            Browse More Reports
          </Link>
        </div>
      </div>
    </div>
  );
}
