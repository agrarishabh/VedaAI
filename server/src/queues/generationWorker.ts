import { Worker, Job } from 'bullmq';
import type { Server as SocketIOServer } from 'socket.io';
import { getBullMQConnection } from '../config/redis.js';
import { Assignment } from '../models/Assignment.js';
import { buildPrompt } from '../services/promptBuilder.js';
import { generateQuestions } from '../services/aiService.js';
import { redis } from '../config/redis.js';

interface GenerationJobData {
  assignmentId: string;
}

export function createWorker(io: SocketIOServer): Worker<GenerationJobData> {
  const worker = new Worker<GenerationJobData>(
    'question-generation',
    async (job: Job<GenerationJobData>) => {
      const { assignmentId } = job.data;
      console.log(`🔄 Processing job ${job.id} for assignment ${assignmentId}`);

      try {
        // Step 1: Fetch assignment
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
          throw new Error(`Assignment ${assignmentId} not found`);
        }

        // Step 2: Update status to processing
        assignment.status = 'processing';
        await assignment.save();

        io.to(assignmentId).emit('generation:progress', {
          assignmentId,
          step: 'processing',
          message: 'Assignment is being processed...',
          progress: 10,
        });

        // Step 3: Build prompt
        io.to(assignmentId).emit('generation:progress', {
          assignmentId,
          step: 'building_prompt',
          message: 'Building AI prompt...',
          progress: 25,
        });

        const prompt = buildPrompt(assignment.toObject());

        // Step 4: Generate questions via AI
        io.to(assignmentId).emit('generation:progress', {
          assignmentId,
          step: 'generating',
          message: 'Generating questions with AI...',
          progress: 50,
        });

        const generatedPaper = await generateQuestions(prompt);

        // Step 5: Save to database
        io.to(assignmentId).emit('generation:progress', {
          assignmentId,
          step: 'saving',
          message: 'Saving generated paper...',
          progress: 85,
        });

        assignment.generatedPaper = generatedPaper;
        assignment.status = 'completed';
        await assignment.save();

        // Step 6: Cache result in Redis (1 hour TTL)
        const cacheKey = `assignment:${assignmentId}`;
        await redis.setex(cacheKey, 3600, JSON.stringify(assignment.toObject()));

        // Step 7: Emit completion
        console.log(`📨 Emitting generation:complete to room ${assignmentId}`);
        io.to(assignmentId).emit('generation:complete', {
          paper: generatedPaper,
        });

        console.log(`✅ Job ${job.id} completed for assignment ${assignmentId}`);
        return { success: true, assignmentId };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`❌ Job ${job.id} failed for assignment ${assignmentId}:`, message);

        // Update assignment status to failed
        try {
          await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
        } catch (dbError) {
          console.error('❌ Failed to update assignment status:', dbError);
        }

        // Emit failure event
        console.log(`📨 Emitting generation:failed to room ${assignmentId}`);
        io.to(assignmentId).emit('generation:failed', {
          error: message,
        });

        throw error; // Re-throw so BullMQ handles the retry
      }
    },
    {
      connection: getBullMQConnection(),
      concurrency: 3,
      limiter: {
        max: 5,
        duration: 60000, // 5 jobs per minute max
      },
    }
  );

  worker.on('completed', (job: Job<GenerationJobData>) => {
    console.log(`✅ Worker: Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job: Job<GenerationJobData> | undefined, error: Error) => {
    console.error(`❌ Worker: Job ${job?.id ?? 'unknown'} failed:`, error.message);
  });

  worker.on('error', (error: Error) => {
    console.error('❌ Worker error:', error.message);
  });

  console.log('✅ BullMQ generation worker started');
  return worker;
}
