const express = require("express");
const router = express.Router();

const prisma = require("../config/prisma");
const { askLegalAI } = require("../services/aiService");
const authMiddleware = require("../middleware/auth");


// =====================
// Chat API
// =====================

router.post("/chat", authMiddleware, async (req, res) => {

    try {

        const { question } = req.body;

        // Validation
        if (!question || question.trim() === "") {

            return res.status(400).json({
                success: false,
                error: "Question is required"
            });

        }

        // Ask AI
        const response = await askLegalAI(question);

        let parsedData = null;
        try {
            parsedData = JSON.parse(response);
        } catch (jsonErr) {
            console.warn("Failed to parse AI JSON response, using fallback:", jsonErr.message);
            parsedData = {
                isCasual: false,
                response: response,
                simplifiedEnglish: response,
                hindiTranslation: "",
                citations: [],
                confidenceScore: 85,
                suggestedNextSteps: []
            };
        }

        let chat = null;

        try {
            // Retrieve or upsert the user from authenticated request
            let user = await prisma.user.findUnique({
                where: { id: req.user.id }
            });

            if (!user) {

                user = await prisma.user.create({

                    data: {
                        id: req.user.id,
                        email: req.user.email,
                        name: req.user.name
                    }

                });

            }


            // Save chat (stores raw stringified JSON in response field)
            chat = await prisma.chat.create({

                data: {
                    question,
                    response: response,
                    userId: user.id
                }

            });
        } catch (dbError) {
            console.warn("Chat response generated but was not saved:", dbError.message);
        }


        res.json({

            success: true,
            data: parsedData,
            chatId: chat?.id || null

        });

    }

    catch (error) {

        console.error(
            "Chat Error:",
            error
        );

        res.status(500).json({

            success: false,
            error: error.message

        });

    }

});



// =====================
// Get chat history
// =====================

router.get("/history", authMiddleware, async (req, res) => {

    try {

        const chats = await prisma.chat.findMany({

            where: { userId: req.user.id },
            orderBy:{
                createdAt:"desc"
            }

        });

        const parsedChats = chats.map(chat => {
            let parsedResponse = chat.response;
            try {
                parsedResponse = JSON.parse(chat.response);
            } catch (e) {
                parsedResponse = {
                    isCasual: false,
                    response: chat.response,
                    simplifiedEnglish: chat.response,
                    hindiTranslation: "",
                    citations: [],
                    confidenceScore: 85,
                    suggestedNextSteps: []
                };
            }
            return {
                id: chat.id,
                question: chat.question,
                response: parsedResponse.response || chat.response, // Standard markdown answer fallback
                data: parsedResponse,
                createdAt: chat.createdAt
            };
        });

        res.json({

            success:true,
            chats: parsedChats

        });

    }

    catch (error) {

        console.error(
            "History Error:",
            error
        );

        res.json({

            success: true,
            chats: []

        });

    }

});


module.exports = router;
