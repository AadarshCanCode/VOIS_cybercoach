
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ScrapedData } from '../detective/webScraper.js';
import type { DomainIntel } from '../detective/domainIntel.js';
import type { ReputationResult } from '../detective/reputationCheck.js';
import type { AnalysisResult } from '../analyst/contentAnalyzer.js';
import dotenv from 'dotenv';

dotenv.config();

// Logging utility for decision engine
const log = (phase: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [Judge:${phase}] ${message}`, data !== undefined ? JSON.stringify(data) : '');
};

export interface Verdict {
    riskScore: number;
    verdict: 'SAFE' | 'CAUTION' | 'DANGER' | 'UNKNOWN';
    explanation: string;
    recommendation: string;
}

export const makeDecision = async (
    scraperData: ScrapedData | null,
    domainIntel: DomainIntel,
    reputation: ReputationResult,
    analysis: AnalysisResult
): Promise<Verdict> => {
    log('Init', 'Starting company verification decision process');
    log('Init', 'Input data received', {
        hasScraperData: !!scraperData,
        domainAgeDays: domainIntel.ageDays,
        reputation: reputation.sentiment,
        redFlagsCount: analysis.redFlags.length,
        greenFlagsCount: analysis.greenFlags.length
    });

    // 1. Heuristic Calculation
    // Starting at 15 (assumes companies are legitimate by default)
    let riskScore = 15;
    const breakdown: string[] = [];
    log('Scoring', 'Initial risk score', { riskScore });

    // Factor: Domain Maturity
    if (domainIntel.ageDays !== null && domainIntel.ageDays !== undefined) {
        const prevScore = riskScore;
        if (domainIntel.ageDays < 60) {
            riskScore += 25; 
            breakdown.push('Very recent domain registration (< 60 days)');
        } else if (domainIntel.ageDays < 365) {
            riskScore += 10;
            breakdown.push('Relatively new domain (< 1 year)');
        } else if (domainIntel.ageDays > 1000) {
            riskScore -= 20; // Increased bonus for established domains
            breakdown.push('Well-established domain (> 3 years)');
        } else if (domainIntel.ageDays > 365) {
            riskScore -= 10;
            breakdown.push('Moderately established domain (1-3 years)');
        }
        log('Scoring', 'Domain age factor applied', { ageDays: domainIntel.ageDays, scoreDelta: riskScore - prevScore, newScore: riskScore });
    } else {
        log('Scoring', 'Domain age unknown - no penalty applied', { ageDays: domainIntel.ageDays });
    }

    // Factor: Reputation
    const prevRepScore = riskScore;
    if (reputation.sentiment === 'negative') {
        riskScore += 25; // Reduced from 40 - less harsh penalty
        breakdown.push(`Negative online reputation detected (${reputation.scamResults} concerning results)`);
    } else if (reputation.sentiment === 'positive') {
        riskScore -= 15; // Increased from -10 - better reward for good reputation
        breakdown.push('Positive online reputation');
    } else {
        // Neutral - no change, but log it
        log('Scoring', 'Reputation is neutral - no score change');
    }
    if (reputation.sentiment !== 'neutral') {
        log('Scoring', 'Reputation factor applied', { sentiment: reputation.sentiment, scamResults: reputation.scamResults, scoreDelta: riskScore - prevRepScore, newScore: riskScore });
    }

    // Factor: Content Signals - BALANCED WEIGHTS
    // Red flags: +10 each (reduced from +15)
    // Green flags: -10 each (increased from -5) - now equal weight!
    const prevFlagScore = riskScore;
    
    if (analysis.redFlags.length > 0) {
        const redPenalty = analysis.redFlags.length * 10; // Reduced from 15
        riskScore += redPenalty;
        breakdown.push(`Detected ${analysis.redFlags.length} red flag term(s): ${analysis.redFlags.join(', ')}`);
        log('Scoring', 'Red flags penalty applied', { flags: analysis.redFlags, penalty: redPenalty });
    }

    if (analysis.greenFlags.length > 0) {
        const greenBonus = analysis.greenFlags.length * 10; // Increased from 5 - now balanced!
        riskScore -= greenBonus;
        breakdown.push(`Found ${analysis.greenFlags.length} positive indicator(s): ${analysis.greenFlags.join(', ')}`);
        log('Scoring', 'Green flags bonus applied', { flags: analysis.greenFlags, bonus: greenBonus });
    }
    
    log('Scoring', 'Content signals total impact', { totalDelta: riskScore - prevFlagScore, newScore: riskScore });

    // Factor: Scraper Failure
    if (!scraperData) {
        riskScore += 5; // Reduced from 8 - even less harsh
        breakdown.push('Unable to scrape website content for deeper analysis');
        log('Scoring', 'Scraper failure penalty applied', { penalty: 5, newScore: riskScore });
    }

    // NEW: Big Brand / Common Domain Bonus
    const commonTlds = ['.com', '.org', '.net', '.edu', '.gov', '.in', '.co.uk'];
    const isCommonTld = commonTlds.some(tld => domainIntel.domain.endsWith(tld));
    if (isCommonTld && domainIntel.domain.split('.')[0].length <= 8) {
        riskScore -= 10;
        breakdown.push('Domain structure suggests an established entity');
        log('Scoring', 'Common domain bonus applied', { domain: domainIntel.domain, newScore: riskScore });
    }

    // Final Clamp
    riskScore = Math.max(0, Math.min(100, riskScore));
    log('Scoring', 'Final risk score after clamping', { riskScore });

    // Adjusted thresholds for fairer verdicts:
    // SAFE: 0-45 (was 0-35)
    // CAUTION: 46-65 (was 36-70)
    // DANGER: 66-100 (was 71-100)
    let verdict: Verdict['verdict'] = 'UNKNOWN';
    if (riskScore > 65) verdict = 'DANGER'; // Fixed typo: was 'dANGER'
    else if (riskScore > 45) verdict = 'CAUTION'; // Raised from 35 to 45
    else verdict = 'SAFE';
    
    log('Verdict', 'Heuristic verdict determined', { riskScore, verdict, thresholds: { safe: '0-45', caution: '46-65', danger: '66-100' } });

    const explanation = breakdown.length > 0
        ? breakdown.join('. ') + '.'
        : `Heuristic score: ${riskScore}/100 based on standard signals.`;

    // 2. LLM Enhancement (if API key exists)
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && scraperData && GoogleGenerativeAI) {
        log('LLM', 'Attempting Gemini AI enhancement');
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
            log('LLM', 'Gemini AI verdict received', llmVerdict);

            if (!llmVerdict.verdict || typeof llmVerdict.verdict !== 'string') {
                throw new Error('Invalid verdict format from LLM');
            }

            return {
                riskScore: llmVerdict.risk_score ?? riskScore,
                verdict: llmVerdict.verdict.toUpperCase() as Verdict['verdict'],
                explanation: llmVerdict.short_explanation || explanation,
                recommendation: llmVerdict.recommendation || 'No recommendation provided'
            };

        } catch (error) {
            log('LLM', 'Gemini AI failed, falling back to heuristic', { error: String(error) });
            console.error('[Judge] LLM failed, using heuristic:', error);
        }
    } else {
        log('LLM', 'Skipping LLM enhancement', { hasApiKey: !!geminiKey, hasScraperData: !!scraperData });
    }

    const finalResult = {
        riskScore,
        verdict,
        explanation,
        recommendation: verdict === 'DANGER' ? 'Avoid this company. Highly suspicious signals.' :
            verdict === 'CAUTION' ? 'Research further. Ask about fees or stipends before sharing data.' :
                'Seems legitimate. Standard due diligence recommended.'
    };
    
    log('Final', 'Decision complete', finalResult);
    return finalResult;
};
