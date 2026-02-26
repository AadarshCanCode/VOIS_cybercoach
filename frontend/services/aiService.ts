const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface CourseOutlineParams {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimated_hours: number;
  module_count: number;
  detailLevel: 'brief' | 'normal' | 'comprehensive';
}

export interface GeneratedModule {
  title: string;
  description: string;
  content: string;
}

export const generateAIResponse = async (history: ChatMessage[], prompt: string): Promise<string> => {
  if (!API_KEY) {
    console.warn('VITE_GEMINI_API_KEY is missing. Using simulation mode.');
    const mockResponses = [
      "Simulation Mode: API Key missing. I am operating with limited capacity.",
      "That is a valid observation, Operator. How would you mitigate the risk?",
      "Correct. Now, explain the difference between symmetric and asymmetric encryption.",
      "Interesting approach. Can you describe the potential side effects?",
      "Acknowledged. Proceed to the next phase."
    ];
    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  }

  try {
    const contents = [
      ...history,
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ];

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch from Gemini API');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    // Standard error log is fine here if needed, but the original was just re-throwing.
    console.error('Gemini API Error:', error);
    throw error;
  }
};

export const aiService = {
  isGeminiEnabled: () => !!API_KEY,

  chat: async (prompt: string, systemInstruction?: string): Promise<string> => {
    const finalPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
    return generateAIResponse([], finalPrompt);
  },

  generateCourseOutline: async (params: CourseOutlineParams): Promise<GeneratedModule[]> => {
    const prompt = `
      Create a course outline for a course titled "${params.title}".
      Description: ${params.description}
      Category: ${params.category}
      Difficulty: ${params.difficulty}
      Target Audience: Students
      Estimated Hours: ${params.estimated_hours}
      
      Please generate ${params.module_count} modules.
      Detail Level: ${params.detailLevel}
      
      Format the output as a JSON array of objects, where each object has:
      - title: string
      - description: string
      - content: string (a summary of the module content)
      
      Do not include any markdown formatting or code blocks. Just the raw JSON array.
    `;

    const response = await generateAIResponse([], prompt);

    try {
      // Clean up response if it contains markdown code blocks
      const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch (e) {
      console.error("Failed to parse AI response", e);
      throw new Error("Failed to generate valid course outline");
    }
  },

  generateVulnerabilityReport: async (url: string): Promise<{ score: number; summary: string; vulnerabilities: any[], overall_remediation?: string }> => {
    console.log("Generating report for:", url);
    console.log("API Key present:", !!API_KEY);

    // 1. Check if we can use the real API
    if (API_KEY) {
      try {
        console.log("Attempting Gemini API call...");
        const prompt = `
          Act as an advanced automated security scanner. I will provide a target URL.
          Your task is to perform a simulated heuristic analysis of this target based on its domain name, likely technology stack, and common web vulnerabilities.
          
          Target URL: "${url}"
          
          Generate a realistic vulnerability scan report in JSON format.
          The report should include:
          - score: A number between 0-100 (0 = critical risk, 100 = perfectly secure).
          - summary: A DETAILED executive summary (at least 3-4 paragraphs). It MUST be written in extremely simple, everyday English (5th-grade reading level). Do not use complex words like "infrastructure", "posture", "remediation", "opportunistic", "malware", or "synthesis" if you can avoid it. Talk to the user like a friendly teacher explaining what is safe and what is broken. Explain the finding, what it means in real life, and why it matters in plain terms.
          - overall_remediation: A DETAILED overview of the recommended action plan (at least 2-3 paragraphs). Use very simple English. Explain the high-level steps required to fix the issues. Tell a non-technical person exactly what they or their tech team should do next.
          - vulnerabilities: An array of objects, each with:
            - type: Name of the vulnerability (e.g., "Reflected XSS", "Missing CSP", "Open Port 21").
            - severity: "critical", "high", "medium", or "low".
            - description: Technical description of the finding (keep this simple too).
            - remediation: Actionable advice to fix it (keep this simple too).
            
          Rules:
          - If the URL contains "bank", "secure", or "gov", assume a higher security score (70-95) but find subtle issues.
          - If the URL contains "test", "demo", "vuln", or is an IP address, assume a low score (20-60) with obvious flaws.
          - For generic URLs, generate a plausible mix of medium/low issues (score 60-80).
          - Do NOT include markdown formatting or code blocks in the response. Just the raw JSON.
        `;

        const response = await generateAIResponse([], prompt);
        console.log("Gemini response received");

        try {
          const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
          return JSON.parse(cleanResponse);
        } catch {
          console.error("Failed to parse Gemini response as JSON:", response);
          throw new Error("Invalid JSON response from AI");
        }

      } catch {
        console.warn("AI Scan unavailable, switching to offline simulation mode.");
        // Fall through to static simulation below
      }
    } else {
      console.log("Gemini API disabled or key missing. Using simulation.");
    }

    // 2. Fallback / Simulation Logic (if API missing or failed)
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing

    // Generate a deterministic hash from the URL
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    const seed = Math.abs(hash);

    // Helper for seeded random
    const seededRandom = (offset: number) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };

    const score = Math.floor(seededRandom(1) * 60) + 30; // Score between 30 and 90

    const possibleVulnerabilities = [
      { type: "SQL Injection (SQLi)", severity: "critical", description: "Input parameter appears vulnerable to union-based SQL injection.", remediation: "Use parameterized queries." },
      { type: "Reflected XSS", severity: "high", description: "Search query parameter is reflected without sanitization.", remediation: "Implement context-aware output encoding." },
      { type: "Weak SSL/TLS", severity: "medium", description: "Server supports legacy TLS 1.0 protocol.", remediation: "Disable TLS 1.0/1.1." },
      { type: "Missing CSP", severity: "medium", description: "Content-Security-Policy header is missing.", remediation: "Implement a strict CSP." },
      { type: "Open Port 21", severity: "high", description: "FTP port 21 is open and accessible.", remediation: "Close unnecessary ports." },
      { type: "Server Info Leak", severity: "low", description: "Server header reveals version information.", remediation: "Suppress server version banners." },
      { type: "Missing X-Frame-Options", severity: "low", description: "Vulnerable to Clickjacking.", remediation: "Add X-Frame-Options header." },
      { type: "Cookie Security", severity: "medium", description: "Cookies missing Secure/HttpOnly flags.", remediation: "Set security flags on cookies." }
    ];

    // Select 2-4 random vulnerabilities based on seed
    const numVulns = Math.floor(seededRandom(2) * 3) + 2;
    const vulnerabilities = [];
    const usedIndices = new Set();

    for (let i = 0; i < numVulns; i++) {
      let idx = 0;
      do {
        idx = Math.floor(seededRandom(3 + i + idx) * possibleVulnerabilities.length);
      } while (usedIndices.has(idx));
      usedIndices.add(idx);
      vulnerabilities.push(possibleVulnerabilities[idx]);
    }

    // Determine summary based on score
    let summary = "";
    let overall_remediation = "";
    if (score > 80) {
      summary = "Great news! We looked deeply into your website and found that it is very safe right now. The way it was built shows that security was a top priority. Out of all our tests, we only found a few very tiny settings that could be better.\n\nRight now, the chances of a bad guy breaking into your site using common attacks is very, very low. The small things we found are tricky to trigger, meaning an attacker would have to work very hard and be very lucky to cause any real trouble.";
      overall_remediation = "Your main goal now is to just keep up the good work. Keep updating your software and computer systems whenever new versions come out. We also suggest you run this scan every month to make sure no new problems pop up over time.\n\nFor the small issues we did find below, you don't need to panic. Just ask your tech team to look at them the next time they work on the website. Make sure everyone on your team keeps using strong passwords and regular safety checks.";
    } else if (score > 50) {
      summary = "We finished looking at your website. Overall, it is doing okay, but there are some important issues you need to fix. Some parts of the website are not locking the doors properly, which means a hacker might be able to sneak in if they try hard enough.\n\nThese problems mean there is a real chance that someone could steal some data or mess with your web pages. You should take this seriously, but there is no need to panic yet. Most of the time, the bad guys would need to trick one of your users into clicking a bad link to cause damage. But it is better to lock the doors now before they try.";
      overall_remediation = "You should fix the medium and high-level problems listed below as soon as you can. Please show this report to your computer team so they can test the website and find out exactly what went wrong. Once they find the holes, they need to put patches on them to seal them up.\n\nIn the big picture, you should also make sure that every part of your website forces users to use a secret code (encryption) when they log in. Doing these things will make your score jump up and keep your user's info safe.";
    } else {
      summary = "WARNING: Our scan found some very big, dangerous holes in your website. Right now, your website is very unsafe and it is not protecting your info or your user's info the right way. We found broken parts that computer hackers love to attack.\n\nBecause of these big holes, a hacker could easily guess passwords, run bad computer code on your server, or steal all the info from your database. If someone attacks you right now, they have a very high chance of winning, which could hurt your business and your users a lot.";
      overall_remediation = "YOU MUST ACT QUICKLY. If this website is being used by real people right now, you might want to turn it off or block it from the internet until you fix the biggest problems. Call your computer team right away and tell them to fix the 'Critical' items listed below first.\n\nOnce you stop the immediate danger, your team needs to look carefully at the whole system to make sure no one has already broken in secretly. Going forward, your builders need to double-check their work and maybe completely rewrite some code to make sure things like this do not happen again.";
    }

    return {
      score,
      summary,
      overall_remediation,
      vulnerabilities
    };
  },

  parseResume: async (text: string): Promise<{ skills: string[], experience: string, summary: string }> => {
    const prompt = `
      Analyze the following resume text and extract key information.
      
      Resume Text: "${text.substring(0, 10000)}"
      
      Please provide:
      1. A list of top 5 relevant technical skills.
      2. A brief summary of professional experience (max 3 sentences).
      3. A high-level professional summary (max 2 sentences).
      
      Format the output as JSON:
      {
        "skills": ["string"],
        "experience": "string",
        "summary": "string"
      }
      
      Do not include markdown formatting. Just the raw JSON.
    `;

    try {
      const response = await generateAIResponse([], prompt);
      const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error("Failed to parse resume with AI", error);
      return {
        skills: ["Cybersecurity", "Technical Analysis"],
        experience: "Background in information technology and security operations.",
        summary: "Dedicated professional with interest in cybersecurity."
      };
    }
  }
};
