import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { disconnectRedis } from './config/redis.js';
import { setupSocket } from './socket/socketHandler.js';
import { createWorker } from './queues/generationWorker.js';
import assignmentRoutes from './routes/assignment.js';
import type { Worker } from 'bullmq';

// Create Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'VedaAI server is running',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use('/api/assignments', assignmentRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
let worker: Worker | null = null;

async function start(): Promise<void> {
  try {
    // Connect to MongoDB
    await connectDB();

    // Setup Socket.io handlers
    setupSocket(io);

    // Create BullMQ worker
    worker = createWorker(io);

    // Start listening
    server.listen(env.PORT, () => {
      console.log(`🚀 VedaAI server running on port ${env.PORT}`);
      console.log(`📡 Environment: ${env.NODE_ENV}`);
      console.log(`🌐 Client URL: ${env.CLIENT_URL}`);
      console.log(`❤️  Health check: http://localhost:${env.PORT}/api/health`);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Failed to start server:', message);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(signal: string): Promise<void> {
  console.log(`\n📴 Received ${signal}. Starting graceful shutdown...`);

  try {
    // Close the worker
    if (worker) {
      console.log('⏳ Closing BullMQ worker...');
      await worker.close();
      console.log('✅ BullMQ worker closed');
    }

    // Close HTTP server
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('✅ HTTP server closed');

    // Close Socket.io
    await io.close();
    console.log('✅ Socket.io closed');

    // Disconnect from databases
    await disconnectDB();
    await disconnectRedis();

    console.log('✅ Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Error during shutdown:', message);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  shutdown('uncaughtException');
});

start();
