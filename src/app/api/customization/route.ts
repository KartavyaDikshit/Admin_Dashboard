import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportId, reportTitle, requestType, name, description, email, phone, company, sourceUrl } = body;

    if (!reportId || !requestType || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const customizationRequest = await prisma.customizationRequest.create({
      data: {
        reportId,
        reportTitle,
        requestType,
        name,
        description,
        email,
        phone,
        company,
        sourceUrl,
      },
    });

    // Fetch Report Details to get the readable Report ID (TBI-XXXX)
    let displayReportId = reportId;
    try {
        const report = await prisma.report.findUnique({
            where: { id: reportId },
            select: { reportId: true, sku: true }
        });
        if (report) {
            displayReportId = report.reportId || report.sku || reportId;
        }
    } catch (e) {
        console.error("Failed to fetch report details for email", e);
    }

    // Send Emails
    (async () => {
      try {
         const emailBody = { ...body, firstName: name, reportId: displayReportId }; // Override reportId with readable one

         // 1. Send to Client
         await sendEmail({
            to: email,
            subject: `We Received Your Request - ${requestType}`,
            html: emailTemplates.enquiryConfirmationClient(emailBody, requestType),
         });

         // 2. Send to Owner
         await sendEmail({
            to: 'sales@thebrainyinsights.com',
            subject: `New Customization Request - ${reportTitle?.substring(0, 30)}...`,
            html: emailTemplates.enquiryNotificationOwner(emailBody, requestType),
         });
      } catch (err) {
         console.error('Failed to send customization emails', err);
      }
    })();

    return NextResponse.json(customizationRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating customization request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const requests = await prisma.customizationRequest.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching customization requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const result = await prisma.customizationRequest.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error('Error deleting customization requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
