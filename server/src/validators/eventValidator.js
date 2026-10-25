const { z } = require('zod');

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  eventType: z.enum(['ONLINE', 'OFFLINE', 'HYBRID']).default('OFFLINE'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date' }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date' }),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  capacity: z.number().int().positive('Capacity must be positive'),
  bannerImage: z.string().url('Invalid banner image URL').or(z.string().min(1)),
  images: z.array(z.string()).optional().default([]),
  refundPolicyDays: z.number().int().nonnegative().optional().default(7),
  refundPolicyPercent: z.number().int().min(0).max(100).optional().default(100),
  contactEmail: z.string().email('Invalid contact email'),
  contactPhone: z.string().optional(),
  venue: z.object({
    name: z.string().min(2),
    address: z.string().min(2),
    city: z.string().min(2),
    state: z.string().min(2),
    country: z.string().min(2),
    zipCode: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional()
  }).optional()
});

const ticketTypeSchema = z.object({
  name: z.string().min(2, 'Ticket name is required'),
  description: z.string().optional(),
  price: z.number().nonnegative('Price cannot be negative'),
  quantity: z.number().int().positive('Quantity must be positive'),
  saleStart: z.string(),
  saleEnd: z.string(),
  maxPerUser: z.number().int().positive().optional().default(5)
});

module.exports = {
  eventSchema,
  ticketTypeSchema
};
