import { Router, Request, Response } from 'express';
import { ProctoringLog } from '../models/ProctoringLog.js';
import { StudentExperience } from '../models/StudentExperience.js';

const router = Router();

// Ingest proctoring logs (used with sendBeacon or fetch)
router.post('/proctor/ingest', async (req: Request, res: Response) => {
    try {
        const { studentId, courseId, attemptId, eventType, details } = req.body;

        const log = new ProctoringLog({
            studentId,
            courseId,
            attemptId,
            eventType,
            details,
            timestamp: new Date()
        });

        await log.save();
        res.status(202).json({ success: true }); // 202 Accepted
    } catch (error) {
        console.error('Proctoring Ingestion Error:', error);
        res.status(500).json({ error: 'Failed to ingest log' });
    }
});

// Update student experience (periodic heartbeat)
router.post('/experience/sync', async (req: Request, res: Response) => {
    try {
        const { studentId, courseId, moduleStats, aiInteraction } = req.body;

        let experience = await StudentExperience.findOne({ studentId, courseId });

        if (!experience) {
            experience = new StudentExperience({ studentId, courseId, moduleStats: [] });
        }

        if (moduleStats) {
            const existingModule = experience.moduleStats.find(m => m.moduleId === moduleStats.moduleId);
            if (existingModule) {
                existingModule.timeSpent += (moduleStats.timeSpent || 0);
                existingModule.scrollDepth = Math.max(existingModule.scrollDepth, moduleStats.scrollDepth || 0);
                existingModule.lastAccessed = new Date();
            } else {
                experience.moduleStats.push(moduleStats);
            }
        }

        if (aiInteraction) {
            experience.aiInteractions.push(aiInteraction);
        }

        experience.updatedAt = new Date();
        await experience.save();

        res.json({ success: true });
    } catch (error) {
        console.error('Experience Sync Error:', error);
        res.status(500).json({ error: 'Failed to sync experience' });
    }
});

export default router;
