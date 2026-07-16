# DischargeGuard AI — Audit Report

**Date:** July 16, 2026  
**Scope:** Full codebase audit prior to repair

---

## Architecture Summary

| Layer | Technology |
|-------|------------|
| Frontend | Vanilla HTML/CSS/JS |
| Backend | Node.js + Express 5 |
| AI | Hugging Face Inference (chat completions) |
| OCR | Tesseract.js (client-side) |
| PDF | PDF.js (client-side) |
| Database | None |
| Authentication | None |

### File Inventory

| File | Purpose | Status (pre-fix) |
|------|---------|------------------|
| `index.html` | Landing page | OK (was `Index.html` — case issue) |
| `dashboard.html` | Main application UI | OK |
| `js/app.js` | File upload, OCR, analyze handler | **Broken** — wrote to textarea |
| `js/huggingface.js` | API client | **Broken** — hardcoded localhost, no error handling |
| `js/gemini.js` | Gemini integration | **Broken** — syntax error, unused |
| `js/Config.js` | Configuration | **Dead** — Firebase placeholders |
| `server.js` | Express backend | **Broken** — wrong model, no static files |
| `css/style.css` | Styles | OK |

---

## Issues Identified

### Critical

| ID | Issue | Root Cause | Impact |
|----|-------|------------|--------|
| C1 | AI results not shown in UI cards | `app.js` overwrote textarea with JSON | Core feature broken |
| C2 | HF model unsupported | `google/flan-t5-large` not on Inference Providers | All AI calls fail |
| C3 | No `.gitignore` | Missing file | HF token leak risk |

### High

| ID | Issue | Root Cause | Impact |
|----|-------|------------|--------|
| H1 | `gemini.js` syntax error | Missing comma in fetch call | Would crash if loaded |
| H2 | `gemini.js` dead code | Not included in dashboard.html | Confusion, maintenance debt |
| H3 | No static file serving | Express only had API routes | file:// CORS issues |
| H4 | No backend `response.ok` check | Missing validation | Errors passed as success |
| H5 | No frontend `response.ok` check | Missing validation | Poor error UX |
| H6 | Hardcoded `localhost:3000` | Static URL in client | Breaks in deployment |

### Medium

| ID | Issue |
|----|-------|
| M1 | No input validation on `/analyze` |
| M2 | Open CORS (`*`) |
| M3 | Hardcoded port 3000 |
| M4 | No `npm start` script |
| M5 | flan-t5 token limits unsuitable for medical docs |
| M6 | OCR lacks progress feedback |
| M7 | No automated tests |
| M8 | Dead Firebase config |
| M9 | Deleted `firebase.js` references remain |

### Low

| ID | Issue |
|----|-------|
| L1 | `Index.html` vs `index.html` case sensitivity |
| L2 | Minimal README |
| L3 | `node_modules` not gitignored |
| L4 | No loading state on analyze button |
| L5 | No rate limiting |

---

## Security Findings

- HF token stored in `.env` (correct pattern) but not gitignored
- CORS open to all origins
- No input length limits
- No rate limiting on AI endpoint
- Medical data sent to third-party AI (compliance consideration for production)

---

## Deployment Gaps

- No Dockerfile or CI/CD
- No production environment documentation
- No health check endpoint (added during fix)
- Package `main` pointed to nonexistent `index.js`

---

## Repair Plan

1. Add `.gitignore` and `.env.example`
2. Rewrite `server.js` with supported HF model, validation, static files, rate limiting
3. Fix `huggingface.js` and `app.js` for proper UI updates
4. Remove `gemini.js`, clean `Config.js`
5. Rename landing page to `index.html`
6. Add tests, README, and production hardening
7. Verify with `npm start` and `npm test`

---

*This report documents the pre-repair state. See `FINAL_PROJECT_REPORT.md` for post-fix status.*
