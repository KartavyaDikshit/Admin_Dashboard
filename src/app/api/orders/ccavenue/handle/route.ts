import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/ccavenue';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const encResp = formData.get('encResp') as string;
    
    if (!encResp) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const decrypted = decrypt(encResp);
    const params = new URLSearchParams(decrypted);

    const dbOrderId = params.get('merchant_param1');
    const orderStatus = params.get('order_status');
    const trackingId = params.get('tracking_id');
    
    if (!dbOrderId) {
       console.error("Missing DB Order ID in callback");
       return NextResponse.redirect(new URL('/?error=missing_order', request.url));
    }

    // Update Order
    // Map CC Avenue status to our Enums
    // OrderStatus: PENDING, PROCESSING, COMPLETED, CANCELLED, REFUNDED
    // PaymentStatus: PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED, CANCELLED
    
    let status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' = 'PENDING';
    let paymentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' = 'PENDING';

    if (orderStatus === 'Success') {
      status = 'PROCESSING'; // Order is paid, now needs fulfillment/processing
      paymentStatus = 'COMPLETED';
    } else if (orderStatus === 'Aborted') {
      status = 'CANCELLED';
      paymentStatus = 'CANCELLED';
    } else if (orderStatus === 'Failure') {
      status = 'PENDING'; // Keep order as pending so user can retry? Or fail it?
      paymentStatus = 'FAILED';
    }

    await prisma.order.update({
      where: { id: dbOrderId },
      data: {
        status: status, 
        paymentStatus: paymentStatus,
        transactionId: trackingId || undefined,
        paymentDate: new Date(),
        paymentProvider: 'CCAVENUE'
      }
    });

    if (orderStatus === 'Success') {
       const order = await prisma.order.findUnique({
         where: { id: dbOrderId },
         include: { items: { include: { report: true } } }
       });
       
       const report = order?.items[0]?.report;
       const reportFriendlyId = report?.reportId || report?.id || 'unknown';
       
       return NextResponse.redirect(new URL(`/en/thank-you/purchase/${reportFriendlyId}`, request.url));
    } else {
       return NextResponse.redirect(new URL(`/en/order-failed?reason=${orderStatus}`, request.url));
    }

  } catch (error) {
    console.error("CC Avenue Callback Error:", error);
    return NextResponse.redirect(new URL('/?error=callback_error', request.url));
  }
}