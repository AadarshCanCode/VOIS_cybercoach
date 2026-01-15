import Groq from 'groq-sdk';
import 'dotenv/config';

async function main() {
    console.log("--- GROQ TEST START ---");
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        console.error("ERROR: GROQ_API_KEY not found in process.env");
        process.exit(1);
    }

    console.log(`API Key found (length: ${apiKey.length}, starts with: ${apiKey.substring(0, 4)})`);

    try {
        const groq = new Groq({ apiKey });
        console.log("Sending test request...");

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'Say "Connection Successful"' }],
            model: 'llama3-8b-8192',
        });

        console.log("Response received:");
        console.log(completion.choices[0]?.message?.content);
        console.log("--- GROQ TEST PASS ---");
    } catch (err: any) {
        console.error("--- GROQ TEST FAIL ---");
        console.error("Error type:", err.constructor.name);
        console.error("Message:", err.message);
        if (err.response) {
            console.error("Data:", err.response.data);
        }
    }
}

main();
