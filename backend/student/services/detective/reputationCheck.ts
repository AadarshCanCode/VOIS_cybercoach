
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const SerpApi = require('google-search-results-nodejs');
const Search = SerpApi.GoogleSearch;

import dotenv from 'dotenv';
dotenv.config();

export interface ReputationResult {
    sentiment: 'positive' | 'negative' | 'neutral';
    scamResults: number;
    snippetSignals: string[];
}

export const checkReputation = async (companyName: string): Promise<ReputationResult> => {
    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
        console.warn('SERPAPI_KEY not found, skipping reputation check');
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

        let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
        if (scamHits > 5) sentiment = 'negative';
        else if (scamHits === 0) sentiment = 'positive';

        return {
            sentiment,
            scamResults: scamHits,
            snippetSignals: snippetSignals.slice(0, 3)
        };

    } catch (error) {
        console.warn('Reputation check failed:', error);
        return { sentiment: 'neutral', scamResults: 0, snippetSignals: [] };
    }
};
