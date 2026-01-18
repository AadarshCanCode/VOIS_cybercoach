import { Router, Request, Response } from 'express';
import { getStudentDashboardSummary } from '../services/studentService.js';
// Imports removed
import { markLabAsCompleted, getLabStats, isLabCompleted } from '../services/labService.js';

const router = Router();

router.get('/overview', (_req: Request, res: Response): void => {
  const summary = getStudentDashboardSummary();
  res.json(summary);
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
