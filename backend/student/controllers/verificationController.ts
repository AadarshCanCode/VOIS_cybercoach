
import type { Request, Response } from 'express';
import { scrapeCompanyWebsite } from '../services/detective/webScraper.js';
import { analyzeDomain } from '../services/detective/domainIntel.js';
import { checkReputation } from '../services/detective/reputationCheck.js';
import { analyzeContent } from '../services/analyst/contentAnalyzer.js';
import { makeDecision } from '../services/judge/decisionEngine.js';
// import { supabase } from '../../../supabase/client.js'; // Assuming shared client or I'll use direct fetch if needed

export const verifyCompanyController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { query } = req.body;

        if (!query) {
            res.status(400).json({ error: 'Query is required' });
            return;
        }

        // 1. Check Cache/DB first (Optional optimization, skipping to force fresh check for this task demo)
        // In a real app, we would check 'company_registry' here.

        console.log(`Starting verification for: ${query}`);

        // 2. Parallel Detective Work
        const [scraperData, domainIntel, reputation] = await Promise.all([
            scrapeCompanyWebsite(query),
            analyzeDomain(query),
            checkReputation(query)
        ]);

        console.log('--- DEBUG DATA ---');
        console.log('Scraper:', scraperData ? `Success (${scraperData.title})` : 'Failed');
        console.log('Domain:', domainIntel);
        console.log('Reputation:', reputation);
        console.log('------------------');

        // 3. Analyst Work
        // If scraper failed, we analyze empty string (heuristic will handle it)
        const contentAnalysis = analyzeContent(scraperData?.bodyText || '');
        console.log('Analysis:', contentAnalysis);

        // 4. Judge Work
        const finalVerdict = await makeDecision(
            scraperData,
            domainIntel,
            reputation,
            contentAnalysis
        );
        console.log('Verdict:', finalVerdict);

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

        res.json(result);

    } catch (error) {
        console.error('Verification controller error:', error);
        res.status(500).json({ error: 'Internal verification failed' });
    }
};
