const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const ONBOARDING_SYSTEM_PROMPT = `You are the CyberCoach Onboarding Assistant, a friendly and helpful AI guide designed to help users navigate and understand the CyberCoach cybersecurity learning platform.

YOUR ROLE:
- Help new users understand how to get started with the platform
- Guide users to relevant features and learning resources
- Answer questions about courses, assessments, and platform functionality
- Make the onboarding experience smooth and welcoming
- Provide quick, clear, and actionable responses

PLATFORM FEATURES YOU SHOULD KNOW:
1. **Student Features:**
   - Interactive cybersecurity courses and labs
   - AI-powered chatbot for learning assistance
   - Technical assessments and quizzes
   - Progress tracking and achievements
   - Virtual interview preparation
   - Hands-on lab environments

2. **Course Categories:**
   - Network Security
   - Web Application Security (OWASP Top 10)
   - Cloud Security
   - Cryptography
   - Ethical Hacking
   - Security Frameworks (NIST, ISO)

3. **Getting Started Steps:**
   - Sign up or log in to access the platform
   - Browse available courses in different categories
   - Start with beginner-friendly courses if new to cybersecurity
   - Complete assessments to track your progress
   - Use the AI learning assistant during courses for help

4. **User Roles:**
   - Students: Access courses, labs, and assessments
   - Admin: Platform administration and analytics

YOUR PERSONALITY:
- Friendly and encouraging, but professional
- Patient with beginners
- Enthusiastic about cybersecurity education
- Clear and concise in explanations
- Proactive in suggesting next steps

GUIDELINES:
- Keep responses brief and actionable (2-4 sentences usually)
- Use emojis sparingly for a friendly touch
- When users ask vague questions, provide helpful suggestions
- Direct users to specific features when relevant
- If asked about technical cybersecurity topics, briefly explain and mention relevant courses
- Always encourage exploration and learning

RESPONSE EXAMPLES:
- If asked "How do I start?": Guide them to sign up/login and browse courses
- If asked "What courses do you have?": List main categories and suggest starting point
- If asked about specific topics: Briefly explain and mention if courses are available
- If asked about features: Explain the feature and how to access it

Remember: Your goal is to make users feel welcome and confident in navigating CyberCoach!`;

class OnboardingChatService {
  private conversationHistory: ChatMessage[] = [];

  async sendMessage(userMessage: string): Promise<string> {
    if (!API_KEY) {
      return this.getFallbackResponse(userMessage);
    }

    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      // Prepare the request with system instruction
      const contents = [
        {
          role: 'user',
          parts: [{ text: ONBOARDING_SYSTEM_PROMPT }]
        },
        ...this.conversationHistory
      ];

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to fetch from Gemini API');
      }

      const data = await response.json();
      const assistantResponse = data.candidates[0].content.parts[0].text;

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: assistantResponse }]
      });

      // Keep conversation history manageable (last 10 exchanges)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return assistantResponse;
    } catch (error) {
      console.error('Error in onboarding chat service:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    // Pattern matching for common questions
    if (lowerMessage.includes('start') || lowerMessage.includes('begin')) {
      return "To get started with CyberCoach, simply sign up or log in to access our cybersecurity courses. Once you're in, browse our course catalog and choose a topic that interests you. Beginners often start with 'Introduction to Cybersecurity' or 'Network Security Basics'!";
    }

    if (lowerMessage.includes('course') || lowerMessage.includes('learn')) {
      return "We offer courses in Network Security, Web Application Security (OWASP Top 10), Cloud Security, Cryptography, Ethical Hacking, and more! Each course includes interactive lessons, hands-on labs, and assessments to test your knowledge. What area interests you most?";
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return "I'm here to help you navigate CyberCoach! You can ask me about getting started, available courses, how features work, or anything else about the platform. What would you like to know?";
    }

    if (lowerMessage.includes('assess') || lowerMessage.includes('test') || lowerMessage.includes('quiz')) {
      return "CyberCoach includes assessments and quizzes throughout courses to help you track your progress. You'll also find technical assessments and mock interview preparation tools. These help reinforce your learning and prepare you for real-world cybersecurity roles!";
    }

    if (lowerMessage.includes('lab') || lowerMessage.includes('practice')) {
      return "Our hands-on labs give you practical experience with cybersecurity tools and techniques in a safe environment. You'll find labs integrated into most courses, covering topics like penetration testing, network analysis, and security configuration. Ready to get hands-on?";
    }

    // Default response
    return "Great question! CyberCoach is your complete cybersecurity learning platform with interactive courses, hands-on labs, and AI-powered assistance. You can start learning right away after signing up. Would you like to know about specific courses, features, or how to get started?";
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  isGeminiEnabled(): boolean {
    return !!API_KEY;
  }
}

export const onboardingChatService = new OnboardingChatService();
