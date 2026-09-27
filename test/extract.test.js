const test = require("node:test");
const assert = require("node:assert/strict");
const { extractInformation } = require("../src/core/extract");

test("extractInformation keeps eligibility evidence", () => {
  const text = `
    Eligibility Criteria
    Candidates who passed the 12th examination in 2025 or are appearing in
    2026 with Physics, Chemistry and Mathematics may apply. Candidates must
    secure an aggregate of 75% marks in Physics, Chemistry and Mathematics
    and at least 60% in each subject. The application fee is ₹ 1000.
    Applications close on 16 March 2026.
  `;

  const result = extractInformation(text);

  assert.ok(result.eligibility.qualification.length > 0);
  assert.ok(result.eligibility.subjects.length > 0);
  assert.ok(result.eligibility.marks.some(item => item.includes("75%")));
  assert.ok(result.passingYear !== undefined || result.eligibility.passingYear);
  assert.ok(result.fees.some(item => item.includes("1000")));
  assert.ok(result.dates.some(item => /16 March 2026/i.test(item)));
  assert.equal(result.reviewRequired, true);
});
