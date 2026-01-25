import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../../../shared/middleware/auth.js';
import { authenticateUser } from '../../../shared/middleware/auth.js';
import { logger } from '../../../shared/lib/logger.js';
import { supabase } from '../../../shared/lib/supabase.js';

const router = Router();

interface QuizSubmission {
    moduleId: string;
    answers: Record<string, number>; // questionId (or index) -> selectedOptionIndex
    proctoringSessionId?: string;
}

// Helper to check MongoDB for violations (Stub - assuming Mongo connection availability)
// In a real scenario, we'd import the ProctoringLog model here.
// For now, we'll trust the client to send the session ID, and separate service can async verify.
/* 
import { ProctoringLog } from '../models/ProctoringLog';
async function countViolations(attemptId: string): Promise<number> {
    if (!attemptId) return 0;
    try {
        return await ProctoringLog.countDocuments({ attemptId });
    } catch { return 0; }
}
*/

router.post('/submit', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const studentId = req.user?.id;
        const { moduleId, answers, proctoringSessionId } = req.body as QuizSubmission;
        const authClient = req.supabase || supabase;

        if (!studentId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!moduleId || !answers) {
            return res.status(400).json({ error: 'Missing moduleId or answers' });
        }

        // 1. Fetch the Quiz correctly (Securely from DB)
        // We need the correct options to grade against
        const { data: quizzes, error: quizError } = await authClient
            .from('quizzes')
            .select('id, correct_option, question')
            .eq('module_id', moduleId);

        if (quizError || !quizzes || quizzes.length === 0) {
            logger.error('Quiz lookup failed', quizError || new Error('No questions found'), { moduleId });
            return res.status(404).json({ error: 'Quiz not found for this module' });
        }

        // 2. Grade the Submission
        let correctCount = 0;
        const details: any[] = [];

        quizzes.forEach(q => {
            // answers keys might be indices or question IDs depending on frontend impl.
            // Assuming frontend sends { "question_id_uuid": index }
            const submittedAnswer = answers[q.id];
            const isCorrect = submittedAnswer === q.correct_option;

            if (isCorrect) correctCount++;

            details.push({
                questionId: q.id,
                correct: isCorrect,
                submitted: submittedAnswer
            });
        });

        const score = Math.round((correctCount / quizzes.length) * 100);
        const passed = score >= 70; // 70% passing threshold

        // 3. (Optional) Check Proctoring Violations
        // const violationCount = await countViolations(proctoringSessionId);
        const violationCount = 0; // Placeholder until Mongo integration is wired in this route

        // 4. Store Attempt in Postgres
        const { data: attempt, error: attemptError } = await authClient
            .from('quiz_attempts')
            .insert({
                student_id: studentId,
                module_id: moduleId,
                score,
                passed,
                answers, // Storing raw answers for review
                proctoring_session_id: proctoringSessionId,
                violation_count: violationCount
            })
            .select()
            .single();

        if (attemptError) {
            logger.error('Failed to save quiz attempt', attemptError, { studentId, moduleId });
            throw attemptError;
        }

        // 5. If Passed, Mark Module as Completed
        if (passed) {
            // Check existence first
            const { data: existingProgress } = await authClient
                .from('module_progress')
                .select('id')
                .eq('student_id', studentId)
                .eq('module_id', moduleId)
                .maybeSingle();

            if (existingProgress) {
                await authClient
                    .from('module_progress')
                    .update({ completed: true, completed_at: new Date().toISOString() })
                    .eq('id', existingProgress.id);
            } else {
                await authClient
                    .from('module_progress')
                    .insert({
                        student_id: studentId,
                        module_id: moduleId,
                        completed: true,
                        completed_at: new Date().toISOString()
                    });
            }
        }

        logger.info('Quiz submitted', { studentId, moduleId, score, passed });

        res.json({
            success: true,
            score,
            passed,
            attemptId: attempt.id,
            totalQuestions: quizzes.length,
            correctCount
        });

    } catch (error) {
        logger.error('Quiz submission error', error instanceof Error ? error : new Error(String(error)));
        res.status(500).json({ error: 'Internal server error processing submission' });
    }
});

export default router;
