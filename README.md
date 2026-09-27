# Exam Eligibility Scraper

A reusable Node.js service for discovering official entrance-exam bulletins, downloading/parsing public PDFs, and normalizing eligibility-related information into one JSON shape.

Built so another backend can clone it, run it as a CLI, or call it over HTTP.

## Built-in adapters

- JEE Main — NTA
- NEET UG — NTA
- CUET UG — NTA
- MHT-CET — Maharashtra State CET Cell
- BITSAT — BITS Pilani

The adapters use official public sources only. Sites and bulletin layouts can change, so every result includes source URLs and extraction evidence rather than pretending heuristic parsing is infallible.

## Quick start

```bash
git clone https://github.com/Vaibh37/exam-eligibility-scraper.git
cd exam-eligibility-scraper
npm install
npm run scrape:all
```

Run the API:

```bash
npm run api
```

Then:

```text
GET  /health
GET  /api/exams
GET  /api/exams/:id
POST /api/scrape/:id
POST /api/scrape
```

Example:

```bash
curl -X POST http://localhost:3001/api/scrape/jee-main
```

## Output

Each adapter returns a common shape:

```json
{
  "id": "jee-main",
  "name": "JEE Main",
  "conductingBody": "National Testing Agency",
  "officialWebsite": "https://jeemain.nta.nic.in/",
  "source": {
    "pageUrl": "...",
    "documentUrl": "...",
    "documentType": "pdf"
  },
  "eligibility": {
    "age": [],
    "qualification": [],
    "subjects": [],
    "marks": [],
    "passingYear": [],
    "attempts": []
  },
  "dates": [],
  "fees": [],
  "evidence": [],
  "scrapedAt": "..."
}
```

## Integrating into another backend

Use it as a library:

```js
const { scrapeExam } = require("./src");

const result = await scrapeExam("jee-main");
console.log(result.eligibility);
```

Or keep this service separate and call its API from the existing app.

## Notes

- No CAPTCHA bypassing, login bypassing, or access-control circumvention.
- Requests use conservative timeouts/retries and a small delay between batch scrapes.
- Extraction is evidence-first: the scraper keeps snippets and source URLs so a product can review/validate rules before using them for high-stakes eligibility decisions.
- For production, store reviewed rules in your database instead of deciding a student's eligibility directly from freshly scraped text.

## Commands

```bash
npm test
npm run scrape:all
npm run scrape -- jee-main
npm run api
```

MIT licensed.
