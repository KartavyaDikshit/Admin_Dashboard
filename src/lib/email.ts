import nodemailer from 'nodemailer';

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: 'smtp.qlc.co.in', 
  port: 587, 
  secure: false, 
  auth: {
    user: 'sales@thebrainyinsights.com', 
    pass: '7H#Q%o@B@Th8',
  },
  tls: {
    rejectUnauthorized: false
  },
  debug: true, // Enable debug output
  logger: true // Log to console
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  cc?: string;
}

export async function sendEmail({ to, subject, html, cc }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: '"The Brainy Insights" <sales@thebrainyinsights.com>',
      to,
      cc,
      subject,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw to prevent blocking the flow, but log error
    return null; 
  }
}

export const emailTemplates = {
  // 1. Order Confirmation (Client)
  orderConfirmationClient: (order: any, items: any[]) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #4f46e5; border-bottom: 2px solid #eee; padding-bottom: 10px;">Order Confirmation</h2>
      <p>Dear ${order.customerName},</p>
      <p>Thank you for your purchase with The Brainy Insights. We are pleased to confirm your order.</p>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Total Amount:</strong> ${order.currency} ${Number(order.total).toFixed(2)}</p>
      </div>

      <h3>Order Details:</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #eee; text-align: left;">
            <th style="padding: 10px; border-bottom: 1px solid #ddd;">Report Title</th>
            <th style="padding: 10px; border-bottom: 1px solid #ddd;">License</th>
            <th style="padding: 10px; border-bottom: 1px solid #ddd;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.report.title}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.licenseType}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${order.currency} ${Number(item.price).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <p>Your report(s) will be delivered to your email shortly after payment verification.</p>
      
      <p style="margin-top: 30px;">Best regards,<br><strong>The Brainy Insights Team</strong><br><a href="mailto:sales@thebrainyinsights.com">sales@thebrainyinsights.com</a></p>
    </div>
  `,

  // 2. Order Notification (Owner)
  orderNotificationOwner: (order: any, items: any[]) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #dc2626; border-bottom: 2px solid #eee; padding-bottom: 10px;">New Order Received</h2>
      
      <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #991b1b;">Customer Details</h3>
        <p><strong>Name:</strong> ${order.customerName}</p>
        <p><strong>Email:</strong> ${order.customerEmail}</p>
        <p><strong>Phone:</strong> ${order.customerPhone || 'N/A'}</p>
        <p><strong>Company:</strong> ${order.company || 'N/A'}</p>
        <p><strong>Country:</strong> ${order.country || 'N/A'}</p>
      </div>

      <div style="margin: 20px 0;">
        <h3 style="color: #991b1b;">Order Summary</h3>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Total:</strong> ${order.currency} ${Number(order.total).toFixed(2)}</p>
        <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
      </div>

      <h3>Items:</h3>
      <ul>
        ${items.map(item => `
          <li>
            <strong>Report:</strong> ${item.report.title} (ID: ${item.report.sku})<br>
            <strong>License:</strong> ${item.licenseType}<br>
            <strong>Price:</strong> ${order.currency} ${Number(item.price).toFixed(2)}
          </li>
        `).join('')}
      </ul>
    </div>
  `,

  // 3. Enquiry/Customization Confirmation (Client)
  enquiryConfirmationClient: (data: any, type: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #4f46e5; border-bottom: 2px solid #eee; padding-bottom: 10px;">We Received Your Request</h2>
      <p>Dear ${data.firstName || data.name || 'Customer'},</p>
      <p>Thank you for contacting The Brainy Insights. We have successfully received your request for <strong>${type}</strong>.</p>
      
      ${data.reportTitle ? `
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Report:</strong> ${data.reportTitle}</p>
        ${data.reportId ? `<p><strong>Report ID:</strong> ${data.reportId}</p>` : ''}
      </div>
      ` : ''}

      <p>Our team of analysts is reviewing your requirements and will get back to you within 24 business hours.</p>
      
      <p style="margin-top: 30px;">Best regards,<br><strong>The Brainy Insights Team</strong><br><a href="mailto:sales@thebrainyinsights.com">sales@thebrainyinsights.com</a></p>
    </div>
  `,

  // 4. Enquiry/Customization Notification (Owner)
  enquiryNotificationOwner: (data: any, type: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #059669; border-bottom: 2px solid #eee; padding-bottom: 10px;">New ${type} Request</h2>
      
      <div style="background-color: #ecfdf5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #047857;">Contact Information</h3>
        <p><strong>Name:</strong> ${data.firstName || data.name} ${data.lastName || ''}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
        <p><strong>Company:</strong> ${data.company || 'N/A'}</p>
        <p><strong>Country:</strong> ${data.country || 'N/A'}</p>
        <p><strong>Job Title:</strong> ${data.jobTitle || 'N/A'}</p>
      </div>

      ${data.reportTitle ? `
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1f2937;">Report Interest</h3>
        <p><strong>Report Title:</strong> ${data.reportTitle}</p>
        <p><strong>Report ID:</strong> ${data.reportId || 'N/A'}</p>
      </div>
      ` : ''}

      <div style="border-top: 1px solid #eee; padding-top: 15px;">
        <h3 style="color: #1f2937;">Message/Requirements:</h3>
        <p style="white-space: pre-wrap; background: #fff; padding: 10px; border: 1px solid #eee; border-radius: 4px;">${data.message || data.description || 'No message provided.'}</p>
      </div>
      
      <div style="margin-top: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 10px;">
        <p><strong>Source:</strong> ${data.sourceUrl || data.source || 'Website'}</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `
};
