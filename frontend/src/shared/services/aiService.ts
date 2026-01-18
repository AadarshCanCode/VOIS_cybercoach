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

  generateVulnerabilityReport: async (url: string): Promise<{ score: number; summary: string; vulnerabilities: any[] }> => {
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
          - summary: A professional executive summary of the security posture.
          - vulnerabilities: An array of objects, each with:
            - type: Name of the vulnerability (e.g., "Reflected XSS", "Missing CSP", "Open Port 21").
            - severity: "critical", "high", "medium", or "low".
            - description: Technical description of the finding.
            - remediation: Actionable advice to fix it.
            
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
    if (score > 80) summary = "Target demonstrates a strong security posture with only minor configuration issues detected.";
    else if (score > 50) summary = "Target has a moderate security posture. Several vulnerabilities were detected that require attention.";
    else summary = "CRITICAL: Target exhibits significant security flaws. Immediate remediation is recommended.";

    return {
      score,
      summary,
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
