const logger = require('../utils/logger');

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error(err.message, {
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode || 'INTERNAL_ERROR',
      stack: err.stack,
      error: err,
    });
  }

  // Production Error Handling
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode || 'OPERATIONAL_ERROR',
    });
  }

  // Generic non-operational error fallback
  return res.status(500).json({
    success: false,
    message: 'Something went very wrong on our end. Please try again later.',
    errorCode: 'INTERNAL_SERVER_ERROR',
  });
};

module.exports = globalErrorHandler;
