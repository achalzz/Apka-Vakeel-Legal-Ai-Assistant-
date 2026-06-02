const express = require("express");
const multer = require("multer");
const prisma = require("../config/prisma");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const {
    analyzeDocument
} = require("../services/documentAnalysisService");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

router.post(
    "/upload",
    authMiddleware,
    upload.single("document"),

    async (req, res) => {

        try {

            console.log("Upload request received");

            if (!req.file) {

                console.log("No file found");

                return res.status(400).json({
                    success: false,
                    error: "No file uploaded"
                });

            }

            console.log(
                "File:",
                req.file.originalname
            );

            console.log(
                "Size:",
                req.file.size
            );

            const analysis =
                await analyzeDocument(
                    req.file.buffer
                );

            console.log(
                "Analysis complete"
            );

            let parsedAnalysis = null;
            try {
                parsedAnalysis = JSON.parse(analysis);
            } catch (jsonErr) {
                console.warn("Failed to parse document analysis JSON response, using fallback:", jsonErr.message);
                parsedAnalysis = {
                    documentType: "Legal Document",
                    summary: analysis,
                    riskScore: 5.0,
                    riskDetails: { payment: 5.0, liability: 5.0, termination: 5.0 },
                    importantClauses: [],
                    risks: [],
                    missingClauses: [],
                    recommendedActions: [],
                    citations: [],
                    confidenceScore: 85,
                    simplifiedEnglish: analysis,
                    hindiTranslation: ""
                };
            }

            // Persist the document analysis in the database under the authenticated user
            try {
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

                await prisma.document.create({
                    data: {
                        name: req.file.originalname,
                        size: req.file.size,
                        analysis: analysis, // Saves raw stringified JSON
                        userId: user.id
                    }
                });
            } catch (dbError) {
                console.warn("Document analysis generated but database persistence failed:", dbError.message);
            }

            res.json({

                success: true,
                data: parsedAnalysis

            });

        }

        catch (error) {

            console.log(
                "UPLOAD ERROR:"
            );

            console.log(error);

            res.status(500).json({

                success: false,
                error: error.message

            });

        }

    }

);

// GET /api/documents/list — Fetch authenticated user's uploaded & analyzed documents
router.get("/list", authMiddleware, async (req, res) => {
    try {
        const documents = await prisma.document.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" }
        });

        const parsedDocuments = documents.map(doc => {
            let parsed = doc.analysis;
            try {
                parsed = JSON.parse(doc.analysis);
            } catch (e) {
                parsed = {
                    documentType: "Legal Document",
                    summary: doc.analysis,
                    riskScore: 5.0,
                    riskDetails: { payment: 5.0, liability: 5.0, termination: 5.0 },
                    importantClauses: [],
                    risks: [],
                    missingClauses: [],
                    recommendedActions: [],
                    citations: [],
                    confidenceScore: 85,
                    simplifiedEnglish: doc.analysis,
                    hindiTranslation: ""
                };
            }
            return {
                id: doc.id,
                name: doc.name,
                size: doc.size,
                createdAt: doc.createdAt,
                data: parsed
            };
        });

        res.json({
            success: true,
            documents: parsedDocuments
        });
    } catch (error) {
        console.log("GET Documents Error:", error);
        res.json({
            success: true,
            documents: []
        });
    }
});

module.exports = router;