const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const logger = require('../utils/logger');

const generateTicketPDF = async (booking, event, user) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header Brand
      doc.fillColor('#4f46e5').fontSize(28).font('Helvetica-Bold').text('EventFlow', 40, 40);
      doc.fillColor('#64748b').fontSize(12).font('Helvetica').text('Smart Digital Ticket Pass', 40, 72);

      doc.moveTo(40, 95).lineTo(555, 95).strokeColor('#e2e8f0').lineWidth(1).stroke();

      // Event Card Container
      doc.rect(40, 110, 515, 340).fillAndStroke('#f8fafc', '#cbd5e1');

      // Title
      doc.fillColor('#0f172a').fontSize(20).font('Helvetica-Bold').text(event.title, 60, 130, { width: 475 });
      
      // Details
      doc.fontSize(12).font('Helvetica');
      doc.fillColor('#475569').text(`Attendee Name: `, 60, 175, { continued: true })
         .fillColor('#0f172a').font('Helvetica-Bold').text(user.name);
      
      doc.fillColor('#475569').font('Helvetica').text(`Booking ID: `, 60, 195, { continued: true })
         .fillColor('#0f172a').font('Helvetica-Bold').text(booking.bookingNumber);

      doc.fillColor('#475569').font('Helvetica').text(`Date & Time: `, 60, 215, { continued: true })
         .fillColor('#0f172a').font('Helvetica-Bold').text(`${new Date(event.startDate).toLocaleDateString()} | ${event.startTime}`);

      doc.fillColor('#475569').font('Helvetica').text(`Venue: `, 60, 235, { continued: true })
         .fillColor('#0f172a').font('Helvetica-Bold').text(event.venue ? `${event.venue.name}, ${event.venue.city}` : 'Online Event');

      doc.fillColor('#475569').font('Helvetica').text(`Total Paid: `, 60, 255, { continued: true })
         .fillColor('#16a34a').font('Helvetica-Bold').text(`₹${booking.finalAmount}`);

      // Ticket Breakdown
      doc.fillColor('#334155').fontSize(12).font('Helvetica-Bold').text('Ticket Tiers:', 60, 290);
      let yPos = 310;
      booking.bookingItems.forEach(item => {
        doc.fillColor('#64748b').fontSize(11).font('Helvetica')
           .text(`• ${item.ticketType.name} x ${item.quantity}  (@ ₹${item.unitPrice})`, 70, yPos);
        yPos += 18;
      });

      // QR Code Rendering
      const qrDataUrl = await QRCode.toDataURL(booking.qrSecret, { margin: 1, width: 140 });
      const qrImageBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
      doc.image(qrImageBuffer, 380, 175, { width: 140 });
      doc.fillColor('#64748b').fontSize(9).font('Helvetica').text('Scan for Event Entry', 395, 325);

      // Footer Instructions
      doc.moveTo(40, 470).lineTo(555, 470).strokeColor('#e2e8f0').lineWidth(1).stroke();
      doc.fillColor('#94a3b8').fontSize(10).font('Helvetica')
         .text('Please present this PDF digital pass or show the QR code on your mobile device at venue gate.', 40, 485, { align: 'center' });

      doc.end();
    } catch (error) {
      logger.error('Error generating PDF ticket:', { error: error.message });
      reject(error);
    }
  });
};

const generateCertificatePDF = async (certificate, event, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 40 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Gold Border Frame
      doc.rect(20, 20, 782, 555).lineWidth(4).strokeColor('#d97706');
      doc.rect(30, 30, 762, 535).lineWidth(1).strokeColor('#b45309');

      // Title Header
      doc.fillColor('#1e1b4b').fontSize(36).font('Helvetica-Bold').text('CERTIFICATE OF PARTICIPATION', 40, 100, { align: 'center' });
      doc.fillColor('#6366f1').fontSize(16).font('Helvetica').text('This is proudly awarded to', 40, 160, { align: 'center' });

      // User Name
      doc.fillColor('#0f172a').fontSize(32).font('Helvetica-Bold').text(user.name, 40, 210, { align: 'center' });

      // Description
      doc.fillColor('#475569').fontSize(16).font('Helvetica')
         .text(`for successfully attending and participating in`, 40, 270, { align: 'center' });

      // Event Title
      doc.fillColor('#4f46e5').fontSize(24).font('Helvetica-Bold').text(event.title, 40, 310, { align: 'center' });

      // Date & Organizers
      doc.fillColor('#64748b').fontSize(12).font('Helvetica')
         .text(`Issued on ${new Date(certificate.issuedAt).toLocaleDateString()} | Certificate ID: ${certificate.certificateId}`, 40, 400, { align: 'center' });

      doc.moveTo(200, 480).lineTo(350, 480).strokeColor('#cbd5e1').stroke();
      doc.fillColor('#334155').fontSize(12).font('Helvetica-Bold').text('Event Host / Organizer', 200, 490, { width: 150, align: 'center' });

      doc.moveTo(470, 480).lineTo(620, 480).strokeColor('#cbd5e1').stroke();
      doc.fillColor('#334155').fontSize(12).font('Helvetica-Bold').text('EventFlow Verified', 470, 490, { width: 150, align: 'center' });

      doc.end();
    } catch (error) {
      logger.error('Error generating PDF certificate:', { error: error.message });
      reject(error);
    }
  });
};

module.exports = {
  generateTicketPDF,
  generateCertificatePDF
};
