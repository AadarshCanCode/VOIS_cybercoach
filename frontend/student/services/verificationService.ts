const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface CompanyData {
    id?: string;
    name: string;
    domain: string;
    trust_score: number;
    status: 'verified' | 'unverified' | 'warning';
    founded_year?: string;
    location?: string;
    description: string;
    certifications?: string[];
    verification_source: string;
    last_verified_at: string;

    // New fields
    verdict?: 'SAFE' | 'CAUTION' | 'dANGER' | 'UNKNOWN';
    explanation?: string;
    recommendation?: string;
    scam_hits?: number;
    sentiment?: string;
    red_flags?: string[];
    green_flags?: string[];
}

class VerificationService {
    async verifyCompany(query: string): Promise<CompanyData | null> {
        try {
            console.log('Verifying company via API:', query);
            const response = await fetch(`${API_URL}/student/verify-company`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                console.error('API Verification failed');
                throw new Error('Verification failed');
            }

            const result = await response.json();

            // Map backend result to frontend model
            return {
                name: result.scraped_data?.name || result.scraped_data?.title || query,
                domain: query,
                trust_score: 100 - result.risk_score,
                status: result.verdict === 'SAFE' ? 'verified' : (result.verdict === 'dANGER' ? 'warning' : 'unverified'),
                founded_year: result.details?.domain_age_days ? `${Math.floor(result.details.domain_age_days / 365)} years ago` : 'Unknown',
                location: result.details?.domain_registrar || 'Unknown',
                description: result.explanation || result.scraped_data?.description || 'No description available.',
                certifications: result.details?.green_flags || [],
                verification_source: 'CyberCoach AI Analyzer',
                last_verified_at: new Date().toISOString(),

                verdict: result.verdict,
                explanation: result.explanation,
                recommendation: result.recommendation,
                scam_hits: result.details?.scam_hits,
                sentiment: result.details?.sentiment,
                red_flags: result.details?.red_flags,
                green_flags: result.details?.green_flags
            };

        } catch (error) {
            console.error('Verify company error:', error);
            return null;
        }
    }
}

export const verificationService = new VerificationService();
