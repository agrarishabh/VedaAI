import { Queue } from 'bullmq';
import { getBullMQConnection } from '../config/redis.js';

export const generationQueue = new Queue('question-generation', {
  connection: getBullMQConnection(),
  defaultJobOptions: {
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

generationQueue.on('error', (error: Error) => {
  console.error('❌ Generation queue error:', error.message);
});

console.log('✅ BullMQ generation queue initialized');
