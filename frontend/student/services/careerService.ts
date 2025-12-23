
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

export const careerService = {
    async getJobListings(): Promise<JobListing[]> {
        try {
            const response = await fetch('http://localhost:4000/api/student/jobs');
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
