import { Router, Request, Response } from 'express';
import { getAdminStatus } from '../services/proxyService.js';
import { checkModelAvailability } from '../services/modelCheckService.js';
import { recordProctorLog } from '../services/proctoringService.js';

const router = Router();

router.get('/status', (_req: Request, res: Response): void => {
  res.json(getAdminStatus());
});

router.get('/models', (_req: Request, res: Response): void => {
  try {
    const availability = checkModelAvailability();
    res.json(availability);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

router.post('/proctor/logs', (req: Request, res: Response): void => {
  try {
    const result = recordProctorLog(req.body);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ ok: false, error: message });
  }
});

export default router;
