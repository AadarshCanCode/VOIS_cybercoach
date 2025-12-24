
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let Search: any = null;
try {
    const SerpApi = require('google-search-results-nodejs');
    if (SerpApi) {
        Search = SerpApi.GoogleSearch || (SerpApi.default && SerpApi.default.GoogleSearch);
    }
} catch (e) {
    console.warn('Failed to load google-search-results-nodejs:', e);
}

import dotenv from 'dotenv';
dotenv.config();

// Logging utility for reputation check
const log = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [Detective:Reputation] ${message}`, data !== undefined ? JSON.stringify(data) : '');
};

export interface ReputationResult {
    sentiment: 'positive' | 'negative' | 'neutral';
    scamResults: number;
    snippetSignals: string[];
}

export const checkReputation = async (companyName: string): Promise<ReputationResult> => {
    log('Starting reputation check', { companyName });
    
    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey || !Search) {
        log('SERPAPI_KEY not found or Search engine not loaded - returning neutral');
        return { sentiment: 'neutral', scamResults: 0, snippetSignals: [] };
    }

    try {
        // Search for "Company Name scam reviews fake"
        const query = `${companyName} reviews fake legit`;

        const runSearch = (q: string): Promise<any> => {
            return new Promise((resolve) => {
                const search = new Search(apiKey);
                search.json({
                    engine: "google",
                    q: q,
                    num: 10
                }, (json: any) => {
                    resolve(json);
                });
            });
        };

        const results = await runSearch(query);

        if (!results || results.error) {
            log('SerpApi returned error or no results', { error: results?.error });
            return { sentiment: 'neutral', scamResults: 0, snippetSignals: [] };
        }

        let scamHits = 0;
        const items = results.organic_results || [];
        const snippetSignals: string[] = [];

        items.forEach((item: any) => {
            const text = (item.title + " " + item.snippet).toLowerCase();
            if (text.includes('scam') || text.includes('fake') || text.includes('fraud') || text.includes('complaint')) {
                scamHits++;
                snippetSignals.push(item.snippet);
            }
        });

        log('Search results analyzed', { totalResults: items.length, scamHits });

        // Adjusted thresholds for big brands:
        // negative: > 12 hits (was > 7) - much more lenient for popular brands
        // positive: <= 3 hits (was <= 1) - more reward for low scam mentions
        let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
        if (scamHits > 12) sentiment = 'negative';
        else if (scamHits <= 3) sentiment = 'positive';

        const result = {
            sentiment,
            scamResults: scamHits,
            snippetSignals: snippetSignals.slice(0, 3)
        };
        
        log('Reputation check complete', result);
        return result;

    } catch (error) {
        log('Reputation check failed', { error: String(error) });
        console.warn('Reputation check failed:', error);
        return { sentiment: 'neutral', scamResults: 0, snippetSignals: [] };
    }
};
