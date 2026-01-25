import { Router, Request, Response } from 'express';
import { getStudentDashboardSummary } from '../services/studentService.js';
import { markLabAsCompleted, getLabStats, isLabCompleted } from '../services/labService.js';
import trackingRoutes from './trackingRoutes.js';
import labSyncRoutes from './labSyncRoutes.js';
import assessmentRoutes from './assessmentRoutes.js';
import supportRoutes from './supportRoutes.js';
import { authenticateUser, AuthenticatedRequest } from '../../../shared/middleware/auth.js';
import { validateObjectId } from '../../../shared/middleware/validation.js';
import { Course } from '../../../shared/models/Course.js';
import { logger } from '../../../shared/lib/logger.js';

const router = Router();

router.use('/track', trackingRoutes);
router.use('/labs', labSyncRoutes);
router.use('/assessment', assessmentRoutes);
router.use('/support', supportRoutes);

router.get('/overview', authenticateUser, (_req: Request, res: Response): void => {
  const summary = getStudentDashboardSummary();
  res.json(summary);
});

// -- Courses --
router.get('/courses', async (_req: Request, res: Response) => {
  try {
    const courses = await Course.find({ published: true }).select('-teacherEmail');
    res.json(courses);
  } catch (error) {
    logger.error('Error fetching courses', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

router.get('/courses/:id', validateObjectId('id'), async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    logger.error('Error fetching course', error instanceof Error ? error : new Error(String(error)), { courseId: id });
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Lab endpoints - require authentication
router.post('/labs/:labId/complete', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { labId } = req.params;
    const studentId = req.user?.id;
    const authClient = req.supabase;

    if (!studentId || !authClient) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!labId || typeof labId !== 'string' || labId.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid labId' });
    }

    const completion = await markLabAsCompleted(authClient, studentId, labId.trim());
    res.json({
      success: true,
      message: `Lab ${labId} marked as completed`,
      completion,
    });
  } catch (error) {
    logger.error('Error marking lab as completed', error instanceof Error ? error : new Error(String(error)), {
      labId: req.params.labId,
      studentId: req.user?.id
    });
    res.status(500).json({ error: 'Failed to mark lab as completed' });
  }
});

router.get('/labs/stats', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    const authClient = req.supabase;

    if (!studentId || !authClient) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await getLabStats(authClient, studentId);
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching lab stats', error instanceof Error ? error : new Error(String(error)), {
      studentId: req.user?.id
    });
    res.status(500).json({ error: 'Failed to fetch lab stats' });
  }
});

router.get('/labs/:labId/status', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { labId } = req.params;
    const studentId = req.user?.id;
    const authClient = req.supabase;

    if (!studentId || !authClient) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!labId || typeof labId !== 'string' || labId.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid labId' });
    }

    const completed = await isLabCompleted(authClient, studentId, labId.trim());
    res.json({
      labId,
      completed,
      studentId,
    });
  } catch (error) {
    logger.error('Error fetching lab status', error instanceof Error ? error : new Error(String(error)), {
      labId: req.params.labId,
      studentId: req.user?.id
    });
    res.status(500).json({ error: 'Failed to fetch lab status' });
  }
});

export default router;
