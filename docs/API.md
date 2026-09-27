# API

Start the service:

```bash
npm install
npm run api
```

Default base URL: `http://localhost:3001`.

## Health

```http
GET /health
```

## Exams

```http
GET /api/exams
GET /api/exams/jee-main
```

## Scraping

Scrape one official source:

```http
POST /api/scrape/jee-main
```

Scrape every configured source:

```http
POST /api/scrape
```

The scraper returns source metadata, document hash, extracted evidence and candidate eligibility text. It does not silently rewrite the reviewed rules.

## Eligibility discovery

Get the accepted profile shape and an example:

```http
GET /api/eligibility/schema
```

Get the reviewed rule metadata:

```http
GET /api/eligibility/rules
```

Evaluate all supported exams:

```http
POST /api/eligibility
Content-Type: application/json
```

Body:

```json
{
  "dob": "2008-05-10",
  "nationality": "Indian",
  "category": "GENERAL",
  "pwbd": false,
  "domicileState": "Maharashtra",
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

Evaluate one exam:

```http
POST /api/eligibility/bitsat
```

## Statuses

- `eligible` — all implemented exam-level checks pass.
- `provisionally_eligible` — the student may appear, but a future result/mark requirement still has to be satisfied.
- `needs_more_info` — required profile data is missing.
- `ineligible` — at least one implemented blocking rule fails.

Every response includes individual checks and plain-English reasons so the frontend can show *why* an exam matched or did not match.

## Product guidance

For a student-facing app, the normal flow is:

```text
student form
   ↓
POST /api/eligibility
   ↓
eligible / provisional / missing info / ineligible
   ↓
show reasons + official source
```

Separately, run the scraper periodically to detect source-document changes and review the versioned rules when an official bulletin changes.
