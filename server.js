require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;
const HF_MODEL = process.env.HF_MODEL || "Qwen/Qwen2.5-7B-Instruct";
const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
const MAX_TEXT_LENGTH = 50000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX, 10) || 30;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname)));

// ===================================
// Rate Limiting (in-memory)
// ===================================

const rateLimitStore = new Map();

function rateLimit(req, res, next) {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const entry = rateLimitStore.get(key) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

    if (now > entry.resetAt) {
        entry.count = 0;
        entry.resetAt = now + RATE_LIMIT_WINDOW_MS;
    }

    entry.count += 1;
    rateLimitStore.set(key, entry);

    if (entry.count > RATE_LIMIT_MAX) {
        return res.status(429).json({
            error: "Too many requests. Please try again later."
        });
    }

    next();
}

// ===================================
// Prompt Builder
// ===================================

function buildAnalysisPrompt(text) {
    return `You are a medical discharge assistant helping caregivers understand hospital discharge paperwork.

Analyze the following discharge summary and respond using EXACTLY these section headers:

SUMMARY:
Provide a simple, plain-language explanation for the caregiver.

WARNING SIGNS:
List symptoms that require immediate medical attention.

MEDICATIONS:
Explain each medicine, dosage, and timing in simple terms.

CHECKLIST:
Provide a numbered caregiver action checklist for the first week at home.

Discharge Summary:
${text}`;
}

// ===================================
// Routes
// ===================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "DischargeGuard AI",
        model: HF_MODEL
    });
});

app.post("/analyze", rateLimit, async (req, res) => {
    try {
        const text = req.body?.text;

        if (!text || typeof text !== "string") {
            return res.status(400).json({ error: "Missing or invalid 'text' field." });
        }

        const trimmed = text.trim();

        if (trimmed.length < 10) {
            return res.status(400).json({ error: "Text must be at least 10 characters." });
        }

        if (trimmed.length > MAX_TEXT_LENGTH) {
            return res.status(400).json({
                error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters.`
            });
        }

        if (!process.env.HF_TOKEN) {
            return res.status(500).json({
                error: "Server misconfiguration: HF_TOKEN is not set."
            });
        }

        const response = await fetch(HF_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.HF_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: HF_MODEL,
                messages: [
                    {
                        role: "user",
                        content: buildAnalysisPrompt(trimmed)
                    }
                ],
                max_tokens: 1024,
                temperature: 0.3
            })
        });

        const data = await response.json();

        if (!response.ok) {
            const message =
                data.error?.message ||
                data.error ||
                `Hugging Face API error (${response.status})`;

            console.error("HF API Error:", response.status, message);
            return res.status(response.status).json({ error: String(message) });
        }

        const generatedText = data.choices?.[0]?.message?.content;

        if (!generatedText) {
            return res.status(502).json({
                error: "AI returned an empty response. Please try again."
            });
        }

        console.log("Analysis completed successfully");
        res.json({ generated_text: generatedText });

    } catch (error) {
        console.error("Backend Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// ===================================
// Start Server
// ===================================

app.listen(PORT, () => {
    console.log(`DischargeGuard server running on http://localhost:${PORT}`);
    if (!process.env.HF_TOKEN) {
        console.warn("WARNING: HF_TOKEN is not set. /analyze will fail until configured.");
    } else {
        console.log(`AI model: ${HF_MODEL}`);
    }
});
