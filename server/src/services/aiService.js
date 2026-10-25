const prisma = require('../config/db');
const logger = require('../utils/logger');

const generateEventDetails = async ({ topic, targetAudience, duration }) => {
  try {
    // In production with OPENAI_API_KEY, call OpenAI SDK / API.
    // Structured Fallback Generator for seamless out-of-the-box operation:
    const title = `${topic} — Masterclass & Summit 2026`;
    const description = `Join industry leaders and tech enthusiasts for an immersive ${duration || '1-day'} hands-on experience focusing on ${topic}. Designed specifically for ${targetAudience || 'professionals and students'}, this event covers cutting-edge trends, real-world case studies, interactive breakout sessions, and high-impact networking opportunities.`;
    const shortDescription = `Master ${topic} with top industry experts. Live sessions, networking, and hands-on workshops.`;
    const highlights = [
      `Deep dive into key concepts of ${topic}`,
      `Keynote talks by distinguished industry veterans`,
      `Interactive Q&A and networking lounge`,
      `Verified Certificate of Participation`
    ];
    const faqs = [
      { question: 'Who should attend this event?', answer: `This event is tailored for ${targetAudience || 'enthusiasts and professionals'} seeking to upgrade their knowledge.` },
      { question: 'Will recorded sessions be available?', answer: 'Yes, registered attendees will receive access to slide decks and recording links after the event.' }
    ];

    return {
      title,
      description,
      shortDescription,
      highlights,
      faqs
    };
  } catch (error) {
    logger.error('Error generating AI event details:', { error: error.message });
    throw error;
  }
};

const getAIRecommendations = async (userId) => {
  try {
    // Find active published events
    const events = await prisma.event.findMany({
      where: { status: 'PUBLISHED', startDate: { gte: new Date() } },
      take: 6,
      include: {
        category: true,
        venue: true,
        ticketTypes: true
      },
      orderBy: { isFeatured: 'desc' }
    });

    return events;
  } catch (error) {
    logger.error('Error fetching AI recommendations:', { error: error.message });
    return [];
  }
};

const processAIChatbotQuery = async (query) => {
  try {
    const q = query.toLowerCase();

    // Query real PostgreSQL database without hallucinating
    let whereCondition = { status: 'PUBLISHED' };

    if (q.includes('free')) {
      whereCondition.ticketTypes = { some: { price: 0 } };
    }
    
    // Find matching categories or locations in DB
    const matchingCategory = await prisma.eventCategory.findFirst({
      where: { name: { contains: q, mode: 'insensitive' } }
    });

    if (matchingCategory) {
      whereCondition.categoryId = matchingCategory.id;
    }

    const events = await prisma.event.findMany({
      where: whereCondition,
      take: 5,
      include: { category: true, venue: true, ticketTypes: true }
    });

    let replyMessage = `I found ${events.length} event(s) matching your request:`;
    if (events.length === 0) {
      replyMessage = `I couldn't find any upcoming events matching "${query}". Try exploring our top technology or music categories!`;
    }

    return {
      reply: replyMessage,
      events
    };
  } catch (error) {
    logger.error('Error in AI Chatbot query processing:', { error: error.message });
    throw error;
  }
};

module.exports = {
  generateEventDetails,
  getAIRecommendations,
  processAIChatbotQuery
};
