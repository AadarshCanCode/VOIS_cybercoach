import { Router, Request, Response } from 'express';
import { getStudentDashboardSummary } from '../services/studentService.js';

const router = Router();

router.get('/overview', (_req: Request, res: Response): void => {
  const summary = getStudentDashboardSummary();
  res.json(summary);
});

export default router;
