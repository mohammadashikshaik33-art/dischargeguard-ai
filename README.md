# DischargeGuard AI

AI-Powered Post-Discharge Care Assistant — helps caregivers understand hospital discharge summaries, medications, warning signs, and follow-up instructions.

**Theme:** Crisis Management, HealthTech & Emergency Response

---

## Features

- Paste or upload discharge summaries (PDF, JPG, PNG)
- Automatic PDF text extraction with OCR fallback for scanned documents
- AI-powered analysis via Hugging Face
- Structured output: Summary, Warning Signs, Medications, Caregiver Checklist

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or higher
- A [Hugging Face API token](https://huggingface.co/settings/tokens) with read access

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/mohammadashikshaik33-art/dischargeguard-ai.git
cd dischargeguard-ai
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your Hugging Face token:

```
HF_TOKEN=your_huggingface_token_here
```

### 3. Start the server

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

1. Open the landing page and click **Get Started**
2. Paste a discharge summary or upload a PDF/image
3. Click **Analyze Instructions**
4. Review the four result cards: Summary, Warning Signs, Medications, Checklist

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `HF_TOKEN` | Yes | — | Hugging Face API token |
| `HF_MODEL` | No | `Qwen/Qwen2.5-7B-Instruct-1M` | Chat model for analysis |
| `PORT` | No | `3000` | Server port |
| `CORS_ORIGIN` | No | `*` | Allowed CORS origin |
| `RATE_LIMIT_MAX` | No | `30` | Max requests per IP per 15 min |

---

## API

### `GET /health`

Returns server status and configured model.

### `POST /analyze`

Analyze a discharge summary.

**Request:**
```json
{ "text": "Patient discharged with..." }
```

**Response:**
```json
{ "generated_text": "SUMMARY:\n...\nWARNING SIGNS:\n..." }
```

---

## Testing

```bash
npm test
```

Runs backend endpoint tests and frontend smoke tests.

---

## Project Structure

```
dischargeguard-ai/
├── index.html              # Landing page
├── dashboard.html          # Main application
├── server.js               # Express backend + AI proxy
├── js/
│   ├── Config.js           # Client configuration
│   ├── app.js              # Upload, OCR, analyze handler
│   ├── huggingface.js      # API client
│   └── huggingface-parsing.js  # Response parsing
├── css/style.css
├── tests/                  # Automated tests
└── .env.example            # Environment template
```

---

## Deployment

### General steps

1. Set environment variables on your host (`HF_TOKEN`, `PORT`, `CORS_ORIGIN`)
2. Run `npm install --production`
3. Run `npm start`
4. Use a reverse proxy (nginx, Render, Railway, etc.) for HTTPS

### Render / Railway

- **Build command:** `npm install`
- **Start command:** `npm start`
- Set `HF_TOKEN` in environment variables

---

## Security Notes

- Never commit `.env` or expose `HF_TOKEN` in client code
- The token is kept server-side only via the `/analyze` proxy
- Rotate your token if it was ever committed or shared
- This app is intended for demo/hackathon use — not HIPAA-compliant for production PHI

---

## License

ISC
