import express from 'express';
import Groq from 'groq-sdk';
import 'dotenv/config';
import rateLimit from 'express-rate-limit';



const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });



// Strict Limit for AI: 10 requests per 15 minutes
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'To conserve neural resources, AI access is limited. Please wait a few minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.use(aiLimiter);

router.post('/ask', async (req, res) => {
    try {
        console.log("AI Chat Request received");
        if (!process.env.GROQ_API_KEY) {
            console.error("CRITICAL: GROQ_API_KEY is missing in backend env!");
        } else {
            console.log("GROQ_API_KEY loaded:", process.env.GROQ_API_KEY.substring(0, 10) + "...");
        }

        const { question, context } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        const systemPrompt = `You are an elite Cybersecurity Instructor for the "Verified Operator" training program. 
    Your strict directive is to ONLY answer questions related to Web Application Security, Ethical Hacking, and Cyber Defense.
    
    If a user asks about anything else (cooking, politics, general life), STERNLY REFUSE and remind them to focus on the mission.
    
    Current Module Context: ${context || 'General Web Security'}
    
    Keep answers concise, technical yet accessible, and professional. Use "Operator" to address the user.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: question }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 500,
        });

        const answer = chatCompletion.choices[0]?.message?.content || 'Transmission failed. Try again.';

        res.json({ answer });
    } catch (error: any) {
        console.error('Groq API Error Details:', error?.response?.data || error.message || error);
        res.status(500).json({ error: 'Failed to contact AI Command.' });
    }
});

export default router;
