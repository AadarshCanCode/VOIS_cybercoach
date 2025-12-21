import { supabase } from '@lib/supabase';

export interface CompanyData {
    id: string;
    name: string;
    domain: string;
    trust_score: number;
    status: 'verified' | 'unverified' | 'warning';
    founded_year: string;
    location: string;
    description: string;
    certifications: string[];
    verification_source: string;
    last_verified_at: string;
}

class VerificationService {
    async verifyCompany(query: string): Promise<CompanyData | null> {
        try {
            // Normalize query
            const normalizedQuery = query.toLowerCase().trim();

            // Try exact match on domain or name
            const { data, error } = await supabase
                .from('company_registry')
                .select('*')
                .or(`domain.ilike.%${normalizedQuery}%,name.ilike.%${normalizedQuery}%`)
                .limit(1)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Verify company error:', error);
            return null;
        }
    }
}

export const verificationService = new VerificationService();
