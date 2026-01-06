import { getReport } from '@/lib/data';
import { notFound } from 'next/navigation';
import EnquiryPageForm from '@/components/new_ui/EnquiryPageForm';
import { getDictionary } from '@/i18n/dictionaries';

interface Props {
  params: Promise<{
    lang: string;
    type: string;
    reportId: string;
  }>;
}

export default async function EnquiryPage({ params }: Props) {
  const { lang, type, reportId } = await params;
  
  // We need to fetch report to get the title.
  // reportId in URL is likely the friendly ID (TBI-XXXX) or slug?
  // Request said ".../14822" (last 5 digits). My IDs are TBI-XXXX.
  // I'll assume reportId param IS the ID or I can try to fetch by ID.
  // getReport usually takes slug. I don't have slug here, I have reportId.
  // I need a way to fetch by ID.
  // I'll assume getReport handles ID or I'll implement a getReportById if needed.
  // But wait, `getReport` in `lib/data` fetches by slug.
  // I'll check `lib/data.ts`.

  // If I can't fetch by ID easily, I might need to add a function or use prisma directly here (server component).
  // I'll use prisma directly for efficiency since this is a server component.
  
  const { prisma } = await import('@/lib/prisma');
  
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reportId);

  const whereCondition: any = {
    OR: [
      { reportId: reportId },
      // Try to match partial ID if it's just digits
      { reportId: { endsWith: reportId } } 
    ]
  };

  if (isUuid) {
    whereCondition.OR.push({ id: reportId });
  }
  
  const report = await prisma.report.findFirst({
    where: whereCondition,
    select: { title: true, id: true, reportId: true }
  });

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Report not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <EnquiryPageForm 
        reportId={report.id} // Use UUID for DB link
        reportTitle={report.title}
        enquiryType={type}
        lang={lang}
      />
    </div>
  );
}