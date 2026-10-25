const prisma = require('../config/db');
const AppError = require('../utils/appError');

const scanCheckIn = async (req, res, next) => {
  try {
    const { qrSecret, eventId } = req.body;

    if (!qrSecret || !eventId) {
      return next(new AppError('QR Secret code and Event ID are required.', 400, 'MISSING_FIELDS'));
    }

    const booking = await prisma.booking.findUnique({
      where: { qrSecret },
      include: {
        event: true,
        user: true,
        checkIn: true,
        bookingItems: { include: { ticketType: true } }
      }
    });

    if (!booking) {
      return next(new AppError('Invalid QR Code. Ticket not found.', 404, 'INVALID_QR'));
    }

    if (booking.eventId !== eventId) {
      return next(new AppError('This ticket belongs to a different event!', 400, 'EVENT_MISMATCH'));
    }

    if (booking.status !== 'CONFIRMED') {
      return next(new AppError(`Ticket is not confirmed (Current Status: ${booking.status}). Entry denied.`, 400, 'UNCONFIRMED_BOOKING'));
    }

    if (booking.checkIn) {
      return next(new AppError(`TICKET ALREADY USED! Checked in on ${new Date(booking.checkIn.checkedInAt).toLocaleTimeString()}`, 400, 'ALREADY_CHECKED_IN'));
    }

    const checkInRecord = await prisma.checkIn.create({
      data: {
        eventId: booking.eventId,
        bookingId: booking.id,
        userId: booking.userId,
        checkedInBy: req.user.id
      }
    });

    res.status(200).json({
      success: true,
      message: '✅ ATTENDEE CHECKED IN SUCCESSFULLY!',
      data: {
        checkIn: checkInRecord,
        attendeeName: booking.user.name,
        attendeeEmail: booking.user.email,
        tickets: booking.bookingItems.map(i => `${i.ticketType.name} x ${i.quantity}`)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getEventCheckIns = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [checkIns, totalConfirmedBookings] = await Promise.all([
      prisma.checkIn.findMany({
        where: { eventId: id },
        include: {
          user: { select: { id: true, name: true, email: true, profileImage: true } },
          booking: { include: { bookingItems: { include: { ticketType: true } } } }
        },
        orderBy: { checkedInAt: 'desc' }
      }),
      prisma.booking.count({
        where: { eventId: id, status: 'CONFIRMED' }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        checkIns,
        stats: {
          checkedInCount: checkIns.length,
          totalConfirmedBookings,
          checkInRatePercentage: totalConfirmedBookings ? Math.round((checkIns.length / totalConfirmedBookings) * 100) : 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scanCheckIn,
  getEventCheckIns
};
