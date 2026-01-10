import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt, CCAVENUE_CONFIG } from '@/lib/ccavenue';

export async function POST(request: Request) {
  try {
    const { reportId, licenseType, userEmail, userName, userPhone, userCompany } = await request.json();

    if (!reportId || !licenseType) {
      return NextResponse.json({ error: 'Missing reportId or licenseType' }, { status: 400 });
    }

    // 1. Fetch Report
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        title: true,
        singlePrice: true,
        multiPrice: true,
        corporatePrice: true,
        currency: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // 2. Determine Price
    let amount = 0;
    let dbLicenseType: 'SINGLE' | 'MULTIPLE' | 'CORPORATE' | 'ENTERPRISE' = 'SINGLE';

    switch (licenseType) {
      case 'singleUser':
      case 'SINGLE':
        amount = Number(report.singlePrice);
        dbLicenseType = 'SINGLE';
        break;
      case 'multiUser':
      case 'MULTIPLE':
        amount = Number(report.multiPrice);
        dbLicenseType = 'MULTIPLE';
        break;
      case 'corporate':
      case 'CORPORATE':
        amount = Number(report.corporatePrice);
        dbLicenseType = 'CORPORATE';
        break;
      default:
        return NextResponse.json({ error: 'Invalid license type' }, { status: 400 });
    }

    // 3. Create Order in DB (Pending)
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerEmail: userEmail || 'guest@example.com',
        customerName: userName || 'Guest User',
        customerPhone: userPhone || null,
        company: userCompany || null,
        subtotal: amount,
        total: amount,
        currency: report.currency || 'USD',
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentProvider: 'CCAVENUE',
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

    // 4. Prepare CC Avenue Data
    // Ensure the redirect URL is correct. Assuming localhost for now, but should be domain.
    // If running locally, CC Avenue callback might fail if it can't reach localhost.
    // But usually CC Avenue posts to the URL provided.
    // We will use relative path or configured base URL.
    // In production, force the live domain to avoid Vercel preview URL issues.
    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = isProduction ? 'https://www.brainyinsights.com' : (process.env.NEXTAUTH_URL || 'http://localhost:3000');
    
    const redirectUrl = `${baseUrl}/api/orders/ccavenue/handle`;
    const cancelUrl = `${baseUrl}/api/orders/ccavenue/handle`; // Handle cancellation same way or different

    const dataParams = [
      `merchant_id=${CCAVENUE_CONFIG.merchant_id}`,
      `order_id=${newOrder.orderNumber}`,
      `currency=${report.currency || 'USD'}`,
      `amount=${amount.toFixed(2)}`,
      `redirect_url=${redirectUrl}`,
      `cancel_url=${cancelUrl}`,
      `language=EN`,
      `billing_name=${userName || ''}`,
      `billing_address=${''}`,
      `billing_city=${''}`,
      `billing_state=${''}`,
      `billing_zip=${''}`,
      `billing_country=${''}`,
      `billing_tel=${userPhone || ''}`,
      `billing_email=${userEmail || ''}`,
      // Extra params if needed
      `merchant_param1=${newOrder.id}`, // Store DB UUID here
    ];

    const dataString = dataParams.join('&');
    const encRequest = encrypt(dataString);

    return NextResponse.json({
      merchant_id: CCAVENUE_CONFIG.merchant_id,
      access_code: CCAVENUE_CONFIG.access_code,
      encRequest,
      orderId: newOrder.id,
      url: CCAVENUE_CONFIG.url
    });

  } catch (error: any) {
    console.error('Error initiating CC Avenue:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
