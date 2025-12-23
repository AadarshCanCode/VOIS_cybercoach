import { supabase } from '@lib/supabase';

export interface JobListing {
    id: string;
    title: string;
    company: string;
    type: 'Full-time' | 'Contract' | 'Bounty';
    salary_range: string;
    location: string;
    requirements: string[];
    posted_at: string;
}

export const careerService = {
    async getJobListings(): Promise<JobListing[]> {
        const { data, error } = await supabase
            .from('scraped_jobs')
            .select('*')
            .order('posted_at', { ascending: false });

        if (error) {
            console.error('Error fetching job listings:', error);
            return [];
        }

        return data || [];
    },

    async applyForJob(): Promise<boolean> {
        // Simulate application process
        await new Promise(resolve => setTimeout(resolve, 1500));
        return true;
    }
};
