const prisma = require('../config/db');
const AppError = require('../utils/appError');

const createReview = async (req, res, next) => {
  try {
    const { eventId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return next(new AppError('Rating must be between 1 and 5 stars.', 400, 'INVALID_RATING'));
    }

    // Verify user attended the event
    const booking = await prisma.booking.findFirst({
      where: { userId, eventId, status: 'CONFIRMED' }
    });

    if (!booking && req.user.role !== 'ADMIN') {
      return next(new AppError('Only verified attendees who booked this event can leave a review.', 403, 'UNVERIFIED_REVIEWER'));
    }

    const review = await prisma.review.upsert({
      where: {
        userId_eventId: { userId, eventId }
      },
      update: {
        rating: parseInt(rating),
        comment
      },
      create: {
        userId,
        eventId,
        rating: parseInt(rating),
        comment
      },
      include: {
        user: { select: { id: true, name: true, profileImage: true } }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

const getEventReviews = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, name: true, profileImage: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getEventReviews
};
