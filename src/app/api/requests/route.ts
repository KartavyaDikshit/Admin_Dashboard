import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countOnly = searchParams.get('countOnly');

    if (countOnly === 'true') {
      const count = await prisma.enquiry.count();
      return NextResponse.json({ count });
    }

    const enquiries = await prisma.enquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(enquiries);
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    return NextResponse.json({ message: 'Failed to fetch enquiries' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, country, phone, company, designation, description, reportId, enquiryType, sourceUrl } = body;

    // Split fullName into firstName and lastName
    const nameParts = fullName ? fullName.trim().split(' ') : [''];
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const enquiry = await prisma.enquiry.create({
      data: {
        firstName,
        lastName,
        email,
        country,
        phone,
        company,
        jobTitle: designation,
        message: description,
        enquiryType: enquiryType || 'Contact Form',
        reportId: reportId || undefined,
        status: 'NEW',
        source: sourceUrl,
      },
    });

    // Send Emails
    (async () => {
        try {
           const typeLabel = enquiryType || 'Contact Enquiry';
           const clientName = fullName || firstName;
           
           let displayReportId = reportId;
           let reportTitle = undefined;

           if (reportId) {
               try {
                   const report = await prisma.report.findUnique({
                       where: { id: reportId },
                       select: { title: true, reportId: true, sku: true }
                   });
                   if (report) {
                       displayReportId = report.reportId || report.sku || reportId;
                       reportTitle = report.title;
                   }
               } catch (e) {
                   console.error("Failed to fetch report details for enquiry email", e);
               }
           }

           const enquiryData = {
               firstName, lastName, email, phone, company, country, jobTitle: designation, message: description, 
               reportId: displayReportId, // Use readable ID
               reportTitle, // Pass title if we fetched it
               sourceUrl, 
           };
           
           // 1. Send to Client
           await sendEmail({
              to: email,
              subject: `Thank you for contacting The Brainy Insights`,
              html: emailTemplates.enquiryConfirmationClient(enquiryData, typeLabel),
           });
  
           // 2. Send to Owner
           await sendEmail({
              to: 'sales@thebrainyinsights.com',
              subject: `New Enquiry - ${typeLabel}`,
              html: emailTemplates.enquiryNotificationOwner(enquiryData, typeLabel),
           });
        } catch (err) {
           console.error('Failed to send enquiry emails', err);
        }
      })();

    return NextResponse.json(enquiry, { status: 201 });
  } catch (error) {
    console.error('Error creating enquiry:', error);
    return NextResponse.json({ message: 'Failed to create enquiry' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }

    const result = await prisma.enquiry.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error('Error deleting enquiries:', error);
    return NextResponse.json({ message: 'Failed to delete enquiries' }, { status: 500 });
  }
}
