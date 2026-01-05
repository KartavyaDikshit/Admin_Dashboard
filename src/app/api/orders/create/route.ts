import { NextResponse } from 'next/server';
import client from '@/lib/paypal';
import paypal from '@paypal/checkout-server-sdk';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { reportId, licenseType, userEmail, userName } = await request.json();

    if (!reportId || !licenseType) {
      return NextResponse.json({ error: 'Missing reportId or licenseType' }, { status: 400 });
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
        currency: true,
        sku: true,
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
        amount = Number(report.singlePrice);
        dbLicenseType = 'SINGLE';
        break;
      case 'multiUser':
        amount = Number(report.multiPrice);
        dbLicenseType = 'MULTIPLE';
        break;
      case 'corporate':
        amount = Number(report.corporatePrice);
        dbLicenseType = 'CORPORATE';
        break;
      default:
        return NextResponse.json({ error: 'Invalid license type' }, { status: 400 });
    }

    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: 'Price not available for this license type' }, { status: 400 });
    }

    // 3. Create PayPal Request
    const requestPayPal = new paypal.orders.OrdersCreateRequest();
    requestPayPal.prefer('return=representation');
    requestPayPal.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: report.id,
          description: `License: ${licenseType} - ${report.title.substring(0, 100)}...`,
          amount: {
            currency_code: report.currency || 'USD',
            value: amount.toFixed(2),
          },
        },
      ],
    });

    const response = await client().execute(requestPayPal);
    const orderID = response.result.id;

    // 4. Create Order in Database (Pending)
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerEmail: userEmail || 'guest@example.com', // Handle guest checkout later or require auth
        customerName: userName || 'Guest User',
        subtotal: amount,
        total: amount,
        currency: report.currency || 'USD',
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentProvider: 'PAYPAL',
        transactionId: orderID, // Store PayPal Order ID initially
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

    return NextResponse.json({ orderID, dbOrderId: newOrder.id });
  } catch (error: any) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
