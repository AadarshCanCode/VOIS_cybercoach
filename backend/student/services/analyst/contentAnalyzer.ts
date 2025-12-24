
// Logging utility for content analyzer
const log = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [Analyst:Content] ${message}`, data !== undefined ? JSON.stringify(data) : '');
};

export interface AnalysisResult {
    redFlags: string[];
    greenFlags: string[];
    category: 'SUSPICIOUS' | 'LEGIT_CANDIDATE' | 'NEUTRAL';
    flagScore: number; // -100 to 100
}

const RED_FLAG_TERMS = [
    'registration fee', 'training fee', 'security deposit', 'payment required',
    'pay to work', 'unpaid training', 'buy our course', '100% placement guarantee',
    'offer letter charge', 'laptop security fee', 'certification cost',
    'pay before joining', 'document fee', 'processing fee', 'joining fee'
];

const GREEN_FLAG_TERMS = [
    'stipend', 'salary', 'ctc', 'health insurance', 'provident fund', 'employees',
    'career', 'job description', 'requirements', 'responsibilities', 'perks',
    'allowance', 'paid leave', 'benefits', 'team', 'office', 'interview process',
    'work culture', 'about us', 'our company', 'founded', 'headquarters',
    'linkedin', 'glassdoor', 'experience required', 'skills required'
];

export const analyzeContent = (text: string): AnalysisResult => {
    log('Starting content analysis', { textLength: text.length });
    const normalizedText = text.toLowerCase();

    const redFlags: string[] = [];
    const greenFlags: string[] = [];

    // Simple keyword matching (enhanced with basic NLP normalization via compromise if needed, 
    // but direct matching is often more reliable for specific phrases)

    RED_FLAG_TERMS.forEach(term => {
        if (normalizedText.includes(term)) {
            redFlags.push(term);
        }
    });

    GREEN_FLAG_TERMS.forEach(term => {
        if (normalizedText.includes(term)) {
            greenFlags.push(term);
        }
    });

    log('Flags detected', { redFlags, greenFlags });

    // Calculate score - balanced weights
    // Green flags: +15 each (increased from 10)
    // Red flags: -20 each (reduced from 25)
    const score = (greenFlags.length * 15) - (redFlags.length * 20);

    let category: AnalysisResult['category'] = 'NEUTRAL';
    if (redFlags.length > 0 || score < -10) category = 'SUSPICIOUS';
    else if (greenFlags.length > 2 && score > 15) category = 'LEGIT_CANDIDATE'; // Lowered threshold from 20

    const result = {
        redFlags,
        greenFlags,
        category,
        flagScore: Math.max(-100, Math.min(100, score))
    };
    
    log('Analysis complete', result);
    return result;
};
