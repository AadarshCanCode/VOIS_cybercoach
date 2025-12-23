
export interface JobListing {
    id: string;
    title: string;
    company: string;
    type: string;
    salary_range: string;
    location: string;
    requirements: string[];
    posted_at: string;
    link: string;
    source: string;
}

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const careerService = {
    async getJobListings(): Promise<JobListing[]> {
        try {
            const response = await fetch(`${API_URL}/student/jobs`);
            if (!response.ok) throw new Error('Failed to fetch jobs');
            return await response.json();
        } catch (error) {
            console.error('Error fetching job listings:', error);
            return [];
        }
    },

    async applyForJob(): Promise<boolean> {
        // Simulate application process
        await new Promise(resolve => setTimeout(resolve, 1500));
        return true;
    }
};
