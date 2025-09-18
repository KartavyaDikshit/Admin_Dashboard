// A placeholder for the report type
type Report = {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
};

export default function ReportList({ reports }: { reports: Report[] }) {
  return (
    <div id="reports" className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Latest Reports</h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {report.imageUrl && (
                <img className="w-full h-48 object-cover" src={report.imageUrl} alt={report.title} />
              )}
              {!report.imageUrl && (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">{report.title}</h3>
                <p className="mt-2 text-base text-gray-500">{report.summary}</p>
                <a href="#" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500 font-semibold">
                  Read more
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
