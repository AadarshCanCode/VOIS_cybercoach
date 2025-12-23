import { supabase } from '../../lib/supabase.js';

export interface ScrapedJob {
    id: string;
    title: string;
    company: string;
    type: string;
    salary_range: string;
    location: string;
    requirements: string[];
    link: string;
    posted_at: string;
    source: string;
}

export async function getScrapedJobs(): Promise<ScrapedJob[]> {
    try {
        console.log('[Jobs] Fetching jobs from Supabase...');
        const { data, error } = await supabase
            .from('scraped_jobs')
            .select('*')
            .order('posted_at', { ascending: false });

        if (error) {
            console.error('[Jobs] Error fetching jobs from Supabase:', error);
            return [];
        }

        console.log(`[Jobs] Successfully fetched ${data?.length || 0} jobs`);

        return data || [];
    } catch (error) {
        console.error('[Jobs] Unexpected error in jobService:', error);
        return [];
    }
}
