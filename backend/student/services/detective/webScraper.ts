
import axios from 'axios';
import * as cheerio from 'cheerio';

// Logging utility for web scraper
const log = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [Detective:Scraper] ${message}`, data !== undefined ? JSON.stringify(data) : '');
};

export interface ScrapedData {
  url: string;
  title: string;
  name: string;
  metaDescription: string;
  bodyText: string;
  links: string[];
  statusCode: number;
}

export const scrapeCompanyWebsite = async (url: string): Promise<ScrapedData | null> => {
  try {
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    log('Starting website scrape', { url: targetUrl });

    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 15000,
    });

    log('HTTP response received', { statusCode: response.status, contentLength: response.data?.length });

    if (!response.data) {
        log('Empty response data');
        return null;
    }

    const $ = cheerio.load(response.data);

    // Remove junk
    $('script, style, noscript, iframe, footer, nav, aside').remove();

    const title = $('title').text().trim();
    const ogTitle = $('meta[property="og:title"]').attr('content')?.trim();
    const ogSiteName = $('meta[property="og:site_name"]').attr('content')?.trim();

    // Better name extraction
    const name = ogSiteName || ogTitle || title.split('|')[0].split('-')[0].trim();

    const metaDescription = $('meta[name="description"]').attr('content')?.trim() ||
      $('meta[property="og:description"]').attr('content')?.trim() || '';

    // Extract main text content (limited to 5000 chars for analysis)
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 5000);

    const links: string[] = [];
    $('a').each((_, element) => {
      const href = $(element).attr('href');
      if (href && href.startsWith('http')) {
        links.push(href);
      }
    });

    log('Scrape complete', { name, title, textLength: bodyText.length, linksFound: links.length });

    return {
      url: targetUrl,
      title,
      name,
      metaDescription,
      bodyText,
      links: links.slice(0, 20),
      statusCode: response.status,
    };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log('Scrape failed', { url, error: errorMsg });
    console.error(`[Scraper] Error for ${url}:`, errorMsg);
    return null;
  }
};
