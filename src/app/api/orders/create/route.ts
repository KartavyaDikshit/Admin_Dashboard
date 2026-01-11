import { NextResponse } from 'next/server';
import client from '@/lib/paypal';
import paypal from '@paypal/checkout-server-sdk';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { reportId, licenseType, userEmail, userName, userPhone, userCompany } = await request.json();


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

    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: 'Price not available for this license type' }, { status: 400 });
    }

    // 3. Create Order in Database (Pending) - FIRST
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
        paymentProvider: 'PAYPAL',
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

    // Send Emails (Async - don't block response)
    (async () => {
      try {
        const orderWithReport = {
          ...newOrder,
          // Need to fetch or pass the report info. 
          // Since we already have 'report' object above, we can assume structure.
        };
        const items = [{
          report: { title: report.title, sku: report.sku },
          licenseType: dbLicenseType,
          price: amount
        }];

        // 1. Send to Customer
        if (newOrder.customerEmail) {
          await sendEmail({
            to: newOrder.customerEmail,
            subject: `Order Confirmation - ${newOrder.orderNumber}`,
            html: emailTemplates.orderConfirmationClient(newOrder, items),
          });
        }

        // 2. Send to Owner
        await sendEmail({
          to: 'sales@thebrainyinsights.com',
          subject: `New Order Received - ${newOrder.orderNumber}`,
          html: emailTemplates.orderNotificationOwner(newOrder, items),
        });
      } catch (err) {
        console.error('Failed to send order emails', err);
      }
    })();

    // 4. Create PayPal Request
    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = isProduction ? 'https://www.brainyinsights.com' : (process.env.NEXTAUTH_URL || 'http://localhost:3000');

    const requestPayPal = new paypal.orders.OrdersCreateRequest();
    requestPayPal.prefer('return=representation');
    requestPayPal.requestBody({
      intent: 'CAPTURE',
      application_context: {
        return_url: `${baseUrl}/en`, // Ideally a thank you or processing page
        cancel_url: `${baseUrl}/en/order-failed?reason=cancelled`,
        brand_name: 'The Brainy Insights',
        user_action: 'PAY_NOW',
      },
      purchase_units: [
        {
          reference_id: newOrder.id, // Use our DB Order ID as reference
          description: `License: ${licenseType} - ${report.title.substring(0, 100)}...`,
          amount: {
            currency_code: report.currency || 'USD',
            value: amount.toFixed(2),
          },
        },
      ],
    });

    let orderID = '';
    try {
      const response = await client().execute(requestPayPal);
      orderID = response.result.id;

      // 5. Update Order with PayPal Transaction ID
      await prisma.order.update({
        where: { id: newOrder.id },
        data: { transactionId: orderID },
      });

    } catch (paypalError: any) {
      console.error('PayPal Order Creation Failed:', paypalError);
      // Return the DB order ID anyway so we have the record, but indicate payment initialization failed
      // The frontend can try to re-initiate or we can handle it.
      // For now, fail the request but the order is saved.
      return NextResponse.json({ 
        error: 'Payment initialization failed', 
        details: paypalError.message,
        dbOrderId: newOrder.id 
      }, { status: 500 });
    }

    return NextResponse.json({ orderID, dbOrderId: newOrder.id });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
