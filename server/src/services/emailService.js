const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== 'mailtrap_user') {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT || '2525'),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    if (transporter) {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"EventFlow" <noreply@eventflow.com>',
        to,
        subject,
        html,
        attachments
      });
      logger.info(`Email sent successfully to ${to}, MessageId: ${info.messageId}`);
      return info;
    }
    
    // Log email delivery mock when no SMTP server is configured
    logger.info(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
    return { mock: true, messageId: `mock_${Date.now()}` };
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, { error: error.message });
    return null;
  }
};

const sendBookingConfirmationEmail = async (user, booking, event, ticketPdfBuffer) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #ffffff; padding: 24px; borderRadius: 12px;">
      <h1 style="color: #6366f1; margin-bottom: 8px;">EventFlow</h1>
      <h2 style="color: #f8fafc;">Booking Confirmed!</h2>
      <p style="color: #94a3b8;">Hi ${user.name}, get ready for an amazing experience!</p>
      
      <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #38bdf8;">${event.title}</h3>
        <p><strong>Booking Number:</strong> ${booking.bookingNumber}</p>
        <p><strong>Date & Time:</strong> ${new Date(event.startDate).toLocaleDateString()} at ${event.startTime}</p>
        <p><strong>Total Amount:</strong> ₹${booking.finalAmount}</p>
      </div>

      <p style="color: #94a3b8;">Your digital ticket with QR code is attached to this email. Present it at the entrance for entry check-in.</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `🎟️ Ticket Confirmed: ${event.title} (${booking.bookingNumber})`,
    html,
    attachments: ticketPdfBuffer ? [{
      filename: `EventFlow-Ticket-${booking.bookingNumber}.pdf`,
      content: ticketPdfBuffer,
      contentType: 'application/pdf'
    }] : []
  });
};

module.exports = {
  sendEmail,
  sendBookingConfirmationEmail
};
