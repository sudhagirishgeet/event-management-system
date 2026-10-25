const prisma = require('../config/db');
const AppError = require('../utils/appError');
const { ticketTypeSchema } = require('../validators/eventValidator');

const addTicketType = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const validatedData = ticketTypeSchema.parse(req.body);

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return next(new AppError('Event not found.', 404, 'EVENT_NOT_FOUND'));
    }

    const ticketType = await prisma.ticketType.create({
      data: {
        eventId,
        name: validatedData.name,
        description: validatedData.description || null,
        price: validatedData.price,
        quantity: validatedData.quantity,
        availableQty: validatedData.quantity,
        saleStart: new Date(validatedData.saleStart),
        saleEnd: new Date(validatedData.saleEnd),
        maxPerUser: validatedData.maxPerUser || 5
      }
    });

    res.status(201).json({
      success: true,
      message: 'Ticket tier created successfully.',
      data: { ticketType }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return next(new AppError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    }
    next(error);
  }
};

const updateTicketType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = ticketTypeSchema.partial().parse(req.body);

    const ticket = await prisma.ticketType.findUnique({ where: { id } });
    if (!ticket) {
      return next(new AppError('Ticket tier not found.', 404, 'TICKET_NOT_FOUND'));
    }

    const updated = await prisma.ticketType.update({
      where: { id },
      data: {
        name: validatedData.name,
        price: validatedData.price,
        description: validatedData.description
      }
    });

    res.status(200).json({
      success: true,
      message: 'Ticket tier updated successfully.',
      data: { ticketType: updated }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addTicketType,
  updateTicketType
};
