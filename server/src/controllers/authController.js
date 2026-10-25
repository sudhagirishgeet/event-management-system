const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const AppError = require('../utils/appError');
const { registerSchema, loginSchema } = require('../validators/authValidator');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'super-secret-jwt-key-eventflow-2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'super-secret-jwt-refresh-key-eventflow-2026',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return next(new AppError('An account with this email already exists.', 400, 'EMAIL_EXISTS'));
    }

    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        passwordHash,
        role: validatedData.role,
        isVerified: true,
        organizerProfile: validatedData.role === 'ORGANIZER' ? {
          create: {
            organization: validatedData.organizationName || `${validatedData.name}'s Events`,
            isVerified: true
          }
        } : undefined
      },
      include: { organizerProfile: true }
    });

    const { accessToken, refreshToken } = generateTokens(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    // Remove password before responding
    delete user.passwordHash;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return next(new AppError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: { organizerProfile: true }
    });

    if (!user) {
      return next(new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS'));
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.passwordHash);
    if (!isMatch) {
      return next(new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS'));
    }

    const { accessToken, refreshToken } = generateTokens(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    delete user.passwordHash;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return next(new AppError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    }
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { organizerProfile: true }
    });

    if (!user) {
      return next(new AppError('User profile not found.', 404, 'USER_NOT_FOUND'));
    }

    delete user.passwordHash;

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const token = req.body.refreshToken || req.headers['x-refresh-token'];
    if (!token) {
      return next(new AppError('Refresh token is required.', 401, 'MISSING_REFRESH_TOKEN'));
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'super-secret-jwt-refresh-key-eventflow-2026');
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || user.refreshToken !== token) {
      return next(new AppError('Invalid or revoked refresh token.', 401, 'INVALID_REFRESH_TOKEN'));
    }

    const tokens = generateTokens(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken }
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });
  } catch (error) {
    return next(new AppError('Invalid or expired refresh token.', 401, 'INVALID_REFRESH_TOKEN'));
  }
};

const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { refreshToken: null }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  refreshToken,
  logout
};
