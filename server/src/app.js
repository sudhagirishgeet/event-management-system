require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');

const routes = require('./routes');
const globalErrorHandler = require('./middleware/errorMiddleware');
const { generalLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');
const prisma = require('./config/db');

const app = express();
const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Security & Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(generalLimiter);
}

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Mounting API routes
app.use('/api/v1', routes);

// Socket.IO Real-time Channels (Community Chat & Live Polls)
io.on('connection', (socket) => {
  logger.info(`New WebSocket client connected: ${socket.id}`);

  socket.on('join_event_room', ({ eventId }) => {
    socket.join(`event_${eventId}`);
    logger.info(`Socket ${socket.id} joined room event_${eventId}`);
  });

  socket.on('send_message', async ({ eventId, userId, content }) => {
    try {
      const message = await prisma.message.create({
        data: { eventId, userId, content },
        include: { user: { select: { id: true, name: true, profileImage: true } } }
      });
      io.to(`event_${eventId}`).emit('new_message', message);
    } catch (err) {
      logger.error('Socket message error:', { error: err.message });
    }
  });

  socket.on('submit_vote', async ({ pollId, optionId, userId, eventId }) => {
    try {
      await prisma.$transaction([
        prisma.pollVote.create({ data: { pollId, optionId, userId } }),
        prisma.pollOption.update({ where: { id: optionId }, data: { voteCount: { increment: 1 } } })
      ]);
      const updatedPoll = await prisma.eventPoll.findUnique({
        where: { id: pollId },
        include: { options: true }
      });
      io.to(`event_${eventId}`).emit('poll_update', updatedPoll);
    } catch (err) {
      logger.error('Socket poll vote error:', { error: err.message });
    }
  });

  socket.on('disconnect', () => {
    logger.info(`WebSocket client disconnected: ${socket.id}`);
  });
});

// Centralized Error Handler
app.use(globalErrorHandler);

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    logger.info(`🚀 EventFlow Backend API & Socket Server running on port ${PORT}`);
  });
}

module.exports = app;
