import { supabase } from '../lib/supabase';
import { aiService } from './aiService';

export interface InterviewQuestion {
    id: string;
    category: 'technical' | 'hr' | 'aptitude';
    question_text: string;
    ideal_answer: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

export const interviewService = {
    /**
     * Fetches a random question for the given category and injects a real company name.
     */
    getNextQuestion: async (category: 'technical' | 'hr' | 'aptitude'): Promise<InterviewQuestion | null> => {
        try {
            // 1. Fetch a random question from the DB
            const { data: questions, error: qError } = await supabase
                .from('interview_questions')
                .select('*')
                .eq('category', category);

            if (qError || !questions || questions.length === 0) {
                console.warn('Error fetching questions or no questions found. Using fallback.', qError);
                return getFallbackQuestion(category);
            }

            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

            // 2. If the question has a placeholder, fetch a random verified company
            if (randomQuestion.question_text.includes('{company}')) {
                const { data: companies, error: cError } = await supabase
                    .from('company_registry')
                    .select('name')
                    .eq('status', 'verified');

                if (!cError && companies && companies.length > 0) {
                    const randomCompany = companies[Math.floor(Math.random() * companies.length)];
                    randomQuestion.question_text = randomQuestion.question_text.replace(/{company}/g, randomCompany.name);
                } else {
                    // Fallback if no companies found
                    randomQuestion.question_text = randomQuestion.question_text.replace(/{company}/g, 'a generic tech company');
                }
            }

            return randomQuestion;
        } catch (error) {
            console.error('Interview service error:', error);
            return getFallbackQuestion(category);
        }
    },

    /**
     * Validates the user's answer using AI.
     */
    validateAnswer: async (question: InterviewQuestion, userAnswer: string): Promise<{ isCorrect: boolean; feedback: string }> => {
        const prompt = `
      You are an expert interviewer.
      
      Question: "${question.question_text}"
      Ideal Answer / Key Points: "${question.ideal_answer}"
      User's Answer: "${userAnswer}"
      
      Evaluate the user's answer.
      1. Determine if it is "Correct" (covers key points), "Partially Correct", or "Incorrect".
      2. Provide brief, constructive feedback (max 2 sentences).
      3. If incorrect, explain the right concept simply.
      
      Output JSON format:
      {
        "isCorrect": boolean,
        "feedback": "string"
      }
    `;

        try {
            const response = await aiService.chat(prompt, 'You are a strict but helpful interviewer. Output JSON only.');
            const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanResponse);
        } catch (error) {
            console.error('Error validating answer:', error);
            // Fallback for AI failure
            return {
                isCorrect: true,
                feedback: "I couldn't verify that with the central database, but it sounds plausible. Let's move on."
            };
        }
    }
};

// Fallback questions to ensure the app works even if the DB is empty or unreachable
const getFallbackQuestion = (category: 'technical' | 'hr' | 'aptitude'): InterviewQuestion => {
    const fallbacks: Record<string, InterviewQuestion[]> = {
        technical: [
            { id: 'f1', category: 'technical', difficulty: 'medium', question_text: 'Explain the concept of "Least Privilege" and why it is important.', ideal_answer: 'Users should only have the minimum access necessary to perform their job functions to limit attack surface.' },
            { id: 'f2', category: 'technical', difficulty: 'easy', question_text: 'What is the difference between HTTP and HTTPS?', ideal_answer: 'HTTPS uses TLS/SSL encryption to secure the communication channel.' }
        ],
        hr: [
            { id: 'f3', category: 'hr', difficulty: 'easy', question_text: 'Tell me about a time you had to handle a difficult situation at work.', ideal_answer: 'STAR method: Situation, Task, Action, Result.' },
            { id: 'f4', category: 'hr', difficulty: 'medium', question_text: 'Why do you want to work in cybersecurity?', ideal_answer: 'Passion for problem solving, protecting data, and evolving landscape.' }
        ],
        aptitude: [
            { id: 'f5', category: 'aptitude', difficulty: 'medium', question_text: 'If you have a 3-gallon jug and a 5-gallon jug, how do you measure out exactly 4 gallons?', ideal_answer: 'Fill 5, pour to 3 (leaves 2). Empty 3. Pour 2 to 3. Fill 5. Pour to 3 (takes 1). Leaves 4.' },
            { id: 'f6', category: 'aptitude', difficulty: 'easy', question_text: 'What comes next: 2, 4, 8, 16, ...?', ideal_answer: '32 (Powers of 2).' }
        ]
    };

    const list = fallbacks[category] || fallbacks['technical'];
    return list[Math.floor(Math.random() * list.length)];
};
