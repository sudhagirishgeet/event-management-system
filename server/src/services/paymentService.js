const crypto = require('crypto');
const Razorpay = require('razorpay');
const logger = require('../utils/logger');

let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder_key') {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

const createOrder = async (bookingId, amount, currency = 'INR') => {
  try {
    const amountInPaise = Math.round(amount * 100);
    const receipt = `rcpt_${bookingId.substring(0, 10)}_${Date.now()}`;

    if (razorpayInstance) {
      const order = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency,
        receipt,
        notes: { bookingId }
      });
      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        isMock: false
      };
    }

    // Fallback Mock Order for Local Dev / Test mode
    const mockOrderId = `order_mock_${crypto.randomBytes(8).toString('hex')}`;
    logger.info(`Generated mock Razorpay order ID: ${mockOrderId} for booking ${bookingId}`);
    return {
      orderId: mockOrderId,
      amount: amountInPaise,
      currency,
      isMock: true
    };
  } catch (error) {
    logger.error('Error creating Razorpay payment order:', { error: error.message });
    throw error;
  }
};

const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    if (!razorpayInstance || orderId.startsWith('order_mock_')) {
      logger.info(`Verified mock Razorpay payment signature for order ${orderId}`);
      return true;
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    logger.error('Error verifying payment signature:', { error: error.message });
    return false;
  }
};

module.exports = {
  createOrder,
  verifyPaymentSignature
};
