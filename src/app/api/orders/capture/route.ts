import { NextResponse } from 'next/server';
import client from '@/lib/paypal';
import paypal from '@paypal/checkout-server-sdk';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { orderID } = await request.json();

    if (!orderID) {
      return NextResponse.json({ error: 'Missing orderID' }, { status: 400 });
    }

    // 1. Capture Payment with PayPal
    const requestPayPal = new paypal.orders.OrdersCaptureRequest(orderID);
    requestPayPal.requestBody({});

    const response = await client().execute(requestPayPal);
    
    if (!response || response.result.status !== 'COMPLETED') {
        return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const captureId = response.result.purchase_units[0].payments.captures[0].id;

    // 2. Update Order in Database
    // Find the order that has this PayPal Order ID stored in transactionId (from create step)
    const order = await prisma.order.findFirst({
        where: { transactionId: orderID }
    });

    if (order) {
        await prisma.order.update({
            where: { id: order.id },
            data: {
                status: 'COMPLETED',
                paymentStatus: 'COMPLETED',
                paymentDate: new Date(),
                transactionId: captureId, // Update to the actual capture ID if desired, or keep original and store capture elsewhere. Usually Capture ID is more useful for refunds.
                // You might want to store the original OrderID in a separate field or JSON if you overwrite transactionId. 
                // For now, I'll overwrite it as it's the final proof of payment.
            }
        });
        
        // TODO: Trigger email, grant access, etc.
    } else {
        console.error(`Order with PayPal ID ${orderID} not found in DB during capture.`);
        // Even if not found, we return success to the client because the payment WAS captured.
        // We just log it for manual reconciliation.
    }

    return NextResponse.json({ status: 'COMPLETED', captureId });
  } catch (error: any) {
    console.error('Error capturing PayPal order:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
