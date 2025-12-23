import type { VercelRequest, VercelResponse } from '@vercel/node';
import { scrapeCompanyWebsite } from '../../backend/student/services/detective/webScraper.js';
import { analyzeDomain } from '../../backend/student/services/detective/domainIntel.js';
import { checkReputation } from '../../backend/student/services/detective/reputationCheck.js';
import { analyzeContent } from '../../backend/student/services/analyst/contentAnalyzer.js';
import { makeDecision } from '../../backend/student/services/judge/decisionEngine.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        console.log(`[Verification] Starting verification for: ${query}`);

        // 2. Parallel Detective Work
        const [scraperData, domainIntel, reputation] = await Promise.all([
            scrapeCompanyWebsite(query),
            analyzeDomain(query),
            checkReputation(query)
        ]);

        // 3. Analyst Work
        const contentAnalysis = analyzeContent(scraperData?.bodyText || '');

        // 4. Judge Work
        const finalVerdict = await makeDecision(
            scraperData,
            domainIntel,
            reputation,
            contentAnalysis
        );

        // 5. Construct Response
        const result = {
            is_scam: finalVerdict.verdict === 'dANGER',
            risk_score: finalVerdict.riskScore,
            verdict: finalVerdict.verdict,
            explanation: finalVerdict.explanation,
            recommendation: finalVerdict.recommendation,
            details: {
                domain_age_days: domainIntel.ageDays,
                domain_registrar: domainIntel.registrar,
                scam_hits: reputation.scamResults,
                sentiment: reputation.sentiment,
                red_flags: contentAnalysis.redFlags,
                green_flags: contentAnalysis.greenFlags
            },
            scraped_data: {
                title: scraperData?.title,
                description: scraperData?.metaDescription
            }
        };

        res.status(200).json(result);

    } catch (error: any) {
        console.error('[Verification] controller error:', error);
        res.status(500).json({ error: 'Internal verification failed', details: error.message });
    }
}
