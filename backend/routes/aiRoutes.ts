import express from 'express';
import Groq from 'groq-sdk';
import 'dotenv/config';
import rateLimit from 'express-rate-limit';

import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const teacherGroq = new Groq({ apiKey: process.env.GROQ_API_KEY_TEACHER });

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_TEACHER || '');
const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });

// Teacher Module Generation - CHAIR STRATEGY (Groq -> Gemini -> Groq)
router.post('/generate-module', async (req, res) => {
    try {
        const { prompt, courseContext } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log(`[AI Chain] Starting generation for: "${prompt}"`);

        // --- STAGE 1: THE ARCHITECT (Groq) ---
        // Goal: Create a strong, logical outline
        console.log('[AI Chain] Stage 1: Generating Outline (Groq)...');
        const outlineSystemPrompt = `You are an expert instructional designer.
        Create a detailed, logical outline for a single course module about: "${prompt}".
        Context: ${courseContext || 'General'}.
        
        Output a strictly valid JSON object with this structure:
        {
            "title": "Module Title",
            "sections": ["Section 1 Title", "Section 2 Title", "Section 3 Title"],
            "key_takeaways": ["Takeaway 1", "Takeaway 2"]
        }`;

        const outlineCompletion = await teacherGroq.chat.completions.create({
            messages: [
                { role: 'system', content: outlineSystemPrompt },
                { role: 'user', content: 'Generate outline.' }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.5,
            response_format: { type: "json_object" }
        });

        const outlineRaw = outlineCompletion.choices[0]?.message?.content;
        if (!outlineRaw) throw new Error('Stage 1 failed: No outline generated');
        const outline = JSON.parse(outlineRaw);
        console.log('[AI Chain] Stage 1 Complete:', outline.title);


        // --- STAGE 2: THE PROFESSOR (Gemini) ---
        // Goal: Write rich, detailed content based on the outline
        console.log('[AI Chain] Stage 2: Expanding Content (Gemini)...');
        const contentPrompt = `You are a world-class Professor.
        Write a comprehensive, engaging lesson module based on this outline:
        
        Title: ${outline.title}
        Sections: ${outline.sections.join(', ')}
        Key Takeaways: ${outline.key_takeaways.join(', ')}
        
        Requirements:
        - Use clean Markdown formatting.
        - Be extremely detailed and educational.
        - Include real-world examples and analogies.
        - If technical, include code snippets (bracketed with \`\`\`).
        - Tone: Professional, encouraging, and authoritative.
        - LENGTH: Write at least 800 words. Go deep.`;

        let detailedContent = '';
        try {
            const geminiResult = await geminiModel.generateContent(contentPrompt);
            detailedContent = geminiResult.response.text();
            console.log('[AI Chain] Stage 2 Complete (Gemini). Content Length:', detailedContent.length);
        } catch (geminiError) {
            console.warn('⚠️ Gemini Failed (Stage 2). Falling back to Groq Llama 3.3...');

            // Fallback to Groq
            const fallbackCompletion = await teacherGroq.chat.completions.create({
                messages: [
                    { role: 'system', content: 'You are an expert professor. Write detailed, long-form content.' },
                    { role: 'user', content: contentPrompt }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.7,
                max_tokens: 4000
            });

            detailedContent = fallbackCompletion.choices[0]?.message?.content || '';
            if (!detailedContent) throw new Error('Stage 2 Fallback Failed: No content from Groq');
            console.log('[AI Chain] Stage 2 Complete (Groq Fallback). Content Length:', detailedContent.length);
        }


        const quizCount = req.body.quizCount || 3; // Default to 3 if not specified

        // ... [Stage 1 & 2 omitted for brevity, but we need to ensure the variable detailedContent is available] ...
        // Re-declaring Stage 3 with the new count logic

        // --- STAGE 3: THE EXAMINER (Groq) ---
        // Goal: Create quiz validation based on content
        console.log(`[AI Chain] Stage 3: Generating ${quizCount} Quiz Questions (Groq)...`);
        const quizSystemPrompt = `You are a strict exam creator.
        Read the following lesson content and generate EXACTLY ${quizCount} challenging multiple-choice questions.
        
        LESSON CONTENT:
        ${detailedContent.substring(0, 6000)}...

        Output strictly valid JSON with this structure:
        {
            "questions": [
                {
                    "question": "Question 1 string",
                    "options": ["A", "B", "C", "D"],
                    "correctAnswer": "Exact string of correct option"
                },
                ...
            ]
        }`;

        const quizCompletion = await teacherGroq.chat.completions.create({
            messages: [
                { role: 'system', content: quizSystemPrompt },
                { role: 'user', content: 'Generate quiz questions.' }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const quizRaw = quizCompletion.choices[0]?.message?.content;
        if (!quizRaw) throw new Error('Stage 3 failed: No quiz generated');
        const quizData = JSON.parse(quizRaw);
        console.log(`[AI Chain] Stage 3 Complete. Generated ${quizData.questions?.length} questions.`);

        // Final Return
        res.json({
            title: outline.title,
            content: detailedContent,
            quiz: quizData.questions // Return the array of questions
        });

    } catch (error: any) {
        console.error('AI Chain Error:', error);
        // Return the actual error message for debugging
        res.status(500).json({
            error: 'Failed to generate module content.',
            details: error?.message || 'Unknown error'
        });
    }
});

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
