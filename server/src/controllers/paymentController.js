const prisma = require('../config/db');
const AppError = require('../utils/appError');
const paymentService = require('../services/paymentService');
const { sendBookingConfirmationEmail } = require('../services/emailService');
const { generateTicketPDF } = require('../services/pdfService');

const createRazorpayOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { event: true }
    });

    if (!booking) {
      return next(new AppError('Booking not found.', 404, 'BOOKING_NOT_FOUND'));
    }

    if (booking.status === 'CONFIRMED') {
      return next(new AppError('Booking is already paid and confirmed.', 400, 'ALREADY_PAID'));
    }

    const orderData = await paymentService.createOrder(booking.id, booking.finalAmount, 'INR');

    await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        gatewayOrderId: orderData.orderId,
        amount: booking.finalAmount,
        status: 'PENDING'
      },
      create: {
        bookingId: booking.id,
        gateway: 'RAZORPAY',
        gatewayOrderId: orderData.orderId,
        amount: booking.finalAmount,
        status: 'PENDING'
      }
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
        bookingId: booking.id
      }
    });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const isValid = paymentService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return next(new AppError('Payment signature verification failed. Tampered payload rejected.', 400, 'PAYMENT_VERIFICATION_FAILED'));
    }

    // Confirm booking and update payment in DB transaction
    const { booking, user, event } = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { bookingId },
        data: {
          gatewayPaymentId: razorpay_payment_id || `pay_mock_${Date.now()}`,
          gatewaySignature: razorpay_signature || 'mock_sig',
          status: 'SUCCESS'
        }
      });

      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' },
        include: {
          user: true,
          event: { include: { venue: true } },
          bookingItems: { include: { ticketType: true } }
        }
      });

      // Automatically issue participation certificate record
      await tx.certificate.create({
        data: {
          certificateId: `CERT-2026-${Math.floor(100000 + Math.random() * 900000)}`,
          userId: updatedBooking.userId,
          eventId: updatedBooking.eventId,
          bookingId: updatedBooking.id
        }
      });

      // Notification
      await tx.notification.create({
        data: {
          userId: updatedBooking.userId,
          type: 'PAYMENT_SUCCESS',
          title: 'Payment Successful!',
          message: `Your booking for ${updatedBooking.event.title} is confirmed.`,
          link: `/my-tickets/${updatedBooking.id}`
        }
      });

      return {
        booking: updatedBooking,
        user: updatedBooking.user,
        event: updatedBooking.event
      };
    });

    // Send confirmation email asynchronously with attached PDF ticket
    generateTicketPDF(booking, event, user)
      .then(pdfBuffer => sendBookingConfirmationEmail(user, booking, event, pdfBuffer))
      .catch(err => console.error('Background email dispatch failed:', err));

    res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed!',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment
};
