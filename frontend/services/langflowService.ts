/**
 * Langflow Service
 * 
 * Handles communication with the Langflow workflow API for AI-powered chat.
 * Uses DataStax Langflow hosted on AWS for processing chat messages.
 */

// Use native crypto.randomUUID() - supported in all modern browsers
const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older environments
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Configuration from environment variables (all required)
const LANGFLOW_URL = import.meta.env.VITE_LANGFLOW_URL;
const LANGFLOW_TOKEN = import.meta.env.VITE_LANGFLOW_TOKEN;
const LANGFLOW_ORG_ID = import.meta.env.VITE_LANGFLOW_ORG_ID;

// Timeout configuration (in milliseconds)
const LANGFLOW_TIMEOUT = 30000; // 30 seconds

export interface LangflowResponse {
    success: boolean;
    message: string;
    sessionId: string;
    raw?: unknown;
}

export interface LangflowSession {
    id: string;
    createdAt: Date;
}

// Store active session for persistence across messages
let currentSession: LangflowSession | null = null;

export const langflowService = {
    /**
     * Check if Langflow is properly configured with all required env variables
     */
    isEnabled: (): boolean => {
        return !!(LANGFLOW_TOKEN && LANGFLOW_URL && LANGFLOW_ORG_ID);
    },

    /**
     * Get configuration status for debugging
     */
    getConfigStatus: (): { configured: boolean; missing: string[] } => {
        const missing: string[] = [];
        if (!LANGFLOW_URL) missing.push('VITE_LANGFLOW_URL');
        if (!LANGFLOW_TOKEN) missing.push('VITE_LANGFLOW_TOKEN');
        if (!LANGFLOW_ORG_ID) missing.push('VITE_LANGFLOW_ORG_ID');
        return { configured: missing.length === 0, missing };
    },

    /**
     * Create a new chat session with a unique ID
     */
    createSession: (): LangflowSession => {
        currentSession = {
            id: generateUUID(),
            createdAt: new Date(),
        };
        return currentSession;
    },

    /**
     * Get the current session or create a new one
     */
    getSession: (): LangflowSession => {
        if (!currentSession) {
            return langflowService.createSession();
        }
        return currentSession;
    },

    /**
     * Reset the current session (start fresh conversation)
     */
    resetSession: (): LangflowSession => {
        return langflowService.createSession();
    },

    /**
     * Send a message to Langflow and get a response
     */
    sendMessage: async (message: string, sessionId?: string): Promise<LangflowResponse> => {
        // Check configuration
        const configStatus = langflowService.getConfigStatus();
        if (!configStatus.configured) {
            console.warn('[LangflowService] Missing config:', configStatus.missing);
            return {
                success: false,
                message: `Langflow is not configured. Missing: ${configStatus.missing.join(', ')}. Please add these to your .env file.`,
                sessionId: sessionId || langflowService.getSession().id,
            };
        }

        // Use provided session ID or get the current one
        const session = sessionId || langflowService.getSession().id;

        // Prepare the request payload
        const payload = {
            output_type: "chat",
            input_type: "chat",
            input_value: message,
            session_id: session,
        };

        const headers = {
            "X-DataStax-Current-Org": LANGFLOW_ORG_ID!,
            "Authorization": `Bearer ${LANGFLOW_TOKEN}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
        };

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), LANGFLOW_TIMEOUT);

        try {
            console.log('[LangflowService] Sending message to Langflow...', { sessionId: session, url: LANGFLOW_URL });

            const response = await fetch(LANGFLOW_URL!, {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[LangflowService] API error:', response.status, errorText);
                throw new Error(`Langflow API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('[LangflowService] Response received:', data);

            // Parse the response - Langflow returns structured data
            // The exact structure depends on your flow configuration
            let responseMessage = '';

            // Try to extract the message from common Langflow response structures
            if (data.outputs && Array.isArray(data.outputs) && data.outputs.length > 0) {
                const output = data.outputs[0];
                if (output.outputs && Array.isArray(output.outputs) && output.outputs.length > 0) {
                    const innerOutput = output.outputs[0];
                    if (innerOutput.results?.message?.text) {
                        responseMessage = innerOutput.results.message.text;
                    } else if (innerOutput.messages && Array.isArray(innerOutput.messages) && innerOutput.messages.length > 0) {
                        responseMessage = innerOutput.messages[0].message || innerOutput.messages[0].text || '';
                    } else if (typeof innerOutput.results === 'string') {
                        responseMessage = innerOutput.results;
                    }
                }
            } else if (data.result) {
                responseMessage = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
            } else if (data.message) {
                responseMessage = data.message;
            } else if (data.text) {
                responseMessage = data.text;
            }

            // Fallback if we couldn't parse the response
            if (!responseMessage) {
                console.warn('[LangflowService] Could not parse response structure:', data);
                responseMessage = 'I received your message but had trouble processing the response. Please try again.';
            }

            return {
                success: true,
                message: responseMessage,
                sessionId: session,
                raw: data,
            };

        } catch (error) {
            clearTimeout(timeoutId);
            console.error('[LangflowService] Request failed:', error);

            let errorMessage: string;
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    errorMessage = 'Request timed out after 30 seconds. The Langflow server may be slow or unavailable.';
                } else {
                    errorMessage = error.message;
                }
            } else {
                errorMessage = 'An unexpected error occurred while connecting to Langflow.';
            }

            return {
                success: false,
                message: `Connection error: ${errorMessage}`,
                sessionId: session,
            };
        }
    },

    /**
     * Send a message with context (useful for interview/learning scenarios)
     */
    sendMessageWithContext: async (
        message: string,
        context: { courseTitle?: string; moduleTitle?: string; topic?: string },
        sessionId?: string
    ): Promise<LangflowResponse> => {
        // Build a contextualized message
        let contextPrefix = '';
        if (context.courseTitle) {
            contextPrefix += `[Course: ${context.courseTitle}] `;
        }
        if (context.moduleTitle) {
            contextPrefix += `[Module: ${context.moduleTitle}] `;
        }
        if (context.topic) {
            contextPrefix += `[Topic: ${context.topic}] `;
        }

        const contextualizedMessage = contextPrefix ? `${contextPrefix}\n\n${message}` : message;
        return langflowService.sendMessage(contextualizedMessage, sessionId);
    },
};

export default langflowService;
