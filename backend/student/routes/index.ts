import { Router, Request, Response } from 'express';
import { getStudentDashboardSummary } from '../services/studentService.js';
import { verifyCompanyController } from '../controllers/verificationController.js';
import { getScrapedJobs } from '../services/jobService.js';

const router = Router();

router.get('/overview', (_req: Request, res: Response): void => {
  const summary = getStudentDashboardSummary();
  res.json(summary);
});

router.get('/jobs', async (_req: Request, res: Response) => {
  const jobs = await getScrapedJobs();
  res.json(jobs);
});

router.post('/verify-company', verifyCompanyController);

export default router;
