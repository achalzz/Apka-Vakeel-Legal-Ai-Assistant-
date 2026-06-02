require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const Groq = require("groq-sdk");
const axios = require("axios");

async function checkKeys() {
    console.log("Checking API keys and configurations...\n");

    // 1. Check Database connection
    console.log("1. Checking Database Connection...");
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || dbUrl === "your_database_url_here") {
        console.error("❌ DATABASE_URL is missing or set to placeholder value.");
    } else {
        try {
            const { PrismaPg } = require("@prisma/adapter-pg");
            const prisma = new PrismaClient({
                adapter: new PrismaPg({
                    connectionString: dbUrl,
                }),
            });
            await prisma.$connect();
            console.log("✅ Database connected successfully!");
            await prisma.$disconnect();
        } catch (err) {
            console.error("❌ Database connection failed:", err.message);
        }
    }

    // 2. Check Groq API Key
    console.log("\n2. Checking Groq API Key...");
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey || groqKey === "your_groq_api_key_here") {
        console.error("❌ GROQ_API_KEY is missing or set to placeholder value.");
    } else {
        try {
            const groq = new Groq({ apiKey: groqKey });
            const response = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: "Say ok" }],
                max_tokens: 5,
            });
            console.log("✅ Groq API is working! Response:", response.choices[0].message.content.trim());
        } catch (err) {
            console.error("❌ Groq API call failed:", err.message);
        }
    }

    // 3. Check NewsData API Key
    console.log("\n3. Checking NewsData API Key...");
    const newsKey = process.env.NEWSDATA_API_KEY;
    if (!newsKey || newsKey === "your_newsdata_api_key_here") {
        console.error("❌ NEWSDATA_API_KEY is missing or set to placeholder value.");
    } else {
        try {
            const response = await axios.get("https://newsdata.io/api/1/latest", {
                params: {
                    apikey: newsKey,
                    country: "in",
                    language: "en",
                    q: "Supreme Court",
                }
            });
            if (response.data && response.data.status === "success") {
                console.log("✅ NewsData API is working!");
            } else {
                console.error("❌ NewsData API returned unexpected status:", response.data);
            }
        } catch (err) {
            console.error("❌ NewsData API call failed:", err.response?.data || err.message);
        }
    }
}

checkKeys();
