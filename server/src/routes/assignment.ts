import { Router } from 'express';
import {
  createAssignment,
  getAssignment,
  getAllAssignments,
  regenerateAssignment,
} from '../controllers/assignmentController.js';

const router = Router();

// POST /api/assignments — Create a new assignment and queue generation
router.post('/', createAssignment);

// GET /api/assignments — Get all assignments with pagination
router.get('/', getAllAssignments);

// GET /api/assignments/:id — Get a single assignment by ID
router.get('/:id', getAssignment);

// POST /api/assignments/:id/regenerate — Regenerate questions for an assignment
router.post('/:id/regenerate', regenerateAssignment);

export default router;
