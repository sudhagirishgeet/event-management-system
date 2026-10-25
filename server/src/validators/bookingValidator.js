const { z } = require('zod');

const createBookingSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  couponCode: z.string().optional(),
  items: z.array(
    z.object({
      ticketTypeId: z.string().uuid('Invalid ticket type ID'),
      quantity: z.number().int().positive('Quantity must be at least 1')
    })
  ).min(1, 'At least one ticket must be selected')
});

module.exports = {
  createBookingSchema
};
