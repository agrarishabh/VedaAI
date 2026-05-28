import mongoose from 'mongoose';
import { env } from './env.js';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export async function connectDB(): Promise<void> {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ MongoDB connected successfully');

      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err.message);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
      });

      return;
    } catch (error) {
      retries++;
      const err = error instanceof Error ? error.message : String(error);
      console.error(`❌ MongoDB connection attempt ${retries}/${MAX_RETRIES} failed: ${err}`);

      if (retries < MAX_RETRIES) {
        console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  console.error('❌ Failed to connect to MongoDB after maximum retries. Exiting.');
  process.exit(1);
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected gracefully');
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('❌ Error disconnecting MongoDB:', err);
  }
}
