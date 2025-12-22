
import nlp from 'compromise';
import natural from 'natural';

export interface AnalysisResult {
    redFlags: string[];
    greenFlags: string[];
    category: 'SUSPICIOUS' | 'LEGIT_CANDIDATE' | 'NEUTRAL';
    flagScore: number; // -100 to 100
}

const RED_FLAG_TERMS = [
    'registration fee', 'training fee', 'security deposit', 'payment required',
    'pay to work', 'unpaid training', 'buy our course', '100% placement guarantee',
    'offer letter charge', 'laptop security fee', 'certification cost'
];

const GREEN_FLAG_TERMS = [
    'stipend', 'salary', 'ctc', 'health insurance', 'provident fund', 'employees',
    'career', 'job description', 'requirements', 'responsibilities', 'perks',
    'allowance', 'paid leave'
];

export const analyzeContent = (text: string): AnalysisResult => {
    const doc = nlp(text);
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

    // Calculate score
    // Red flags are heavily penalized
    const score = (greenFlags.length * 10) - (redFlags.length * 25);

    let category: AnalysisResult['category'] = 'NEUTRAL';
    if (redFlags.length > 0 || score < -10) category = 'SUSPICIOUS';
    else if (greenFlags.length > 2 && score > 20) category = 'LEGIT_CANDIDATE';

    return {
        redFlags,
        greenFlags,
        category,
        flagScore: Math.max(-100, Math.min(100, score))
    };
};
