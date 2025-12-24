
import whois from 'whois-json';
import { parse } from 'tldts';

// Logging utility for domain intelligence
const log = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [Detective:Domain] ${message}`, data !== undefined ? JSON.stringify(data) : '');
};

export interface DomainIntel {
    domain: string;
    registrar: string | null;
    creationDate: string | null;
    ageDays: number | null;
    country: string | null;
}

export const analyzeDomain = async (url: string): Promise<DomainIntel> => {
    log('Starting domain analysis', { url });
    
    try {
        const parsed = parse(url);
        const domain = parsed.domain;

        if (!domain) {
            log('Invalid domain - unable to parse', { url });
            throw new Error('Invalid domain');
        }

        log('Performing WHOIS lookup', { domain });
        const result = (await whois(domain)) as any; // Type casting because whois-json types are unreliable

        // Normalize whois response
        const creationDateStr = result.creationDate || result.creation_date || result['Creation Date'] || result.created || null;
        const registrar = result.registrar || result['Registrar'] || result.registrarName || null;
        const country = result.adminCountry || result['Admin Country'] || result.registrantCountry || result.country || null;

        let ageDays: number | null = null;
        let creationDate: string | null = null;

        if (creationDateStr) {
            const dateRaw = Array.isArray(creationDateStr) ? creationDateStr[0] : creationDateStr;
            const created = new Date(dateRaw);

            if (!isNaN(created.getTime())) {
                creationDate = created.toISOString();
                const diffTime = Math.abs(Date.now() - created.getTime());
                ageDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }
        }

        log('Domain analysis complete', { domain, ageDays, registrar, country });

        return {
            domain,
            registrar: typeof registrar === 'string' ? registrar : (Array.isArray(registrar) ? registrar[0] : null),
            creationDate,
            ageDays,
            country: typeof country === 'string' ? country : null
        };

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        log('Domain analysis failed', { url, error: errorMsg });
        console.warn(`[DomainIntel] Failed for ${url}:`, error);
        return {
            domain: parse(url).domain || url,
            registrar: null,
            creationDate: null,
            ageDays: null,
            country: null
        };
    }
};
