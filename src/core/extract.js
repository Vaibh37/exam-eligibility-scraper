const { normalizeSnippet } = require("./normalize");

const groups = {
  age: [
    "age criteria",
    "age limit",
    "years of age",
    "date of birth",
    "no age limit"
  ],
  qualification: [
    "qualifying examination",
    "class xii",
    "class 12",
    "12th examination",
    "10+2",
    "senior secondary"
  ],
  subjects: [
    "physics",
    "chemistry",
    "mathematics",
    "biology",
    "compulsory subjects",
    "required subjects"
  ],
  marks: [
    "aggregate",
    "percentage",
    "marks",
    "75%",
    "60%",
    "50%",
    "45%"
  ],
  passingYear: [
    "year of passing",
    "year of appearance",
    "appearing for",
    "passed the 12th",
    "passed class xii",
    "2025",
    "2026"
  ],
  attempts: [
    "number of attempts",
    "attempts",
    "attempt",
    "consecutive years"
  ]
};

function snippetAround(text, index, radius = 260) {
  const start = Math.max(0, index - Math.floor(radius * 0.4));
  const end = Math.min(text.length, index + radius);
  return normalizeSnippet(text.slice(start, end));
}

function collectKeywordSnippets(text, keywords, limit = 6) {
  const lower = text.toLowerCase();
  const results = [];
  const seen = new Set();

  for (const keyword of keywords) {
    let from = 0;
    const needle = keyword.toLowerCase();

    while (results.length < limit) {
      const index = lower.indexOf(needle, from);
      if (index === -1) break;

      const snippet = snippetAround(text, index);
      const fingerprint = snippet.toLowerCase().slice(0, 180);

      if (!seen.has(fingerprint)) {
        seen.add(fingerprint);
        results.push(snippet);
      }

      from = index + needle.length;
    }

    if (results.length >= limit) break;
  }

  return results;
}

function collectRegexSnippets(text, regex, limit = 10) {
  const results = [];
  const seen = new Set();
  let match;

  regex.lastIndex = 0;

  while ((match = regex.exec(text)) && results.length < limit) {
    const snippet = snippetAround(text, match.index, 220);
    const fingerprint = snippet.toLowerCase().slice(0, 180);

    if (!seen.has(fingerprint)) {
      seen.add(fingerprint);
      results.push(snippet);
    }

    if (match.index === regex.lastIndex) regex.lastIndex += 1;
  }

  return results;
}

function extractInformation(text) {
  const eligibility = {};

  for (const [field, keywords] of Object.entries(groups)) {
    eligibility[field] = collectKeywordSnippets(text, keywords);
  }

  const dates = collectRegexSnippets(
    text,
    /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+20\d{2})\b/gi,
    12
  );

  const fees = collectRegexSnippets(
    text,
    /(?:₹\s?[\d,]+(?:\.\d{1,2})?|\b(?:Rs\.?|INR)\s?[\d,]+(?:\.\d{1,2})?)/gi,
    10
  );

  const evidence = [];
  for (const [field, snippets] of Object.entries(eligibility)) {
    for (const snippet of snippets.slice(0, 3)) {
      evidence.push({ field: `eligibility.${field}`, snippet });
    }
  }

  return {
    eligibility,
    dates,
    fees,
    evidence,
    reviewRequired: true
  };
}

module.exports = {
  groups,
  snippetAround,
  collectKeywordSnippets,
  collectRegexSnippets,
  extractInformation
};
