import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { reportId, licenseType, userEmail, userName, userPhone, userCompany, userCountry } = await request.json();

    if (!reportId || !licenseType || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Fetch Report Details for Pricing
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        title: true,
        singlePrice: true,
        multiPrice: true,
        corporatePrice: true,
        enterprisePrice: true,
        currency: true,
        sku: true,
        reportId: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // 2. Determine Price
    let amount = 0;
    let dbLicenseType: 'SINGLE' | 'MULTIPLE' | 'CORPORATE' | 'ENTERPRISE' = 'SINGLE';
    const normLicense = licenseType.toLowerCase();

    if (normLicense.includes('single')) {
        amount = Number(report.singlePrice);
        dbLicenseType = 'SINGLE';
    } else if (normLicense.includes('multi') || normLicense.includes('user')) {
        amount = Number(report.multiPrice);
        dbLicenseType = 'MULTIPLE';
    } else if (normLicense.includes('corp')) {
        amount = Number(report.corporatePrice);
        dbLicenseType = 'CORPORATE';
    } else if (normLicense.includes('enter')) {
        amount = Number(report.enterprisePrice);
        dbLicenseType = 'ENTERPRISE';
    } else {
        // Fallback default
        amount = Number(report.singlePrice);
    }

    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: 'Price not available for this license type' }, { status: 400 });
    }

    // 3. Create Order in Database
    const orderNumber = `WT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerEmail: userEmail,
        customerName: userName || 'Guest User',
        customerPhone: userPhone || null,
        company: userCompany || null,
        country: userCountry || null,
        subtotal: amount,
        total: amount,
        currency: report.currency || 'USD',
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: 'WIRE_TRANSFER',
        paymentProvider: 'BANK_TRANSFER',
        items: {
          create: {
            reportId: report.id,
            licenseType: dbLicenseType,
            price: amount,
            quantity: 1,
          },
        },
      },
    });

    return NextResponse.json({ 
        success: true, 
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        reportFriendlyId: report.reportId || report.sku || report.id
    });

  } catch (error: any) {
    console.error('Error creating wire transfer order:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
