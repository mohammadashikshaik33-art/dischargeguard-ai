const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const ROOT = path.join(__dirname, "..");
const PORT = 3099;
const BASE = `http://127.0.0.1:${PORT}`;

let serverProcess;

function waitForServer(maxAttempts = 20) {
    return new Promise((resolve, reject) => {
        let attempts = 0;

        const check = async () => {
            attempts += 1;
            try {
                const res = await fetch(`${BASE}/health`);
                if (res.ok) {
                    resolve();
                    return;
                }
            } catch (_) {
                // retry
            }

            if (attempts >= maxAttempts) {
                reject(new Error("Server did not start in time"));
                return;
            }

            setTimeout(check, 250);
        };

        check();
    });
}

describe("DischargeGuard backend", () => {
    before(async () => {
        serverProcess = spawn("node", ["server.js"], {
            cwd: ROOT,
            env: { ...process.env, PORT: String(PORT), HF_TOKEN: process.env.HF_TOKEN || "" },
            stdio: ["ignore", "pipe", "pipe"]
        });

        await waitForServer();
    });

    after(() => {
        if (serverProcess && !serverProcess.killed) {
            serverProcess.kill();
        }
    });

    it("GET /health returns ok status", async () => {
        const res = await fetch(`${BASE}/health`);
        assert.equal(res.status, 200);

        const body = await res.json();
        assert.equal(body.status, "ok");
        assert.equal(body.service, "DischargeGuard AI");
    });

    it("GET / serves index.html", async () => {
        const res = await fetch(`${BASE}/`);
        assert.equal(res.status, 200);
        assert.match(await res.text(), /DischargeGuard/);
    });

    it("GET /dashboard.html serves dashboard", async () => {
        const res = await fetch(`${BASE}/dashboard.html`);
        assert.equal(res.status, 200);
        assert.match(await res.text(), /summaryInput/);
    });

    it("POST /analyze rejects missing text", async () => {
        const res = await fetch(`${BASE}/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        });

        assert.equal(res.status, 400);
        const body = await res.json();
        assert.match(body.error, /Missing or invalid/i);
    });

    it("POST /analyze rejects text that is too short", async () => {
        const res = await fetch(`${BASE}/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: "short" })
        });

        assert.equal(res.status, 400);
        const body = await res.json();
        assert.match(body.error, /at least 10 characters/i);
    });

    it("POST /analyze returns error when HF_TOKEN is missing", async () => {
        if (process.env.HF_TOKEN) {
            return; // skip when token is configured
        }

        const res = await fetch(`${BASE}/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: "Patient discharged with aspirin 81mg daily and follow-up in 2 weeks."
            })
        });

        assert.equal(res.status, 500);
        const body = await res.json();
        assert.match(body.error, /HF_TOKEN/i);
    });
});

describe("DischargeGuard frontend smoke tests", () => {
    const requiredFiles = [
        "index.html",
        "dashboard.html",
        "server.js",
        "js/app.js",
        "js/huggingface.js",
        "js/Config.js",
        "css/style.css"
    ];

    for (const file of requiredFiles) {
        it(`${file} exists`, () => {
            assert.ok(fs.existsSync(path.join(ROOT, file)), `${file} should exist`);
        });
    }

    it("gemini.js dead code is removed", () => {
        assert.equal(
            fs.existsSync(path.join(ROOT, "js/gemini.js")),
            false,
            "gemini.js should be removed"
        );
    });

    it("huggingface.js uses relative API URL", () => {
        const content = fs.readFileSync(path.join(ROOT, "js/huggingface.js"), "utf8");
        assert.doesNotMatch(content, /localhost:3000/);
        assert.match(content, /\/analyze/);
    });

    it("app.js updates result cards not textarea", () => {
        const content = fs.readFileSync(path.join(ROOT, "js/app.js"), "utf8");
        assert.match(content, /updateResultCards/);
        assert.doesNotMatch(content, /summaryInput\.value\s*=\s*result/);
    });

    it(".gitignore excludes .env and node_modules", () => {
        const content = fs.readFileSync(path.join(ROOT, ".gitignore"), "utf8");
        assert.match(content, /\.env/);
        assert.match(content, /node_modules/);
    });
});

describe("parseAIResponse unit logic", () => {
    const { parseAIResponse } = require("../js/huggingface-parsing.js");

    it("parses structured AI output into sections", () => {
        const sample = `SUMMARY:
Patient had pneumonia and is recovering well.

WARNING SIGNS:
Fever above 101F, difficulty breathing.

MEDICATIONS:
Amoxicillin 500mg twice daily for 7 days.

CHECKLIST:
1. Take medications on time.
2. Schedule follow-up visit.`;

        const parsed = parseAIResponse(sample);
        assert.match(parsed.summary, /pneumonia/i);
        assert.match(parsed.warnings, /Fever/i);
        assert.match(parsed.medications, /Amoxicillin/i);
        assert.match(parsed.checklist, /follow-up/i);
    });
});
