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
        const { data, error } = await supabase
            .from('scraped_jobs')
            .select('*')
            .order('posted_at', { ascending: false });

        if (error) {
            console.error('Error fetching jobs from Supabase:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error in jobService:', error);
        return [];
    }
}
