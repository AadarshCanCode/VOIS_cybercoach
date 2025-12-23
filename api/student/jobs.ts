import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase (matching backend/lib/supabase.ts logic)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log('[Jobs] Received request for job listings');

    try {
        console.log('[Jobs] Fetching jobs from Supabase...');
        const { data, error } = await supabase
            .from('scraped_jobs')
            .select('*')
            .order('posted_at', { ascending: false });

        if (error) {
            console.error('[Jobs] Error fetching jobs from Supabase:', error);
            return res.status(500).json({ error: error.message });
        }

        console.log(`[Jobs] Successfully fetched ${data?.length || 0} jobs`);
        return res.status(200).json(data || []);
    } catch (error: any) {
        console.error('[Jobs] Unexpected error fetching jobs:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
