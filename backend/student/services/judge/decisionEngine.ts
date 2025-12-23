
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ScrapedData } from '../detective/webScraper.js';
import type { DomainIntel } from '../detective/domainIntel.js';
import type { ReputationResult } from '../detective/reputationCheck.js';
import type { AnalysisResult } from '../analyst/contentAnalyzer.js';
import dotenv from 'dotenv';

dotenv.config();

export interface Verdict {
    riskScore: number;
    verdict: 'SAFE' | 'CAUTION' | 'dANGER' | 'UNKNOWN';
    explanation: string;
    recommendation: string;
}

export const makeDecision = async (
    scraperData: ScrapedData | null,
    domainIntel: DomainIntel,
    reputation: ReputationResult,
    analysis: AnalysisResult
): Promise<Verdict> => {

    // 1. Heuristic Calculation
    let riskScore = 50; // Start Neutral
    const breakdown: string[] = [];

    // Factor: Domain Maturity
    if (domainIntel.ageDays) {
        if (domainIntel.ageDays < 60) {
            riskScore += 25;
            breakdown.push('Very recent domain registration');
        } else if (domainIntel.ageDays < 365) {
            riskScore += 10;
            breakdown.push('Relatively new domain');
        } else if (domainIntel.ageDays > 1000) {
            riskScore -= 15;
            breakdown.push('Well-established domain');
        }
    }

    // Factor: Reputation
    if (reputation.sentiment === 'negative') {
        riskScore += 40;
        breakdown.push('Negative online reputation detected');
    } else if (reputation.sentiment === 'positive') {
        riskScore -= 10;
        breakdown.push('Positive online reputation');
    }

    // Factor: Content Signals
    // flagScore is positive (good) or negative (bad)
    // Higher analysis.flagScore means safer.
    if (analysis.redFlags.length > 0) {
        riskScore += (analysis.redFlags.length * 15);
        breakdown.push(`Detected red flag terms: ${analysis.redFlags.join(', ')}`);
    }

    if (analysis.greenFlags.length > 0) {
        riskScore -= (analysis.greenFlags.length * 5);
        // Don't log green flags as reasons for "risk" but they help the score
    }

    // Factor: Scraper Failure
    if (!scraperData) {
        riskScore += 10;
        breakdown.push('Unable to scrape website content for deeper analysis');
    }

    // Final Clamp
    riskScore = Math.max(0, Math.min(100, riskScore));

    let verdict: Verdict['verdict'] = 'UNKNOWN';
    if (riskScore > 70) verdict = 'dANGER';
    else if (riskScore > 35) verdict = 'CAUTION';
    else verdict = 'SAFE';

    const explanation = breakdown.length > 0
        ? breakdown.join('. ') + '.'
        : `Heuristic score: ${riskScore}/100 based on standard signals.`;

    // 2. LLM Enhancement (if API key exists)
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && scraperData) {
        try {
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `
        Evaluate this company for "Internship Legitimacy". 
        Goal: Distinguish real internships from "Pay-to-apply" or "Paid Training" scams.

        Data Collected:
        - URL: ${scraperData.url}
        - Company Name: ${scraperData.name}
        - Domain Age in Days: ${domainIntel.ageDays || 'Unknown'}
        - Online Sentiment: ${reputation.sentiment} (${reputation.scamResults} hits for scam-related searches)
        - Red Flag Phrases Found: ${analysis.redFlags.join(', ') || 'None'}
        - Green Flag Phrases Found: ${analysis.greenFlags.join(', ') || 'None'}
        - Snippet: "${scraperData.bodyText.substring(0, 500)}..."

        Respond in flat JSON format:
        {
          "risk_score": (number 0-100),
          "verdict": "SAFE" | "CAUTION" | "DANGER",
          "short_explanation": "one or two sentences explaining the reasoning",
          "recommendation": "e.g. Apply, Proceed with caution, Avoid"
        }
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text().trim();

            // Cleanup JSON markdown
            if (text.includes('```')) {
                text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            }

            const llmVerdict = JSON.parse(text);

            return {
                riskScore: llmVerdict.risk_score,
                verdict: llmVerdict.verdict.toUpperCase() as any,
                explanation: llmVerdict.short_explanation,
                recommendation: llmVerdict.recommendation
            };

        } catch (error) {
            console.error('[Judge] LLM failed, using heuristic:', error);
        }
    }

    return {
        riskScore,
        verdict,
        explanation,
        recommendation: verdict === 'dANGER' ? 'Avoid this company. Highly suspicious signals.' :
            verdict === 'CAUTION' ? 'Research further. Ask about fees or stipends before sharing data.' :
                'Seems legitimate. Standard due diligence recommended.'
    };
};
