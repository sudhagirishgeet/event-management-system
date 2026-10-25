const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const AppError = require('../utils/appError');

const authenticate = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401, 'UNAUTHORIZED'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-jwt-key-eventflow-2026');

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { organizerProfile: true }
    });

    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401, 'USER_NOT_FOUND'));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401, 'INVALID_TOKEN'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401, 'TOKEN_EXPIRED'));
    }
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403, 'FORBIDDEN'));
    }
    next();
  };
};

const verifyEventOwnership = async (req, res, next) => {
  try {
    const eventId = req.params.eventId || req.params.id;
    if (!eventId) return next();

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true }
    });

    if (!event) {
      return next(new AppError('Event not found.', 404, 'EVENT_NOT_FOUND'));
    }

    if (req.user.role !== 'ADMIN' && event.organizerId !== req.user.id) {
      return next(new AppError('You do not own this event and cannot modify it.', 403, 'EVENT_OWNERSHIP_DENIED'));
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  authorize,
  verifyEventOwnership
};
