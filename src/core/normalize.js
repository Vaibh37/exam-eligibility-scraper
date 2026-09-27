function normalizeText(text = "") {
  return String(text)
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ +\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeSnippet(text = "") {
  return String(text).replace(/\s+/g, " ").trim();
}

module.exports = { normalizeText, normalizeSnippet };
