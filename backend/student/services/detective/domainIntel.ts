
import whois from 'whois-json';
import { parse } from 'tldts';

export interface DomainIntel {
    domain: string;
    registrar: string | null;
    creationDate: string | null;
    ageDays: number | null;
    country: string | null;
}

export const analyzeDomain = async (url: string): Promise<DomainIntel> => {
    try {
        const parsed = parse(url);
        const domain = parsed.domain;

        if (!domain) {
            throw new Error('Invalid domain');
        }

        console.log(`[DomainIntel] Checking WHOIS for ${domain}`);
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

        console.log(`[DomainIntel] Result for ${domain}: Age ${ageDays} days`);

        return {
            domain,
            registrar: typeof registrar === 'string' ? registrar : (Array.isArray(registrar) ? registrar[0] : null),
            creationDate,
            ageDays,
            country: typeof country === 'string' ? country : null
        };

    } catch (error) {
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
