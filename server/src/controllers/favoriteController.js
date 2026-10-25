const prisma = require('../config/db');

const toggleFavorite = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_eventId: { userId, eventId }
      }
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { userId_eventId: { userId, eventId } }
      });
      return res.status(200).json({
        success: true,
        message: 'Event removed from saved favorites.',
        isFavorite: false
      });
    }

    await prisma.favorite.create({
      data: { userId, eventId }
    });

    res.status(200).json({
      success: true,
      message: 'Event added to saved favorites! ❤️',
      isFavorite: true
    });
  } catch (error) {
    next(error);
  }
};

const getMyFavorites = async (req, res, next) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        event: {
          include: {
            category: true,
            venue: true,
            ticketTypes: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: { favorites: favorites.map(f => f.event) }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleFavorite,
  getMyFavorites
};
