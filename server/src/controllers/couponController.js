const prisma = require('../config/db');
const AppError = require('../utils/appError');

const validateCoupon = async (req, res, next) => {
  try {
    const { code, amount } = req.body;

    if (!code) {
      return next(new AppError('Coupon code is required.', 400, 'MISSING_CODE'));
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon || !coupon.isActive) {
      return next(new AppError('Invalid or inactive coupon code.', 400, 'INVALID_COUPON'));
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return next(new AppError('This coupon code has expired.', 400, 'EXPIRED_COUPON'));
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return next(new AppError('Coupon usage limit reached.', 400, 'LIMIT_EXCEEDED'));
    }

    const orderAmount = parseFloat(amount || 0);
    if (orderAmount < coupon.minimumAmount) {
      return next(new AppError(`Minimum order amount of ₹${coupon.minimumAmount} required for this coupon.`, 400, 'MIN_AMOUNT_NOT_MET'));
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
        discountAmount = coupon.maximumDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully!',
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        calculatedDiscount: discountAmount,
        finalAmount: Math.max(0, orderAmount - discountAmount)
      }
    });
  } catch (error) {
    next(error);
  }
};

const createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minimumAmount, maximumDiscount, usageLimit, validFrom, validUntil } = req.body;

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minimumAmount: parseFloat(minimumAmount || 0),
        maximumDiscount: maximumDiscount ? parseFloat(maximumDiscount) : null,
        usageLimit: parseInt(usageLimit || 100),
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil)
      }
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully.',
      data: { coupon }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateCoupon,
  createCoupon
};
