import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

interface Report {
  id: string;
  title: string;
  slug: string;
  description: string;
  summary: string;
  ogImage?: string;
  createdAt: string;
  updatedAt: string;
  locale: string;
}

async function getReports(lang: string): Promise<Report[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_BASE_URL is not defined');
  }
  const res = await fetch(`${baseUrl}/api/${lang}/reports`, {
    next: { revalidate: 3600 } // Revalidate every hour
  });
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch reports');
  }
  return res.json();
}

export default async function ReportsPage({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const reports = await getReports(lang);

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Reports</h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Explore our latest market research reports.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {reports.map((report) => (
            <article key={report.id} className="flex flex-col items-start justify-between">
              <div className="relative w-full">
                <Image
                  src={report.ogImage || 'https://via.placeholder.com/400x200?text=No+Image'}
                  alt=""
                  className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                  width={400}
                  height={200}
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
              </div>
              <div className="max-w-xl">
                <div className="mt-8 flex items-center gap-x-4 text-xs">
                  <time dateTime={report.createdAt} className="text-gray-500">
                    {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                  </time>
                  <span className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100">
                    Report
                  </span>
                </div>
                <div className="group relative">
                  <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                    <Link href={`/${lang}/reports/${report.slug}`}>
                      <span className="absolute inset-0" />
                      {report.title}
                    </Link>
                  </h3>
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">{report.summary}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
