const aiService = require('../services/aiService');
const AppError = require('../utils/appError');

const generateDescription = async (req, res, next) => {
  try {
    const { topic, targetAudience, duration } = req.body;
    if (!topic) {
      return next(new AppError('Topic is required for AI generation.', 400, 'MISSING_TOPIC'));
    }

    const aiData = await aiService.generateEventDetails({ topic, targetAudience, duration });

    res.status(200).json({
      success: true,
      message: 'AI event details generated successfully.',
      data: aiData
    });
  } catch (error) {
    next(error);
  }
};

const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const recommendations = await aiService.getAIRecommendations(userId);

    res.status(200).json({
      success: true,
      data: { recommendations }
    });
  } catch (error) {
    next(error);
  }
};

const chatWithAI = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) {
      return next(new AppError('Chat query string is required.', 400, 'MISSING_QUERY'));
    }

    const chatResponse = await aiService.processAIChatbotQuery(query);

    res.status(200).json({
      success: true,
      data: chatResponse
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateDescription,
  getRecommendations,
  chatWithAI
};
