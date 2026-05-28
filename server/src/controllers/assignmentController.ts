import type { Request, Response } from 'express';
import { z } from 'zod';
import { Assignment } from '../models/Assignment.js';
import { generationQueue } from '../queues/generationQueue.js';
import { redis } from '../config/redis.js';

const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subject: z.string().min(1, 'Subject is required').max(100),
  grade: z.string().min(1, 'Grade is required').max(50),
  dueDate: z.string().or(z.date()).transform((val) => new Date(val)),
  duration: z.number().int().min(1, 'Duration must be at least 1 minute'),
  totalMarks: z.number().int().min(1, 'Total marks must be at least 1'),
  questionTypes: z
    .array(z.enum(['mcq', 'short_answer', 'long_answer', 'true_false']))
    .min(1, 'At least one question type is required'),
  numberOfQuestions: z.number().int().min(1, 'Must have at least 1 question'),
  difficultyDistribution: z.object({
    easy: z.number().min(0).max(100),
    medium: z.number().min(0).max(100),
    hard: z.number().min(0).max(100),
  }),
  additionalInstructions: z.string().optional(),
  uploadedContent: z.string().optional(),
});

export async function createAssignment(req: Request, res: Response): Promise<void> {
  try {
    const validation = createAssignmentSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const data = validation.data;

    // Validate difficulty distribution sums to 100
    const totalDistribution =
      data.difficultyDistribution.easy +
      data.difficultyDistribution.medium +
      data.difficultyDistribution.hard;

    if (totalDistribution !== 100) {
      res.status(400).json({
        success: false,
        error: 'Difficulty distribution must sum to 100',
        details: { totalDistribution },
      });
      return;
    }

    // Create assignment in MongoDB
    const assignment = new Assignment({
      ...data,
      status: 'pending',
    });

    await assignment.save();
    console.log(`📝 Assignment created: ${assignment._id}`);

    // Add job to BullMQ queue
    const job = await generationQueue.add(
      'generate-questions',
      { assignmentId: assignment._id.toString() },
      {
        jobId: `gen-${assignment._id.toString()}`,
      }
    );

    // Update assignment with jobId
    assignment.jobId = job.id;
    await assignment.save();

    console.log(`📋 Job ${job.id} added to queue for assignment ${assignment._id}`);

    res.status(201).json({
      success: true,
      data: {
        assignmentId: assignment._id,
        jobId: job.id,
        status: assignment.status,
        message: 'Assignment created and queued for processing',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Error creating assignment:', message);
    res.status(500).json({
      success: false,
      error: 'Failed to create assignment',
      message,
    });
  }
}

export async function getAssignment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: false, error: 'Assignment ID is required' });
      return;
    }

    // Check Redis cache first
    const cacheKey = `assignment:${id}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log(`📦 Cache hit for assignment ${id}`);
      res.status(200).json({
        success: true,
        data: JSON.parse(cached),
        source: 'cache',
      });
      return;
    }

    // Fallback to MongoDB
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }

    // Cache for future requests if completed
    if (assignment.status === 'completed') {
      await redis.setex(cacheKey, 3600, JSON.stringify(assignment.toObject()));
    }

    res.status(200).json({
      success: true,
      data: assignment.toObject(),
      source: 'database',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Error fetching assignment:', message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignment',
      message,
    });
  }
}

export async function getAllAssignments(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const [assignments, total] = await Promise.all([
      Assignment.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Assignment.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: assignments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Error fetching assignments:', message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignments',
      message,
    });
  }
}

export async function regenerateAssignment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: false, error: 'Assignment ID is required' });
      return;
    }

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }

    // Reset assignment for regeneration
    assignment.status = 'pending';
    assignment.generatedPaper = undefined;
    assignment.jobId = undefined;
    await assignment.save();

    // Invalidate cache
    const cacheKey = `assignment:${id}`;
    await redis.del(cacheKey);

    // Add new job to queue
    const job = await generationQueue.add(
      'generate-questions',
      { assignmentId: assignment._id.toString() },
      {
        jobId: `regen-${assignment._id.toString()}-${Date.now()}`,
      }
    );

    assignment.jobId = job.id;
    await assignment.save();

    console.log(`🔄 Regeneration job ${job.id} added for assignment ${id}`);

    res.status(200).json({
      success: true,
      data: {
        assignmentId: assignment._id,
        jobId: job.id,
        status: assignment.status,
        message: 'Assignment queued for regeneration',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Error regenerating assignment:', message);
    res.status(500).json({
      success: false,
      error: 'Failed to regenerate assignment',
      message,
    });
  }
}
