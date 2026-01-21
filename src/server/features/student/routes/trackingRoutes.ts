import { Router, Response } from 'express';
import { ProctoringLog } from '../models/ProctoringLog.js';
import { StudentExperience } from '../models/StudentExperience.js';
import { validateProctoringEvent, validateExperienceSync } from '../../../shared/middleware/validation.js';
import { proctoringRateLimiter, experienceRateLimiter } from '../../../shared/middleware/rateLimit.js';
import { authenticateUser, AuthenticatedRequest } from '../../../shared/middleware/auth.js';
import { logger } from '../../../shared/lib/logger.js';

const router = Router();

// Ingest proctoring logs (used with sendBeacon or fetch)
router.post('/proctor/ingest',
    authenticateUser,
    proctoringRateLimiter,
    validateProctoringEvent,
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { courseId, attemptId, eventType, details } = req.body;
            const studentId = req.user?.id;

            if (!studentId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            // Sanitize inputs
            const sanitizedDetails = details && typeof details === 'object'
                ? JSON.parse(JSON.stringify(details)) // Deep clone to prevent prototype pollution
                : {};

            const log = new ProctoringLog({
                studentId,
                courseId: String(courseId).trim().substring(0, 200),
                attemptId: String(attemptId).trim().substring(0, 200),
                eventType,
                details: sanitizedDetails,
                timestamp: new Date()
            });

            await log.save();
            res.status(202).json({ success: true }); // 202 Accepted
        } catch (error) {
            logger.error('Proctoring Ingestion Error', error instanceof Error ? error : new Error(String(error)), {
                studentId: req.user?.id,
                eventType: req.body.eventType
            });
            res.status(500).json({ error: 'Failed to ingest log' });
        }
    }
);

// Update student experience (periodic heartbeat)
router.post('/experience/sync',
    authenticateUser,
    experienceRateLimiter,
    validateExperienceSync,
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { courseId, moduleStats, aiInteraction } = req.body;
            const studentId = req.user?.id;

            if (!studentId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            let experience = await StudentExperience.findOne({ studentId, courseId });

            if (!experience) {
                experience = new StudentExperience({ studentId, courseId, moduleStats: [] });
            }

            if (moduleStats) {
                const existingModule = experience.moduleStats.find(m => m.moduleId === moduleStats.moduleId);
                if (existingModule) {
                    // Use atomic operations to prevent race conditions
                    existingModule.timeSpent = (existingModule.timeSpent || 0) + (moduleStats.timeSpent || 0);
                    existingModule.scrollDepth = Math.max(existingModule.scrollDepth || 0, moduleStats.scrollDepth || 0);
                    existingModule.lastAccessed = new Date();
                } else {
                    experience.moduleStats.push({
                        moduleId: String(moduleStats.moduleId).trim(),
                        timeSpent: Math.max(0, moduleStats.timeSpent || 0),
                        scrollDepth: Math.max(0, Math.min(100, moduleStats.scrollDepth || 0)),
                        interactions: moduleStats.interactions || 0,
                        lastAccessed: new Date()
                    });
                }
            }

            if (aiInteraction && typeof aiInteraction === 'object' && !Array.isArray(aiInteraction)) {
                const sanitizedInteraction = {
                    query: String(aiInteraction.query || '').substring(0, 1000),
                    responseSnippet: String(aiInteraction.responseSnippet || '').substring(0, 1000),
                    timestamp: new Date()
                };
                experience.aiInteractions.push(sanitizedInteraction);
            }

            experience.updatedAt = new Date();
            await experience.save();

            res.json({ success: true });
        } catch (error) {
            logger.error('Experience Sync Error', error instanceof Error ? error : new Error(String(error)), {
                studentId: req.user?.id,
                courseId: req.body.courseId
            });
            res.status(500).json({ error: 'Failed to sync experience' });
        }
    }
);

export default router;
