const crypto = require('crypto');
const prisma = require('../config/db');
const AppError = require('../utils/appError');
const { createBookingSchema } = require('../validators/bookingValidator');
const { generateTicketPDF } = require('../services/pdfService');

const createBooking = async (req, res, next) => {
  try {
    const validatedData = createBookingSchema.parse(req.body);
    const userId = req.user.id;

    // Use Prisma transaction to lock inventory and ensure race-condition safety
    const bookingResult = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: validatedData.eventId },
        include: { ticketTypes: true }
      });

      if (!event || event.status !== 'PUBLISHED') {
        throw new AppError('Event is not available for booking.', 400, 'EVENT_UNAVAILABLE');
      }

      let rawTotal = 0;
      const bookingItemsData = [];
      let totalTicketsCount = 0;

      for (const item of validatedData.items) {
        const ticketTier = event.ticketTypes.find(t => t.id === item.ticketTypeId);
        if (!ticketTier) {
          throw new AppError(`Ticket type ${item.ticketTypeId} not found on this event.`, 404, 'TICKET_NOT_FOUND');
        }

        if (ticketTier.availableQty < item.quantity) {
          throw new AppError(`Insufficient tickets available for ${ticketTier.name}. Requested: ${item.quantity}, Available: ${ticketTier.availableQty}`, 400, 'TICKET_SOLD_OUT');
        }

        const itemTotal = ticketTier.price * item.quantity;
        rawTotal += itemTotal;
        totalTicketsCount += item.quantity;

        bookingItemsData.push({
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity,
          unitPrice: ticketTier.price,
          totalPrice: itemTotal
        });
      }

      if (event.remainingCapacity < totalTicketsCount) {
        throw new AppError('Event maximum venue capacity reached.', 400, 'CAPACITY_FULL');
      }

      // Coupon calculation
      let discountAmount = 0;
      let couponId = null;

      if (validatedData.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: validatedData.couponCode.toUpperCase() }
        });

        if (coupon && coupon.isActive && new Date() >= coupon.validFrom && new Date() <= coupon.validUntil) {
          if (coupon.usedCount < coupon.usageLimit && rawTotal >= coupon.minimumAmount) {
            if (coupon.discountType === 'PERCENTAGE') {
              discountAmount = (rawTotal * coupon.discountValue) / 100;
              if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
                discountAmount = coupon.maximumDiscount;
              }
            } else {
              discountAmount = coupon.discountValue;
            }
            couponId = coupon.id;
          }
        }
      }

      const finalAmount = Math.max(0, rawTotal - discountAmount);
      const bookingNumber = `EVT-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const qrSecret = `QR-EVT-${crypto.randomUUID()}`;

      // Create Booking record
      const booking = await tx.booking.create({
        data: {
          bookingNumber,
          userId,
          eventId: event.id,
          totalAmount: rawTotal,
          discountAmount,
          finalAmount,
          status: 'PENDING',
          qrSecret,
          couponId,
          bookingItems: {
            create: bookingItemsData
          }
        },
        include: {
          bookingItems: { include: { ticketType: true } },
          event: { include: { venue: true } },
          user: true
        }
      });

      // Decrement available ticket inventory
      for (const item of validatedData.items) {
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { availableQty: { decrement: item.quantity } }
        });
      }

      await tx.event.update({
        where: { id: event.id },
        data: { remainingCapacity: { decrement: totalTicketsCount } }
      });

      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } }
        });
      }

      return booking;
    });

    res.status(201).json({
      success: true,
      message: 'Booking reserved successfully. Proceed to payment.',
      data: { booking: bookingResult }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return next(new AppError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    }
    next(error);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        event: { include: { category: true, venue: true } },
        bookingItems: { include: { ticketType: true } },
        payment: true,
        certificate: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: { bookings }
    });
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        event: { include: { category: true, venue: true, organizer: true } },
        bookingItems: { include: { ticketType: true } },
        payment: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
        certificate: true,
        checkIn: true
      }
    });

    if (!booking) {
      return next(new AppError('Booking not found.', 404, 'BOOKING_NOT_FOUND'));
    }

    if (req.user.role !== 'ADMIN' && booking.userId !== req.user.id && booking.event.organizerId !== req.user.id) {
      return next(new AppError('You do not have permission to view this ticket.', 403, 'FORBIDDEN'));
    }

    res.status(200).json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

const downloadTicketPDF = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        event: { include: { venue: true } },
        bookingItems: { include: { ticketType: true } },
        user: true
      }
    });

    if (!booking) {
      return next(new AppError('Booking not found.', 404, 'BOOKING_NOT_FOUND'));
    }

    const pdfBuffer = await generateTicketPDF(booking, booking.event, booking.user);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=EventFlow-Ticket-${booking.bookingNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { event: true, bookingItems: true }
    });

    if (!booking) {
      return next(new AppError('Booking not found.', 404, 'BOOKING_NOT_FOUND'));
    }

    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('You cannot cancel another user\'s booking.', 403, 'FORBIDDEN'));
    }

    if (booking.status === 'CANCELLED' || booking.status === 'REFUNDED') {
      return next(new AppError('Booking is already cancelled.', 400, 'ALREADY_CANCELLED'));
    }

    // Calculate refund according to organizer policy
    const daysUntilEvent = (new Date(booking.event.startDate) - new Date()) / (1000 * 60 * 60 * 24);
    let refundAmount = 0;

    if (daysUntilEvent >= booking.event.refundPolicyDays) {
      refundAmount = (booking.finalAmount * booking.event.refundPolicyPercent) / 100;
    }

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED' }
      });

      if (refundAmount > 0) {
        await tx.refund.create({
          data: {
            bookingId: booking.id,
            amount: refundAmount,
            reason: 'Attendee requested cancellation within policy window',
            status: 'PROCESSED'
          }
        });
      }

      // Reclaim ticket inventory
      for (const item of booking.bookingItems) {
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { availableQty: { increment: item.quantity } }
        });
      }

      await tx.event.update({
        where: { id: booking.eventId },
        data: { remainingCapacity: { increment: booking.bookingItems.reduce((acc, curr) => acc + curr.quantity, 0) } }
      });
    });

    res.status(200).json({
      success: true,
      message: `Booking cancelled successfully. Refund amount: ₹${refundAmount.toFixed(2)}`,
      data: { refundAmount }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  downloadTicketPDF,
  cancelBooking
};
