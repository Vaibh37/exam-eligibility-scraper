const test = require("node:test");
const assert = require("node:assert/strict");
const { rankLinks } = require("../src/core/resolver");

test("rankLinks prefers current-year information bulletin PDFs", () => {
  const source = {
    year: "2026",
    candidateTerms: ["information bulletin", "jee main"]
  };

  const links = [
    {
      text: "View",
      context: "JEE Main Information Bulletin 2025",
      url: "https://example.org/jee-2025.pdf"
    },
    {
      text: "View",
      context: "JEE Main Information Bulletin 2026",
      url: "https://example.org/jee-2026.pdf"
    }
  ];

  const ranked = rankLinks(links, source);

  assert.equal(ranked[0].url, "https://example.org/jee-2026.pdf");
});
