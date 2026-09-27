# Integration guide

The scraper is intentionally separate from a student's profile/eligibility engine.

## Option A — import it into an existing Node backend

Clone this repository next to the existing backend or publish/install it as a package later.

```js
const { scrapeExam } = require("./exam-eligibility-scraper/src");

async function refreshJeeMain() {
  const exam = await scrapeExam("jee-main");

  // Store the reviewed result in your own database.
  await Exam.updateOne(
    { id: exam.id },
    { $set: exam },
    { upsert: true }
  );
}
```

## Option B — run it as a small service

```bash
npm run api
```

From another backend:

```js
const response = await fetch(
  "http://localhost:3001/api/scrape/jee-main",
  { method: "POST" }
);

const exam = await response.json();
```

## Recommended production flow

```text
Official site / bulletin
        ↓
     scraper
        ↓
evidence + normalized candidate fields
        ↓
human/admin validation
        ↓
reviewed eligibility rules in database
        ↓
student profile
        ↓
eligibility engine
```

Do not make a final eligibility decision directly from an unreviewed scrape. Official exam rules can contain exceptions, programme-specific conditions, category rules, domicile rules, and changes published after the main bulletin.

## Adding another exam

Add an entry to `src/config/sources.js`.

For most bulletin-style sites you only need:

```js
"example-exam": {
  id: "example-exam",
  name: "Example Exam",
  conductingBody: "Example Authority",
  officialWebsite: "https://example.org/",
  discoveryPage: "https://example.org/bulletins/",
  year: "2026",
  candidateTerms: [
    "information bulletin",
    "example exam",
    "2026"
  ]
}
```

If the official document has a stable direct URL, use:

```js
documentUrl: "https://example.org/brochure.pdf",
documentType: "pdf"
```

The resolver handles PDF links, intermediary document pages, and HTML brochures.
