import type { VercelRequest, VercelResponse } from '@vercel/node';
import { scrapeCompanyWebsite } from '../../backend/student/services/detective/webScraper.js';
import { analyzeDomain, type DomainIntel } from '../../backend/student/services/detective/domainIntel.js';
import { checkReputation, type ReputationResult } from '../../backend/student/services/detective/reputationCheck.js';
import { analyzeContent } from '../../backend/student/services/analyst/contentAnalyzer.js';
import { makeDecision } from '../../backend/student/services/judge/decisionEngine.js';

// Logging utility for Vercel serverless function
const log = (phase: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    let dataStr = '';
    if (data !== undefined) {
        try {
            dataStr = JSON.stringify(data, null, 2);
        } catch (e) {
            dataStr = '[Circular or Unstringifiable Data]';
        }
    }
    console.log(`[${timestamp}] [Vercel:${phase}] ${message}`, dataStr);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const startTime = Date.now();
    
    if (req.method !== 'POST') {
        log('Error', 'Invalid method', { method: req.method });
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { query } = req.body;

        if (!query || typeof query !== 'string') {
            log('Error', 'Invalid query parameter', { query });
            return res.status(400).json({ error: 'Query is required and must be a string' });
        }

        log('Start', `Starting verification for: ${query}`);

        // 2. Parallel Detective Work - with individual error handling
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

        res.status(200).json(result);

    } catch (error: any) {
        const duration = Date.now() - startTime;
        log('Error', `Verification failed after ${duration}ms`, { error: error.message, stack: error.stack });
        console.error('[Verification] controller error:', error);
        res.status(500).json({ 
            error: 'Internal verification failed', 
            details: error.message,
            stack: error.stack,
            duration: `${duration}ms`
        });
    }
}
