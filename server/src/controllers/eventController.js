const prisma = require('../config/db');
const AppError = require('../utils/appError');
const { eventSchema } = require('../validators/eventValidator');

const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
};

const getEvents = async (req, res, next) => {
  try {
    const {
      search,
      category,
      location,
      minPrice,
      maxPrice,
      eventType,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'startDate',
      order = 'asc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let where = {
      status: 'PUBLISHED'
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = {
        slug: category
      };
    }

    if (location) {
      where.venue = {
        city: { contains: location, mode: 'insensitive' }
      };
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (startDate) {
      where.startDate = { gte: new Date(startDate) };
    }

    if (endDate) {
      where.endDate = { lte: new Date(endDate) };
    }

    if (minPrice || maxPrice) {
      where.ticketTypes = {
        some: {
          price: {
            gte: minPrice ? parseFloat(minPrice) : undefined,
            lte: maxPrice ? parseFloat(maxPrice) : undefined
          }
        }
      };
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          category: true,
          venue: true,
          organizer: {
            select: { id: true, name: true, organizerProfile: true }
          },
          ticketTypes: {
            select: { id: true, name: true, price: true, availableQty: true }
          },
          reviews: {
            select: { rating: true }
          }
        },
        orderBy: { [sortBy]: order }
      }),
      prisma.event.count({ where })
    ]);

    // Attach starting price and average rating
    const processedEvents = events.map(evt => {
      const prices = evt.ticketTypes.map(t => t.price);
      const minP = prices.length ? Math.min(...prices) : 0;
      const ratings = evt.reviews.map(r => r.rating);
      const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '5.0';

      return {
        ...evt,
        startingPrice: minP,
        averageRating: parseFloat(avgRating),
        reviewCount: ratings.length
      };
    });

    res.status(200).json({
      success: true,
      data: {
        events: processedEvents,
        meta: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        category: true,
        venue: true,
        organizer: {
          select: { id: true, name: true, email: true, organizerProfile: true }
        },
        ticketTypes: true,
        speakers: {
          include: { speaker: true }
        },
        schedule: true,
        faqs: true,
        reviews: {
          include: { user: { select: { id: true, name: true, profileImage: true } } },
          orderBy: { createdAt: 'desc' }
        },
        polls: {
          include: { options: true }
        }
      }
    });

    if (!event) {
      return next(new AppError('Event not found.', 404, 'EVENT_NOT_FOUND'));
    }

    const ratings = event.reviews.map(r => r.rating);
    const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '5.0';

    res.status(200).json({
      success: true,
      data: {
        event: {
          ...event,
          averageRating: parseFloat(avgRating),
          reviewCount: ratings.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const validatedData = eventSchema.parse(req.body);

    const slug = createSlug(validatedData.title);

    let venueId = null;
    if (validatedData.venue) {
      const venue = await prisma.venue.create({
        data: validatedData.venue
      });
      venueId = venue.id;
    }

    const initialStatus = req.user.role === 'ADMIN' ? 'PUBLISHED' : 'PENDING_APPROVAL';

    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        slug,
        description: validatedData.description,
        shortDescription: validatedData.shortDescription || validatedData.description.substring(0, 150),
        categoryId: validatedData.categoryId,
        eventType: validatedData.eventType,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        capacity: validatedData.capacity,
        remainingCapacity: validatedData.capacity,
        bannerImage: validatedData.bannerImage,
        images: validatedData.images || [],
        refundPolicyDays: validatedData.refundPolicyDays,
        refundPolicyPercent: validatedData.refundPolicyPercent,
        contactEmail: validatedData.contactEmail,
        contactPhone: validatedData.contactPhone || null,
        organizerId: req.user.id,
        venueId,
        status: initialStatus
      },
      include: { category: true, venue: true }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATED_EVENT',
        entity: 'Event',
        entityId: event.id,
        metadata: { title: event.title }
      }
    });

    res.status(201).json({
      success: true,
      message: initialStatus === 'PUBLISHED' ? 'Event published successfully.' : 'Event submitted for admin approval.',
      data: { event }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return next(new AppError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    }
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = eventSchema.partial().parse(req.body);

    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) {
      return next(new AppError('Event not found.', 404, 'EVENT_NOT_FOUND'));
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        shortDescription: validatedData.shortDescription,
        categoryId: validatedData.categoryId,
        eventType: validatedData.eventType,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        bannerImage: validatedData.bannerImage,
        contactEmail: validatedData.contactEmail
      },
      include: { category: true, venue: true }
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      data: { event: updatedEvent }
    });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.eventCategory.findMany({
      include: {
        _count: { select: { events: true } }
      }
    });

    res.status(200).json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  getCategories
};
