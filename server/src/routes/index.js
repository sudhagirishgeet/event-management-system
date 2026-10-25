const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

const authController = require('../controllers/authController');
const eventController = require('../controllers/eventController');
const ticketController = require('../controllers/ticketController');
const bookingController = require('../controllers/bookingController');
const paymentController = require('../controllers/paymentController');
const checkInController = require('../controllers/checkInController');
const couponController = require('../controllers/couponController');
const analyticsController = require('../controllers/analyticsController');
const aiController = require('../controllers/aiController');
const reviewController = require('../controllers/reviewController');
const favoriteController = require('../controllers/favoriteController');
const adminController = require('../controllers/adminController');

// Auth Routes
router.post('/auth/register', authLimiter, authController.register);
router.post('/auth/login', authLimiter, authController.login);
router.get('/auth/me', authenticate, authController.getMe);
router.post('/auth/refresh', authController.refreshToken);
router.post('/auth/logout', authenticate, authController.logout);

// Event Routes
router.get('/events', eventController.getEvents);
router.get('/events/categories', eventController.getCategories);
router.get('/events/:id', eventController.getEventById);
router.post('/events', authenticate, authorize('ORGANIZER', 'ADMIN'), eventController.createEvent);
router.put('/events/:id', authenticate, authorize('ORGANIZER', 'ADMIN'), eventController.updateEvent);

// Ticket Tier Routes
router.post('/events/:eventId/tickets', authenticate, authorize('ORGANIZER', 'ADMIN'), ticketController.addTicketType);
router.put('/tickets/:id', authenticate, authorize('ORGANIZER', 'ADMIN'), ticketController.updateTicketType);

// Booking Routes
router.post('/bookings', authenticate, bookingController.createBooking);
router.get('/bookings/my', authenticate, bookingController.getMyBookings);
router.get('/bookings/:id', authenticate, bookingController.getBookingById);
router.get('/bookings/:id/pdf', authenticate, bookingController.downloadTicketPDF);
router.post('/bookings/:id/cancel', authenticate, bookingController.cancelBooking);

// Payment Routes
router.post('/payments/create-order', authenticate, paymentController.createRazorpayOrder);
router.post('/payments/verify', authenticate, paymentController.verifyPayment);

// QR Check-in Routes
router.post('/checkins/scan', authenticate, authorize('ORGANIZER', 'ADMIN'), checkInController.scanCheckIn);
router.get('/events/:id/checkins', authenticate, authorize('ORGANIZER', 'ADMIN'), checkInController.getEventCheckIns);

// Coupons
router.post('/coupons/validate', authenticate, couponController.validateCoupon);
router.post('/coupons', authenticate, authorize('ORGANIZER', 'ADMIN'), couponController.createCoupon);

// Analytics
router.get('/organizer/analytics', authenticate, authorize('ORGANIZER', 'ADMIN'), analyticsController.getOrganizerAnalytics);
router.get('/admin/analytics', authenticate, authorize('ADMIN'), analyticsController.getAdminAnalytics);

// AI Integration
router.post('/ai/generate-description', authenticate, authorize('ORGANIZER', 'ADMIN'), aiController.generateDescription);
router.get('/ai/recommendations', aiController.getRecommendations);
router.post('/ai/chatbot', aiController.chatWithAI);

// Reviews & Favorites
router.post('/reviews', authenticate, reviewController.createReview);
router.get('/events/:eventId/reviews', reviewController.getEventReviews);
router.post('/favorites/:eventId', authenticate, favoriteController.toggleFavorite);
router.get('/favorites/my', authenticate, favoriteController.getMyFavorites);

// Admin Control
router.get('/admin/users', authenticate, authorize('ADMIN'), adminController.getUsers);
router.put('/admin/events/:id/status', authenticate, authorize('ADMIN'), adminController.updateEventStatus);
router.get('/admin/audit-logs', authenticate, authorize('ADMIN'), adminController.getAuditLogs);

module.exports = router;
