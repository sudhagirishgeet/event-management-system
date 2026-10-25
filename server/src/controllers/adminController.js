const prisma = require('../config/db');
const AppError = require('../utils/appError');

const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;

    let where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
        organizerProfile: true,
        _count: { select: { bookings: true, events: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

const updateEventStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const validStatuses = ['PUBLISHED', 'REJECTED', 'CANCELLED', 'COMPLETED', 'PENDING_APPROVAL'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid status status change.', 400, 'INVALID_STATUS'));
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: `ADMIN_${status}_EVENT`,
        entity: 'Event',
        entityId: id,
        metadata: { status, rejectionReason }
      }
    });

    res.status(200).json({
      success: true,
      message: `Event status updated to ${status}.`,
      data: { event: updatedEvent }
    });
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 50,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: { logs }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updateEventStatus,
  getAuditLogs
};
