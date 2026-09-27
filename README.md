# Exam Eligibility Scraper + Discovery Engine

A standalone Node.js service that:

1. finds official exam information/bulletin sources,
2. downloads and parses HTML/PDF documents,
3. extracts eligibility evidence and important text,
4. keeps reviewed 2026 eligibility rules separate from raw scraping,
5. accepts a student's profile,
6. returns which supported exams match, which do not, what information is missing, and why.

It is designed to be cloned into or run beside an existing student-discovery backend.

## Supported exams

- JEE Main 2026 — NTA
- NEET UG 2026 — NTA
- CUET UG 2026 — NTA
- MHT-CET 2026 — Maharashtra State CET Cell
- BITSAT 2026 — BITS Pilani

## Quick start

```bash
git clone https://github.com/Vaibh37/exam-eligibility-scraper.git
cd exam-eligibility-scraper
npm install
npm test
npm run api
```

Server starts on:

```text
http://localhost:3001
```

## Student discovery

The easiest integration is one request:

```http
POST /api/discover
Content-Type: application/json
```

Example body:

```json
{
  "dob": "2008-05-10",
  "nationality": "Indian",
  "category": "GENERAL",
  "pwbd": false,
  "domicileState": "Maharashtra",
  "currentlyEnrolledAtBits": false,
  "currentInstitution": "Example Junior College",
  "class12": {
    "status": "passed",
    "passingYear": 2026,
    "subjects": [
      "Physics",
      "Chemistry",
      "Mathematics",
      "English",
      "Computer Science"
    ],
    "subjectCount": 5,
    "marksBySubject": {
      "Physics": 80,
      "Chemistry": 82,
      "Mathematics": 85,
      "English": 90,
      "Computer Science": 92
    }
  }
}
```

The response groups exams into:

```text
eligible
provisionally_eligible
needs_more_info
ineligible
```

Every exam contains individual checks and plain-English reasons, so the frontend can show things like:

```text
JEE Main       eligible
CUET UG        eligible
BITSAT         eligible
NEET UG        ineligible — Biology/Biotechnology missing
MHT-CET        eligible — PCM route
```

## API

```text
GET  /health
GET  /api/exams
GET  /api/exams/:id

GET  /api/eligibility/schema
GET  /api/eligibility/rules
POST /api/eligibility
POST /api/eligibility/:id
POST /api/discover

POST /api/scrape/:id
POST /api/scrape
```

Full API examples are in [docs/API.md](docs/API.md).

## CLI

Scrape all configured official sources:

```bash
npm run scrape:all
```

Scrape one exam:

```bash
npm run scrape -- jee-main
```

Check a student profile:

```bash
npm run eligibility -- examples/student-profile.json
```

Check only one exam:

```bash
npm run eligibility -- examples/student-profile.json bitsat
```

## Use as a library

```js
const {
  scrapeExam,
  evaluateExam,
  evaluateAll
} = require("./src");

const scraped = await scrapeExam("jee-main");

const discovery = evaluateAll(studentProfile);

const bitsat = evaluateExam("bitsat", studentProfile);
```

## Architecture

```text
Official exam sites / PDFs
          |
          v
   source resolver
          |
          v
 HTML + PDF parsers
          |
          v
 evidence extractor
          |
          +--------------------+
          |                    |
          v                    v
 raw scrape output       reviewed 2026 rules
                               |
student profile ----------------+
          |
          v
 explainable eligibility engine
          |
          v
 API / CLI / existing backend
```

The scraper and the rule engine are intentionally separated. A website layout change or a badly parsed PDF must not silently change a student's eligibility decision.

## Source-change detection

Scraped documents include a SHA-256 digest and source metadata. This makes it possible to detect when an official bulletin changes and review the rules before publishing updated eligibility logic.

## Result meaning

- **eligible** — all implemented exam-level checks pass.
- **provisionally_eligible** — appearing/result-pending candidate can proceed, but a future marks/result condition still needs to be met.
- **needs_more_info** — a blocking input required to decide is missing.
- **ineligible** — at least one implemented blocking rule fails.

## Important scope

This project is primarily an **exam-discovery / eligibility-to-appear engine**.

Admission can have additional university, counselling, domicile, reservation, programme, percentile, rank, document, and subject rules. CUET in particular has university/programme-specific eligibility. MHT-CET CAP rules also vary by course and candidature type.

For a production student-facing product, always show the official source next to the result and keep a human-review step when a new bulletin or amendment appears.

## Project structure

```text
src/
  config/
    sources.js
  core/
    extract.js
    html.js
    http.js
    normalize.js
    pdf.js
    resolver.js
    scrape.js
  eligibility/
    evaluate.js
    profile.js
    rules.js
    schema.js
  cli.js
  index.js
  server.js

examples/
  student-profile.json

docs/
  API.md
  INTEGRATION.md

test/
  eligibility.test.js
  extract.test.js
  html.test.js
  resolver.test.js
```

## Adding another exam

Add its official discovery/document source in `src/config/sources.js`, then add a reviewed rule/evaluator in `src/eligibility`.

The scraping layer is generic enough for many bulletin-style HTML/PDF sources; exam-specific eligibility logic stays explicit and testable.

## Docker

```bash
docker build -t exam-eligibility-scraper .
docker run -p 3001:3001 exam-eligibility-scraper
```

## Safety and responsible use

The scraper only reads publicly accessible official sources. It does not bypass logins, CAPTCHAs, access controls, or rate limits.

Eligibility rules can change. Treat the official bulletin and admitting authority as the final source of truth.

## License

MIT
