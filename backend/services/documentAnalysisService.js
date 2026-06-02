const { PDFParse } = require("pdf-parse");
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

async function analyzeDocument(fileBuffer) {
    const parser = new PDFParse({ data: fileBuffer });
    const result = await parser.getText();
    const text = result.text;

    if (!text || text.trim().length === 0) {
        throw new Error("Could not extract text from the PDF. The document may be scanned or image-based.");
    }

    const response = await getGroqClient().chat.completions.create({
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        messages: [
            {
                role: "system",
                content: `You are Apka Vakeel, an expert Indian legal document analyst.
Your job is to thoroughly analyze legal documents (contracts, FIRs, deeds, notices) and return a detailed, structured JSON analysis.

You MUST respond with a valid JSON object matching this schema EXACTLY:
{
  "documentType": "String (e.g. Rental Agreement, Job Offer, Police FIR, Legal Notice)",
  "summary": "String (2-3 lines summarizing the document, parties, and core purpose)",
  "riskScore": Number (Overall risk score between 1.0 and 10.0)",
  "riskDetails": {
    "payment": Number (Risk score between 1.0 and 10.0),
    "liability": Number (Risk score between 1.0 and 10.0),
    "termination": Number (Risk score between 1.0 and 10.0)
  },
  "importantClauses": [
    {
      "title": "String (Clause Title)",
      "desc": "String (Clause description and what it means)",
      "severity": "String (either 'high', 'medium', or 'low')"
    }
  ],
  "risks": [
    {
      "title": "String (Short risk name)",
      "desc": "String (Detailed explanation of why it is unfavorable or risky)",
      "severity": "String (either 'high', 'medium', or 'low')"
    }
  ],
  "missingClauses": [
    {
      "title": "String (Missing clause name)",
      "desc": "String (Why it should be added for protection)"
    }
  ],
  "recommendedActions": [
    "String (Action item 1)",
    "String (Action item 2)"
  ],
  "citations": [
    {
      "section": "String (e.g., Section 420 IPC, Section 27 of Contract Act)",
      "desc": "String (Brief description of what this section states and relevance)"
    }
  ],
  "confidenceScore": Number (Percentage between 75 and 98),
  "simplifiedEnglish": "String (An plain, simple English translation of the overall document terms, avoiding legalese)",
  "hindiTranslation": "String (A clean, simple Hinglish/Hindi explanation of the core terms for local citizens)"
}

Rules:
- Be highly specific to Indian laws (IPC, CrPC, Indian Contract Act, Constitution).
- Look for auto-renewals, high cancellation penalties, indemnities, and restrain-of-trade clauses.
- Do not add any text before or after the JSON payload. Ensure it parses cleanly.`,
            },
            {
                role: "user",
                content: `Analyze this document text and output the JSON structure:\n\n${text}`,
            },
        ],
    });

    return response.choices[0].message.content;
}

module.exports = {
    analyzeDocument,
};
