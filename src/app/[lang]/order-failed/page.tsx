import Link from 'next/link';
import { XCircleIcon } from '@heroicons/react/24/outline';

interface Props {
  params: Promise<{
    lang: string;
  }>;
  searchParams: Promise<{
    reason?: string;
  }>;
}

export default async function OrderFailedPage({ params, searchParams }: Props) {
  const { lang } = await params;
  const { reason } = await searchParams;
  
  let title = "Order Failed";
  let message = "We were unable to process your order. Please try again or contact support.";

  if (reason === 'cancelled') {
      title = "Payment Cancelled";
      message = "You have cancelled the payment process. No charges were made to your account.";
  } else if (reason === 'Aborted') {
      title = "Transaction Aborted";
      message = "The transaction was aborted. Please try again.";
  } else if (reason === 'Failure') {
      title = "Payment Failed";
      message = "The payment transaction failed. Please check your payment details or try a different payment method.";
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <XCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          <div className="space-y-3">
            <Link 
              href={`/${lang}/contact`}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Contact Support
            </Link>
            <Link 
              href={`/${lang}`}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
