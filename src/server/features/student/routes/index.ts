import { Router, Request, Response } from 'express';
import { getStudentDashboardSummary } from '../services/studentService.js';
// Imports removed
import { markLabAsCompleted, getLabStats, isLabCompleted } from '../services/labService.js';
import trackingRoutes from './trackingRoutes.js';

import { Course } from '../../../shared/models/Course.js';

const router = Router();

router.use('/track', trackingRoutes);

router.get('/overview', (_req: Request, res: Response): void => {
  const summary = getStudentDashboardSummary();
  res.json(summary);
});

// -- Courses --
router.get('/courses', async (_req: Request, res: Response) => {
  try {
    const courses = await Course.find({ published: true }).select('-teacherEmail'); // Exclude teacher email if private
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

router.get('/courses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Determine if we should send modules (maybe only if enrolled? or public?)
    // For now, sending full course details as per previous behavior
    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Routes removed

// Lab endpoints
router.post('/labs/:labId/complete', (req: Request, res: Response) => {
  try {
    const { labId } = req.params;
    // In production, get studentId from authenticated user
    const studentId = req.body.studentId || 'demo-student';

    const completion = markLabAsCompleted(studentId, labId);
    res.json({
      success: true,
      message: `Lab ${labId} marked as completed`,
      completion,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark lab as completed' });
  }
});

router.get('/labs/stats', (req: Request, res: Response) => {
  try {
    // In production, get studentId from authenticated user
    const studentId = req.query.studentId as string || 'demo-student';

    const stats = getLabStats(studentId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lab stats' });
  }
});

router.get('/labs/:labId/status', (req: Request, res: Response) => {
  try {
    const { labId } = req.params;
    // In production, get studentId from authenticated user
    const studentId = req.query.studentId as string || 'demo-student';

    const completed = isLabCompleted(studentId, labId);
    res.json({
      labId,
      completed,
      studentId,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lab status' });
  }
});

export default router;
