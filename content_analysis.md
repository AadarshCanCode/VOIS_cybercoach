# Content Analysis Report

This document lists the sources of data within the Cyber Coach platform, distinguishing between static content, database-sourced content, and content scraped from external sources.

## Scraped Content (Web/External APIs)

| Content Type | Source | Service/File | Description |
| :--- | :--- | :--- | :--- |
| **Company Website Data** | Web Scraping (Axios/Cheerio) | `webScraper.ts` | Scrapes title, name, meta description, body text (top 5000 chars), and links from company URLs. |
| **Domain Intelligence** | WHOIS (whois-json) | `domainIntel.ts` | Fetches registrar details, creation dates, domain age, and administrative country. |
| **Company Reputation** | SerpApi (Google Search) | `reputationCheck.ts` | Performs Google searches for scam/legitimacy reviews and analyzes sentiment from snippets. |

## Database Sourced Content (Supabase)

| Content Type | Table | Service/File | Description |
| :--- | :--- | :--- | :--- |
| **Interview Questions** | `interview_questions` | `interviewService.ts` | Fetches categorized questions (technical, HR, aptitude) with ideal answers and difficulty levels. |
| **Company Registry** | `company_registry` | `interviewService.ts` | Fetches verified company names to inject into interview questions. |
| **User Data** | `profiles` (implied) | `AuthContext.tsx` | User profile information, progress, and certificates. |

## Static Content

| Content Type | Location | Description |
| :--- | :--- | :--- |
| **Fallback Questions** | `interviewService.ts` | Hardcoded questions used if DB connection fails or is empty. |
| **Mission Paths** | `LandingPage.tsx` | Descriptions for Recruit, Operative, and Specialist tracks. |
| **UI Copy** | Throughout frontend | Labels, headers, instructional text, and tactical flavor text (e.g., "CORTEX UNIT"). |
| **Mock Student Data** | `studentService.ts` | Sample profiles and course summaries used for the dashboard prototype. |
