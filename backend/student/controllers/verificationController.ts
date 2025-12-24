
import type { Request, Response } from 'express';
import { scrapeCompanyWebsite } from '../services/detective/webScraper.js';
import { analyzeDomain } from '../services/detective/domainIntel.js';
import { checkReputation } from '../services/detective/reputationCheck.js';
import { analyzeContent } from '../services/analyst/contentAnalyzer.js';
import { makeDecision } from '../services/judge/decisionEngine.js';
// import { supabase } from '../../../supabase/client.js'; // Assuming shared client or I'll use direct fetch if needed

// Logging utility for verification controller
const log = (phase: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [Verification:${phase}] ${message}`, data !== undefined ? JSON.stringify(data, null, 2) : '');
};

export const verifyCompanyController = async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    
    try {
        const { query } = req.body;

        if (!query || typeof query !== 'string') {
            log('Error', 'Invalid query parameter', { query });
            res.status(400).json({ error: 'Query is required and must be a string' });
            return;
        }

        // 1. Check Cache/DB first (Optional optimization, skipping to force fresh check for this task demo)
        // In a real app, we would check 'company_registry' here.

        log('Start', `Starting verification for: ${query}`);

        // 2. Parallel Detective Work - with individual error handling for maximum robustness
        log('Detective', 'Starting parallel detective work (scraper, domain, reputation)');
        
        let scraperData: any = null;
        let domainIntel: any = { domain: query, registrar: null, creationDate: null, ageDays: null, country: null };
        let reputation: any = { sentiment: 'neutral', scamResults: 0, snippetSignals: [] };

        try {
            scraperData = await scrapeCompanyWebsite(query);
            log('Detective', 'Scraper completed', { success: !!scraperData });
        } catch (scrapeError: any) {
            log('Detective', 'Scraper failed (continuing)', { error: scrapeError.message });
        }

        try {
            domainIntel = await analyzeDomain(query);
            log('Detective', 'Domain analysis completed', { ageDays: domainIntel.ageDays });
        } catch (domainError: any) {
            log('Detective', 'Domain analysis failed (continuing)', { error: domainError.message });
        }

        try {
            reputation = await checkReputation(query);
            log('Detective', 'Reputation check completed', { sentiment: reputation.sentiment });
        } catch (repError: any) {
            log('Detective', 'Reputation check failed (continuing)', { error: repError.message });
        }

        log('Detective', 'Detective phase complete', {
            scraperSuccess: !!scraperData,
            scraperTitle: scraperData?.title || 'N/A',
            domainAgeDays: domainIntel.ageDays,
            domainRegistrar: domainIntel.registrar,
            reputationSentiment: reputation.sentiment,
            reputationScamHits: reputation.scamResults
        });

        // 3. Analyst Work
        // If scraper failed, we analyze empty string (heuristic will handle it)
        log('Analyst', 'Starting content analysis');
        const contentAnalysis = analyzeContent(scraperData?.bodyText || '');
        log('Analyst', 'Content analysis complete', {
            redFlags: contentAnalysis.redFlags,
            greenFlags: contentAnalysis.greenFlags,
            category: contentAnalysis.category,
            flagScore: contentAnalysis.flagScore
        });

        // 4. Judge Work
        log('Judge', 'Starting decision engine');
        const finalVerdict = await makeDecision(
            scraperData,
            domainIntel,
            reputation,
            contentAnalysis
        );
        log('Judge', 'Final verdict rendered', finalVerdict);

        // 5. Construct Response
        const result = {
            is_scam: finalVerdict.verdict === 'DANGER',
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

        const duration = Date.now() - startTime;
        log('Complete', `Verification completed in ${duration}ms`, { 
            query, 
            verdict: finalVerdict.verdict, 
            riskScore: finalVerdict.riskScore,
            trustScore: 100 - finalVerdict.riskScore,
            duration: `${duration}ms`
        });

        res.json(result);

    } catch (error: any) {
        const duration = Date.now() - startTime;
        log('Error', `Verification failed after ${duration}ms`, { error: error.message, stack: error.stack });
        console.error('Verification controller error:', error);
        res.status(500).json({ 
            error: 'Internal verification failed', 
            details: error.message,
            stack: error.stack
        });
    }
};
