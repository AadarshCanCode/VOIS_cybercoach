import { Router, Request, Response } from 'express';
import { getTeacherDashboardOverview } from '../services/teacherService.js';

const router = Router();

router.get('/overview', (_req: Request, res: Response): void => {
  const overview = getTeacherDashboardOverview();
  res.json(overview);
});

export default router;
