import { Router, type Request, type Response } from 'express';
import nodemailer from 'nodemailer';
import { logger } from '../../../shared/lib/logger.js';

const router = Router();

// Endpoint to report a bug
router.post('/report-bug', async (req: Request, res: Response) => {
    const { description, studentName, studentEmail } = req.body;

    if (!description) {
        return res.status(400).json({ error: 'Description is required' });
    }

    try {
        // Basic validation of environment variables
        const user = process.env.GMAIL_USER;
        const pass = process.env.GMAIL_PASS;

        if (!user || !pass) {
            logger.warn('SMTP credentials not configured. Bug report will be logged but not emailed.');
            logger.info(`BUG REPORT from ${studentName || 'Anonymous'} (${studentEmail || 'N/A'}): ${description}`);
            return res.json({
                success: true,
                message: 'Bug report received (Logged). Note: SMTP not configured for email sending.'
            });
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: user,
                pass: pass,
            },
        });

        const mailOptions = {
            from: user,
            to: 'smartgaurd123@gmail.com',
            subject: `CyberCoach Bug Report: ${studentName || 'Anonymous'}`,
            text: `
        Student: ${studentName || 'Anonymous'}
        Email: ${studentEmail || 'N/A'}
        
        Problem Description:
        ${description}
      `,
        };

        await transporter.sendMail(mailOptions);
        logger.info(`Bug report sent to smartgaurd123@gmail.com from ${studentEmail || 'Anonymous'}`);

        res.json({ success: true, message: 'Bug report sent successfully' });
    } catch (error) {
        logger.error('Failed to send bug report:', error instanceof Error ? error : new Error(String(error)));
        res.status(500).json({ error: 'Failed to send bug report' });
    }
});

export default router;
