const Groq = require("groq-sdk");
require("dotenv").config();

function getGroqClient() {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not configured");
    }

    return new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });
}

async function askLegalAI(question) {
    try {
        console.log("AI Query:", question);

        const response = await getGroqClient().chat.completions.create({
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `You are Apka Vakeel, an approachable, highly intelligent Indian AI legal assistant.
Your goal is to answer the user's legal questions or casual messages, cross-reference relevant Indian laws, and return a comprehensive structured JSON response.

You MUST respond with a valid JSON object matching this schema EXACTLY:
{
  "isCasual": Boolean (true if the message is just small talk like "hi", "how are you", "thanks", false if it's a legal query),
  "response": "String (Markdown formatted friendly legal advice or greeting. Keep it concise, warm, and highly structured with bullet points. Avoid huge walls of text)",
  "simplifiedEnglish": "String (A super simple, layperson-friendly English summary avoiding any complex legal terms)",
  "hindiTranslation": "String (A simple, easy-to-understand explanation in Hinglish/Hindi for maximum accessibility)",
  "citations": [
    {
      "section": "String (e.g. Section 420 IPC, Article 21 Constitution)",
      "desc": "String (Brief description of this code section and how it applies to the user's question)"
    }
  ],
  "confidenceScore": Number (Confidence level percentage between 80 and 99 based on available precedents),
  "suggestedNextSteps": [
    "String (Actionable step 1, e.g. Preserve digital evidence)",
    "String (Actionable step 2, e.g. File a RTI application)"
  ]
}

Rules:
- Always structure the "response" field with Markdown: use double newlines (\n\n) to separate different paragraphs and concepts, separate bullet points with newlines and a dash/asterisk (\n- item), and use bolding (**bold**) for key terms to make the layout extremely clean and readable.
- If isCasual is true: you can leave citations, simplifiedEnglish, hindiTranslation, and suggestedNextSteps as empty arrays/strings.
- Focus on the Indian Constitution, Indian Penal Code (IPC), Bharatiya Nyaya Sanhita (BNS), CrPC, and other Indian statutes.
- Do not output any text before or after the JSON payload. Ensure it parses cleanly as a JSON object.`,
                },
                {
                    role: "user",
                    content: question,
                },
            ],
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.log("GROQ CHAT ERROR:", error);
        throw error;
    }
}

module.exports = {
    askLegalAI,
};
